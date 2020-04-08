const dotenv = require('dotenv').config();
const app = require('express')();
const http = require('http').Server(app);
const port = process.env.PORT || 3000;

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