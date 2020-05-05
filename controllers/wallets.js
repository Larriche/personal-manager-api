const { Op } = require("sequelize");
const db = require('../models');
const Wallet = db.Wallet;
const dotenv = require('dotenv').config();
const config = process.env;
const Validator = require('validatorjs');

const wallets = {
    /**
     * Get a listing of user's wallets
     *
     * @param {Object} request Request object
     * @param {Object} response Response object
     * @param {Object} next Next callable in chain
     */
    async index(request, response, next) {

    }
};