const { Op } = require("sequelize");
const db = require('../models');
const User = db.User;
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv').config();
const config = process.env;
const Validator = require('validatorjs');
const jwtSecret = config.JWT_SECRET.toString().trim();

const auth = {
    /**
      * Sign a user up
      *
      * @param {Object} request Request object
      * @param {Object} response Response object
      * @param {Object} next Next callable in chain
      */
    async register(request, response, next) {
        // Set up validator for request input
        let validator = new Validator(request.body, {
            name: 'required',
            email: 'required|email',
            password: 'required|confirmed|min:6'
        });

        let userData = {
            email: request.body.email,
            name: request.body.name,
            password: request.body.password
        };

        if (validator.passes()) {
            try {
                let existingUser = await User.findOne({
                    where: {
                        email: {
                            [Op.eq]: userData.email
                        }
                    }
                });

                if (existingUser) {
                    return response.status(422).json({
                        errors: {
                            email: 'Email has already been registered'
                        }
                    });
                }

                let user = await User.create(userData);

                let responseBody = {
                    status: 'success',
                    user: {
                        name: user.name,
                        email: user.email
                    }
                };

                return response.status(200).json(responseBody);
            } catch (error) {
                error.status = 500;
                next(error);
            }
        } else {
            return response.status(422).json({
                errors: validator.errors.all()
            });
        }
    },

    /**
     * Log in a use
     *
     * @param {Object} request Request object
     * @param {Object} response Response object
     * @param {Object} next Next callable in chain
     */
    async login(request, response, next) {
    }
};

module.exports = auth;