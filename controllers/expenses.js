const { Op } = require("sequelize");
const config = process.env;
const dotenv = require('dotenv').config();
const Validator = require('validatorjs');
const Expense = require('../models').Expense;
const Wallet = require('../models').Wallet;
const SpendingCategory = require('../models').SpendingCategory;
const services = require('../services');
const Utilities = services.Utilities;
const db = require('../models');

const expenses = {
    /**
     * Get a listing of all expenses
     *
     * @param {Object} request The HTTP request
     * @param {Object} response The HTTP response
     * @param {Object} next The next callable
     */
    async index(request, response, next) {
        try {
            let pagination = Utilities.getPaginationParams(request.query);
            let paginate = request.query.hasOwnProperty('per_page');
            let orderBy = request.query.hasOwnProperty('order_field') ? request.query.order_field : 'timeMade';
            let ranking = request.query.hasOwnProperty('ranking') ? request.query.ranking : 'DESC';

            let comparisons = {
                userId: request.user.id
            };

            if (request.query.hasOwnProperty('spending_category_id')) {
                comparisons['spendingCategoryId'] = request.query.spending_category_id;
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
                }, {
                    model: SpendingCategory,
                    as: 'spending_category'
                }]
            };

            if (paginate) {
                query = {
                    ...query,
                    ...pagination
                }
            }

            let expenses = await Expense.findAll(query);
            let responseData = expenses;

            if (paginate) {
                let total = await Expense.count();

                responseData = Utilities.setPaginationFields(request, {
                    data: expenses
                }, total);
            }

            return response.status(200).json(responseData);
        } catch (error) {
            error.status = 500;
            next(error);
        }
    },

    /**
     * Save a new expense log
     *
     * @param {Object} request The HTTP request
     * @param {Object} response The HTTP response
     * @param {*} next The next callable
     */
    async store(request, response, next) {
        try {
            let validator = new Validator(request.body, {
                spending_category_id: 'required|numeric',
                wallet_id: 'required|numeric',
                time_made: 'required|date',
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

            let spendingCategory = await SpendingCategory.findOne({
                where: {
                    [Op.and]: {
                        id: request.body.spending_category_id,
                        userId: request.user.id
                    }
                }
            });

            if (!spendingCategory) {
                return response.status(422).json({
                    errors: ['The specified spending category was not found']
                });
            }

            let expense;

            await db.sequelize.transaction(async (t) => {
                expense = await Expense.create({
                    spendingCategoryId: request.body.spending_category_id,
                    walletId: request.body.wallet_id,
                    timeMade: request.body.time_made,
                    userId: request.user.id,
                    amount: request.body.amount
                });

                await wallet.reload();

                let walletBalance = Number.parseFloat(wallet.balance) - Number.parseFloat(request.body.amount);

                await Wallet.update({
                    balance: walletBalance
                }, {
                    where: {
                        id: request.body.wallet_id
                    }
                });
            });

            return response.status(200).json(expense);
        } catch (error) {
            error.status = 500;
            next(error);
        }
    },

    /**
     * Get an expense log by id
     *
     * @param {Object} request The HTTP request
     * @param {Object} response The HTTP response
     * @param {*} next The next callable
     */
    async show(request, response, next) {
        try {
            let expense = await Expense.findOne({
                where: {
                    [Op.and]: [{
                        id: request.params.id,
                        userId: request.user.id
                    }]
                },
                include: [{
                    model: Wallet,
                    as: 'wallet'
                }, {
                    model: SpendingCategory,
                    as: 'spending_category'
                }]
            });

            if (!expense) {
                return response.status(404).json({
                    message: "This expense entry was not found in the user's expense entries."
                })
            }

            return response.status(200).json(expense);
         } catch (error) {
             error.status = 500;
             return next(error);
         }
    },

    /**
     * Update the given expense log
     *
     * @param {Object} request The HTTP request
     * @param {Object} response The HTTP response
     * @param {*} next The next callable
     */
    async update(request, response, next) {
        try {
            let expense = await Expense.findOne({
                where: {
                    [Op.and]: {
                        id: request.params.id,
                        userId: request.user.id
                    }
                }
            });

            if (!expense) {
                return response.status(404).json({
                    message: "This expense entry was not found in the user's expenses"
                })
            }

             let validator = new Validator(
                request.body, {
                    spending_category_id: 'required|numeric',
                    wallet_id: 'required|numeric',
                    time_made: 'required|date',
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

            let spendingCategory = await SpendingCategory.findOne({
                where: {
                    [Op.and]: {
                        id: request.body.spending_category_id,
                        userId: request.user.id
                    }
                }
            });

            if (!spendingCategory) {
                return response.status(422).json({
                    errors: ['The specified spending category was not found']
                });
            }

            await db.sequelize.transaction(async (t) => {
                let currentAmount = Number.parseFloat(expense.amount);
                let newAmount = Number.parseFloat(request.body.amount);
                let walletBalance;

                await wallet.reload();

                if (newAmount > currentAmount) {
                    walletBalance = Number.parseFloat(wallet.balance) - (newAmount - currentAmount);
                } else if (newAmount == currentAmount) {
                    walletBalance = Number.parseFloat(wallet.balance);
                } else {
                    walletBalance = Number.parseFloat(wallet.balance) + (currentAmount - newAmount);
                }

                await Expense.update({
                    spendingCategoryId: request.body.spending_category_id,
                    walletId: request.body.wallet_id,
                    timeMade: request.body.time_made,
                    userId: request.user.id,
                    amount: request.body.amount
                }, {
                    where: {
                        id: request.params.id
                    }
                });

                await Wallet.update({
                    balance: walletBalance
                }, {
                    where: {
                        id: request.body.wallet_id
                    }
                });
            });

            expense = await expense.reload();

            return response.status(200).json(expense);
        } catch (error) {
            error.status = 500;
            next(error);
        }
    },

    /**
     * Delete the given expense log
     *
     * @param {Object} request The HTTP request
     * @param {Object} response The HTTP response
     * @param {*} next The next callabe
     */
    async delete(request, response, next) {

    },

    /**
     * Remove an income record
     *
     * @param {Object} request The HTTP request
     * @param {Object} response The HTTP response
     * @param {*} next Next callable in chain
     */
    async delete(request, response, next) {
        try {
            let expense = await Expense.findOne({
                where: {
                    [Op.and]: [{
                        id: request.params.id,
                        userId: request.user.id
                    }]
                }
            });

            if (!expense) {
                return response.status(404).json({
                    message: "This expense record was not found"
                });
            }

            await db.sequelize.transaction(async (t) => {
                let wallet = await Wallet.findOne({
                    where: {
                        id: expense.walletId
                    }
                });

                let walletBalance = Number.parseFloat(wallet.balance) - Number.parseFloat(expense.amount);

                await expense.destroy();

                await Wallet.update({
                    balance: walletBalance
                }, {
                    where: {
                        id: expense.walletId
                    }
                });
            });

            return response.status(200).json({});
        } catch (error) {
            error.status = 500;
            next(error);
        }
    },
}

module.exports = expenses;