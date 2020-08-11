const { Op } = require("sequelize");
const config = process.env;
const dotenv = require('dotenv').config();
const Validator = require('validatorjs');
const SpendingCategory = require('../models').SpendingCategory;
const services = require('../services');
const Utilities = services.Utilities;

const spendingCategories = {
    /**
     * Get a listing of spending categories
     *
     * @param {Object} request The HTTP request
     * @param {Object} response The HTTP response
     * @param {Object} next The next callable
     * @return {Object} The HTTP response
     */
    async index(request, response, next) {
        try {
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

            let spendingCategories =  await SpendingCategory.findAll(query);

            let responseData = spendingCategories;

            if (paginate) {
                let total  = await SpendingCategory.count();
                responseData = Utilities.setPaginationFields(request, { data: spendingCategories }, total);
            }

            return response.status(200).json(responseData);
        } catch (error) {
            error.status = 500;
            next(error);
        }
    },

    /**
     * Add a spending category
     *
     * @param {Object} request The HTTP request
     * @param {Object} response The HTTP response
     * @param {Object} next The next callable
     * @return The HTTP response
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
            let existingCategory = await SpendingCategory.findOne({
                where: {
                    [Op.and]: [{
                        name: request.body.name,
                        userId: request.user.id
                    }]
                }
            });

            if (existingCategory) {
                return response.status(422).json({
                    name: 'This category has already been added'
                });
            }

            let source = await SpendingCategory.create({
                name: request.body.name,
                userId: request.user.id,
                color: request.body.color
            });

            return response.status(201).json(source);
        } catch (error) {
            error.status = 500;
            next(error);
        }
    },

    /**
     * Get a category by id
     *
     * @param {Object} request The HTTP request
     * @param {Object} response The HTTP response
     * @param {Object} The next callable
     * @return {Object} The HTTP response
     */
    async show(request, response, next) {
        try {
            let category = await SpendingCategory.findOne({
                where: {
                    [Op.and]: [{
                        id: request.params.id,
                        userId: request.user.id
                    }]
                }
            });

            if (category) {
                return response.status(200).json(category);
            } else {
                return response.status(404).json({
                    message: 'This spending category was not found'
                });
            }
        } catch (error) {
            error.status = 500;
            next(error);
        }
    },

    /**
     * Update category with the given id
     *
     * @param {Object} request The HTTP request
     * @param {Object} response The HTTP response
     * @param {Object} next The next callable
     * @return {Object} The HTTP response
     */
    async update(request, response, next) {
        try {
            let validator = new Validator(request.body, {
                name: 'required'
            });

            if (!validator.passes()) {
                return response.status(422).json({
                    errors: validator.errors.all()
                });
            }

            let category = await SpendingCategory.findOne({
                [Op.and]: {
                    userId: request.user.id,
                    name: request.body.name
                }
            });

            let similarCategory = await SpendingCategory.findOne({
                where: {
                    [Op.and]: {
                        name: request.body.name,
                        userId: request.user.id,
                        id: {
                            [Op.ne]: request.params.id
                        }
                    }
                }
            });

            if (similarCategory) {
                return response.status(422).json({
                    errors: ['Another category with this name exists']
                });
            }

            await SpendingCategory.update({
                name: request.body.name,
                color: request.body.color
            }, {
                where: {
                    id: request.params.id
                }
            });

            category = await category.reload();

            return response.status(200).json(category);
        } catch (error) {
            error.status = 500;
            next(error);
        }
    },

    /**
     * Delete category with given id
     *
     * @param {Object} r
     */
    async delete(request, response, next) {
        try {
            let category = await SpendingCategory.findOne({
                where: {
                    [Op.and]: {
                        userId: request.user.id,
                        id: request.params.id
                    }
                }
            });

            if (!category) {
                return response.status(404).json({
                    message: 'This spending category was not found'
                });
            }

            await category.destroy();

            return response.status(200).json({})
        } catch (error) {
            error.status = 500;
            next(error);
        }
    }
}

module.exports = spendingCategories;