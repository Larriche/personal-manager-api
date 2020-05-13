const { Op } = require("sequelize");
const config = process.env;
const dotenv = require('dotenv').config();
const Validator = require('validatorjs');
const Wallet = require('../models').Wallet;
const services = require('../services');
const Utilities = services.Utilities;

const wallets = {
    /**
     * Get a listing of user's wallets
     *
     * @param {Object} request Request object
     * @param {Object} response Response object
     * @param {Object} next Next callable in chain
     */
    async index(request, response, next) {
        let pagination = Utilities.getPaginationParams(request.query);
        let paginate = request.query.hasOwnProperty('per_page');
        let orderBy = request.query.hasOwnProperty('order_field') ? request.query.order_field : 'name';
        let ranking = request.query.hasOwnProperty('ranking') ? request.query.ranking : 'ASC';

        let query = {
            where: {
                userId: {
                    [Op.eq]: request.user.id
                }
            },
            order: [
                [orderBy, ranking]
            ]
        };

        if (paginate) {
            query = {
                ...query,
                ...pagination
            }
        }

        let wallets = await Wallet.findAll(query);

        let responseData = wallets;
        let total = await Wallet.count();

        if (paginate) {
            responseData = Utilities.setPaginationFields(request, { data: wallets }, total);
        }

        return response.status(200).json(responseData);
    },

    /**
     * Add a new wallet for a user
     *
     * @param {Object} request Request object
     * @param {Object} response Response object
     * @param {*} next Next callable in chain
     */
    async store(request, response, next) {
        let validator = new Validator(request.body, {
            name: 'required'
        });

        if (!validator.passes()) {
            return response.status(422).json({
                errors: validator.errors.all()
            });
        }

        try {
            let existingWallet = await Wallet.findOne({
                where: {
                    name: {
                        [Op.eq]: request.body.name
                    }
                }
            });

            if (existingWallet) {
                return response.status(422).json({
                    errors: {
                        email: 'This wallet already exists'
                    }
                });
            }

            let wallet = await Wallet.create({
                name: request.body.name,
                userId: request.user.id
            });

            let responseBody = wallet;

            return response.status(200).json(responseBody);
        } catch (error) {
            error.status = 500;
            next(error);
        }
    }
};

module.exports = wallets;