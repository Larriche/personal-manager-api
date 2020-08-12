const { Op } = require("sequelize");
const config = process.env;
const dotenv = require('dotenv').config();
const Validator = require('validatorjs');
const Income = require('../models').Income;
const Wallet = require('../models').Wallet;
const IncomeSource = require('../models').IncomeSource;
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
                ],
                include: [{
                    model: Wallet,
                    as: 'wallet'
                },{
                    model: IncomeSource,
                    as: 'income_source'
                }]
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
    },

    /**
     * Add an income transaction
     *
     * @param {Object} request The HTTP request
     * @param {Object} response The HTTP response
     * @param {Object} next The next callable
     */
    async store(request, response, next) {
        try {
            let validator = new Validator(
                request.body, {
                    income_source_id: 'required|numeric',
                    wallet_id: 'required|numeric',
                    time_received: 'required|date',
                    amount: 'required|numeric'
            });

            if (!validator.passes()) {
                return response.status(422).json({
                    errors: validator.errors.all()
                })
            }

            let wallet = await Wallet.findOne({
                where: {
                    [Op.and]: {
                        id: request.body.wallet_id,
                        userId: request.user.id
                    }
                }
            });

            if (!wallet) {
                return response.status(422).json({
                    errors: ['The specified wallet was not found']
                });
            }

            let incomeSource = await IncomeSource.findOne({
                where: {
                    [Op.and]: {
                        id: request.body.income_source_id,
                        userId: request.user.id
                    }
                }
            })

            if (!incomeSource) {
                return response.status(422).json({
                    errors: ['The specified income source was not found']
                });
            }

            let income = await Income.create({
                incomeSourceId: request.body.income_source_id,
                walletId: request.body.wallet_id,
                timeReceived: request.body.time_received,
                userId: request.user.id,
                amount: request.body.amount
            });

            return response.status(200).json(income);
        } catch (error) {
            error.status = 500;
            next(error);
        }
    },

    /**
     * Get an income entry by id
     *
     * @param {Object} request The HTTP request
     * @param {Object} response The HTTP response
     * @param {Object} next The next callable
     */
    async show(request, response, next) {
        try {
            let income = await Income.findOne({
                where: {
                    [Op.and]: [{
                        id: request.params.id,
                        userId: request.user.id
                    }]
                }
            });

            if (!income) {
                return response.status(404).json({
                    message: "This income entry was not found in the user's income entries."
                })
            }

            return response.status(200).json(income);
        } catch (error) {
            error.status = 500;
            return next(error);
        }
    },

    /**
     * Update an income entry
     *
     * @param {Object} request The HTTP request
     * @param {Object} response The HTTP response
     * @param {Object} next The next callable
     */
    async update(request, response, next) {
        try {
            let income = await Income.findOne({
                where: {
                    [Op.and]: {
                        id: request.params.id,
                        userId: request.user.id
                    }
                }
            });

            if (!income) {
                return response.status(404).json({
                    message: "This income entry was not found in the user's incomes"
                })
            }

            let validator = new Validator(
                request.body, {
                    income_source_id: 'required|numeric',
                    wallet_id: 'required|numeric',
                    time_received: 'required|date',
                    amount: 'required|numeric'
            });

            if (!validator.passes()) {
                return response.status(422).json({
                    errors: validator.errors.all()
                });
            }

            let wallet = await Wallet.findOne({
                where: {
                    [Op.and]: {
                        id: request.body.wallet_id,
                        userId: request.user.id
                    }
                }
            });

            if (!wallet) {
                return response.status(422).json({
                    errors: ['The specified wallet was not found']
                });
            }

            let incomeSource = await IncomeSource.findOne({
                where: {
                    [Op.and]: {
                        id: request.body.income_source_id,
                        userId: request.user.id
                    }
                }
            });

            if (!incomeSource) {
                return response.status(422).json({
                    errors: ['The specified income source was not found']
                });
             }

            await Income.update({
                incomeSourceId: request.body.income_source_id,
                walletId: request.body.wallet_id,
                timeReceived: request.body.time_received,
                userId: request.user.id,
                amount: request.body.amount
            }, {
                where: {
                    id: request.params.id
                }
            });

            income = await income.reload();

            return response.status(200).json(income);
        } catch (error) {
            error.status = 500;
            return next(error);
        }
    }
}

module.exports = incomes;