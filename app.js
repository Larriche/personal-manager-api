const dotenv = require('dotenv').config();
const app = require('express')();
const http = require('http').Server(app);
const port = process.env.PORT || 3000;
const bodyParser = require('body-parser');

const setupRoutes = require('./routes');

// Pass incoming requests through body parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));

setupRoutes(app);

// Handle 404s
app.use('*', function (req, res, next) {
    res.status(404).json({
        message: 'Route does not exist'
    });
});

// Final error handler
app.use(function (err, req, res, next) {
    console.log(err);

    res.status(err.status || 500).json({
        errors: ['An unknown error occurred']
    });
});

http.listen(port, function () {
    console.log('Express server is listening on port', port);
});