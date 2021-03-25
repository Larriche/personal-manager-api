const { Op } = require("sequelize");
const config = process.env;
const dotenv = require('dotenv').config();
const Validator = require('validatorjs');
const Wallet = require('../models').Wallet;
const Income = require('../models').Income;
const Expense = require('../models').Expense;
const IncomeSource = require('../models').IncomeSource;
const SpendingCategory = require('../models').SpendingCategory;
const services = require('../services');
const Utilities = services.Utilities;
const db = require('../models');

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
    },

    /**
     * Transfer money from one wallet to another
     *
     * @param {Object} request The HTTP request
     * @param {Object} response The HTTP response
     * @param {*} next Next callable in chain
     */
    async doTransfer(request, response, next) {
        try {
            let validator = new Validator(request.body, {
                amount: 'required|numeric',
                destination_id: 'required|numeric',
                source_id: 'required|numeric'
            });

            if (!validator.passes()) {
                return response.status(422).json({
                    errors: validator.errors.all()
                })
            }

            let errors = [];

            let destinationWallet = await Wallet.findOne({
                where: {
                    [Op.and]: {
                        id: request.body.destination_id,
                        userId: request.user.id
                    }
                }
            });

            let sourceWallet = await Wallet.findOne({
                where: {
                    [Op.and]: {
                        id: request.body.source_id,
                        userId: request.user.id
                    }
                }
            });

            if (!destinationWallet) {
                errors.push('The destination wallet was not found for the user');
            }

            if (!sourceWallet) {
                errors.push('The source wallet was not found for the user');
            }

            if (errors.length) {
                return response.status(422).json({
                    errors: errors
                })
            }

            await sourceWallet.reload();
            await destinationWallet.reload();

            let sourceMoney = Number.parseFloat(sourceWallet.balance) - Number.parseFloat(request.body.amount);
            let destinationMoney = Number.parseFloat(destinationWallet.balance) + Number.parseFloat(request.body.amount);

            await db.sequelize.transaction(async (transaction) => {
                // Update source wallet balance
                await Wallet.update({
                    balance: sourceMoney
                }, {
                    where: {
                        id: request.body.source_id
                    },
                    transaction
                });

                // Update destination wallet balance
                await Wallet.update({
                    balance: destinationMoney
                }, {
                    where: {
                        id: request.body.destination_id
                    },
                    transaction
                });

                // Create an expenses entry
                let transferCategory = await SpendingCategory.findOne({
                    where: {
                        name: 'Transfers'
                    }
                });

                if (!transferCategory) {
                    throw new Error('Transfers expense category not found');
                }

                expense = await Expense.create({
                    spendingCategoryId: transferCategory.id,
                    walletId: request.body.source_id,
                    timeMade: new Date(),
                    userId: request.user.id,
                    description: `Transfer to ${sourceWallet.name}`,
                    amount: request.body.amount
                }, {
                    transaction
                });

                // Create an income entry
                transferCategory = await IncomeSource.findOne({
                    where: {
                        name: 'Transfers'
                    }
                });

                if (!transferCategory) {
                    throw new Error('Transfers income category not found')
                }

                income = await Income.create({
                    incomeSourceId: transferCategory.id,
                    walletId: request.body.destination_id,
                    timeReceived: new Date(),
                    userId: request.user.id,
                    amount: request.body.amount,
                    description: `Transfer from ${sourceWallet.name}`
                }, {
                    transaction
                });
            });

            return response.status(200).json({
                message: 'Transfer completed'
            });
        } catch (error) {
            error.status = 500;
            next(error);
        }
    }
};

module.exports = wallets;