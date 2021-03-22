const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

module.exports = {
   "development": {
        "username": process.env.DB_USERNAME,
        "password": process.env.DB_PASSWORD,
        "database": process.env.DB_NAME,
        "host": process.env.DB_HOST,
        "dialect": "mysql",
        "operatorsAliases": 1
   },
   "test": {
       "username": '',
       "password": '',
       "storage": path.join(__dirname, '..', 'testdb.sqlite'),
       "host": 'localhost',
       "dialect": 'sqlite',
       "logging": console.log
   }
}
