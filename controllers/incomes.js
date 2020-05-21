const { Op } = require("sequelize");
const config = process.env;
const dotenv = require('dotenv').config();
const Validator = require('validatorjs');
const Income = require('../models').Income;
const services = require('../services');
const Utilities = services.Utilities;

const incomes = {
    /**
     * Get a listing of incomes
     *
     * @param {Object} request The HTTP request
     * @param {Object} response The HTTP response
     * @param {Object} next The next item in the callable
     */
    async index(request, response, next) {
        try {
            let pagination = Utilities.getPaginationParams(request.query);
            let paginate = request.query.hasOwnProperty('per_page');
            let orderBy = request.query.hasOwnProperty('order_field') ? request.query.order_field : 'timeReceived';
            let ranking = request.query.hasOwnProperty('ranking') ? request.query.ranking : 'DESC';

            let comparisons = {
                userId: request.user.id
            };

            if (request.query.hasOwnProperty('income_source_id')) {
                comparisons['incomeSourceId'] = request.query.income_source_id;
            }

            if (request.query.hasOwnProperty('wallet_id')) {
                comparisons['walletId'] = request.query.wallet_id;
            }

            let query = {
                where: {
                    [Op.and]: comparisons
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

            let incomes = await Income.findAll(query);
            let responseData = incomes;

            if (paginate) {
                let total = await Income.count();
                responseData = Utilities.setPaginationFields(request, { data: incomes }, total);
            }

            return response.status(200).json(responseData);
        } catch (error) {
            error.status = 500;
            next(error);
        }
    }
}

module.exports = incomes;