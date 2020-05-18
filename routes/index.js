'use strict';

const express = require("express");
const router = express.Router();
const middlewares = require('../middlewares');

const auth = require('../controllers/auth');
const wallets = require('../controllers/wallets');
const income_sources = require('../controllers/income_sources');

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
}

const setupRouter = function (app) {
    // Set up middlewares on router
    middlewares(router);

    // Make router aware of our routes
    routes(router);

    app.use('/api/v1', router);
};

module.exports = setupRouter;
