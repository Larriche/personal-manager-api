const { Op } = require("sequelize");
const config = process.env;
const dotenv = require('dotenv').config();
const Validator = require('validatorjs');
const IncomeSource = require('../models').IncomeSource;
const services = require('../services');
const Utilities = services.Utilities;

const incomeSources = {
    /**
     * Get a listing of income sources
     *
     * @param {Object} request The HTTP request
     * @param {Object} response The HTTP response
     * @param {Object} next The next callable in the chain
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

        let income_sources = await IncomeSource.findAll(query);

        let responseData = income_sources;
        let total = await IncomeSource.count();

        if (paginate) {
            responseData = Utilities.setPaginationFields(request, {
                data: income_sources
            }, total);
        }

        return response.status(200).json(responseData);
    },

    /**
     *
     * @param {Object} request The HTTP request
     * @param {Object} response The HTTP response
     * @param {Object} next The next callable
     */
    async store(request, response, next) {
        let validator = new Validator(request.body, {
            name: 'required'
        });

        if (!validator.passes()) {
            return response.status(422).json({
                errors: validator.errors.all()
            })
        }

        try {
            let existingSource = await IncomeSource.findOne({
                where: {
                    [Op.and]: [{
                        name: request.body.name,
                        userId: request.user.id
                    }]
                }
            });

            if (existingSource) {
                return response.status(422).json({
                    name: 'This income source has already been added'
                });
            }

            let source = await IncomeSource.create({
                name: request.body.name,
                userId: request.user.id
            });

            return response.status(200).json(source);
        } catch (error) {
            error.status = 500;
            next(error);
        }
    }
}

module.exports = incomeSources;