const { Op } = require("sequelize");
const config = process.env;
const dotenv = require('dotenv').config();
const Validator = require('validatorjs');
const IncomeSource = require('../models').IncomeSource;
const services = require('../services');
const Utilities = services.Utilities;

const incomeSources = {
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
    }
}

module.exports = incomeSources;