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
            name: 'required',
            color: ['required', 'regex:/^#(?:[0-9a-fA-F]{3}){1,2}$/']
        });

        if (!validator.passes()) {
            return response.status(422).json({
                errors: validator.errors.all()
            });
        }

        try {
            let existingWallet = await Wallet.findOne({
                where: {
                    [Op.and]: [{
                        name: request.body.name,
                        userId: request.user.id
                    }]
                }
            });

            if (existingWallet) {
                return response.status(422).json({
                    errors: {
                        wallet: ['This wallet already exists']
                    }
                });
            }

            let wallet = await Wallet.create({
                name: request.body.name,
                color: request.body.color,
                userId: request.user.id
            });

            let responseBody = wallet;

            return response.status(201).json(responseBody);
        } catch (error) {
            error.status = 500;
            next(error);
        }
    },

    /**
     * Find a wallet by id and return it
     *
     * @param {Object} request HTTP request object
     * @param {Object} response  HTTP response object
     * @param {*} next Next callable in chain
     */
    async show(request, response, next) {
        try {
            let wallet = await Wallet.findOne({
                where: {
                    [Op.and]: [
                        {
                            id: request.params.id,
                            userId: request.user.id
                        }
                    ]
                }
            });

            if (!wallet) {
                return response.status(404).json({
                    message: 'Wallet was not found',
                })
            }

            return response.status(200).json(wallet);
        } catch (error) {
            error.status = 500;
            next(error);
        }
    },

    /**
     * Update a wallet with new data
     *
     * @param {Object} request The HTTP request
     * @param {Object} response The HTTP response
     * @param {*} next Next callable in chain
     */
    async update(request, response, next) {
        let validator = new Validator(request.body, {
            name: 'required',
            color: ['required', 'regex:/^#(?:[0-9a-fA-F]{3}){1,2}$/']
        });

        if (!validator.passes()) {
            return response.status(422).json({
                errors: validator.errors.all()
            })
        }

        try {
            let wallet = await Wallet.findOne({
                where: {
                    [Op.and]: [
                        {
                            id: request.params.id,
                            userId: request.user.id
                        }
                    ]
                }
            });

            if (!wallet) {
                return response.status(404).json({
                    message: "Wallet was not found in user's wallets"
                })
            }

            await Wallet.update({
                name: request.body.name,
                color: request.body.color
            },{
                where: {
                    id: request.params.id
                }
            });

            wallet = await wallet.reload();

            return response.status(200).json(wallet);
        } catch (error) {
            error.status = 500;
            next(error);
        }
    },

    /**
     * Remove a wallet from user's wallet
     *
     * @param {Object} request The HTTP request
     * @param {Object} response The HTTP response
     * @param {*} next Next callable in chain
     */
    async delete(request, response, next) {
        try {
            let wallet = await Wallet.findOne({
                where: {
                    [Op.and]: [{
                        id: request.params.id,
                        userId: request.user.id
                    }]
                }
            });

            if (!wallet) {
                return response.status(404).json({
                    message: "Wallet was not found in user's wallets"
                });
            }

            await wallet.destroy();

            return response.status(200).json({});
        } catch (error) {
            error.status = 500;
            next(error);
        }
    }
};

module.exports = wallets;