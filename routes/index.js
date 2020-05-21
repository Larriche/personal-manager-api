'use strict';

const express = require("express");
const router = express.Router();
const middlewares = require('../middlewares');

const auth = require('../controllers/auth');
const wallets = require('../controllers/wallets');
const income_sources = require('../controllers/income_sources');
const spending_categories = require('../controllers/spending_categories');
const incomes = require('../controllers/incomes');

function routes(router) {
    router.post('/auth/register', auth.register);
    router.post('/auth/login', auth.login);

    // Wallets routes
    router.get('/wallets', wallets.index);
    router.post('/wallets', wallets.store);
    router.get('/wallets/:id', wallets.show);
    router.put('/wallets/:id', wallets.update);
    router.delete('/wallets/:id', wallets.delete);

    // Income sources routes
    router.get('/income_sources', income_sources.index);
    router.post('/income_sources', income_sources.store);
    router.get('/income_sources/:id', income_sources.show);
    router.put('/income_sources/:id', income_sources.update);
    router.delete('/income_sources/:id', income_sources.delete);

    // Spending categories routes
    router.get('/spending_categories', spending_categories.index);
    router.post('/spending_categories', spending_categories.store);
    router.get('/spending_categories/:id', spending_categories.show);
    router.put('/spending_categories/:id', spending_categories.update);
    router.delete('/spending_categories/:id', spending_categories.delete);

    // Incomes routes
    router.get('/incomes', incomes.index);
}

const setupRouter = function (app) {
    // Set up middlewares on router
    middlewares(router);

    // Make router aware of our routes
    routes(router);

    app.use('/api/v1', router);
};

module.exports = setupRouter;
