const dotenv = require('dotenv').config();
const config = process.env;
const jwt = require('jsonwebtoken');
const secret = config.JWT_SECRET.toString().trim();

const verifyAuthentication = function (request, response, next) {
    var authorization = request.headers['authorization'] ? request.headers['authorization'] : request.headers['Authorization'];

    if (!authorization) return response.status(401).json({ auth: false, message: 'No token provided.' });

    var tokenParts = authorization.split(' ');
    var token = tokenParts[tokenParts.length - 1];

    if (!token) return response.status(401).json({ auth: false, message: 'No token provided.' });

    jwt.verify(token, secret, function (err, decoded) {
        console.log(err);
        if (err) return response.status(401).json({ auth: false, message: 'Failed to authenticate token.' });

        request.user = {
            id: decoded.id
        };

        next();
    });
};

module.exports = verifyAuthentication;
