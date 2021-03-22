const chai = require('chai');
const expect = chai.expect;
const chaiHttp = require('chai-http');
const dotenv = require('dotenv');
const Expense = require('../models').Expense;

dotenv.config();

chai.use(chaiHttp);

const app = require('../app.js');

describe('Expenses listing', () => {
    it ('Returns a 401 when user is not authorised', async () => {
        expense = await Expense.create({
            spendingCategoryId: 1,
            walletId: 1,
            timeMade: '2020-09-11',
            userId: 1,
            description: 'description',
            amount: 500
        });

        return chai.request(app)
            .get('/api/v1/expenses')
            .send()
            .then(response => {
                expect(response).to.have.status(401);
            })
    });
});