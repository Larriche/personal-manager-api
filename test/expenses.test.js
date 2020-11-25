const chai = require('chai');
const expect = chai.expect;
const chaiHttp = require('chai-http');

chai.use(chaiHttp);

const app = require('../app.js');

describe('Expenses listing', () => {
    it ('Returns a 401 when user is not authorised', () => {
        return chai.request(app)
            .get('/api/v1/expenses')
            .send()
            .then(response => {
                expect(response).to.have.status(401);
            })
    });
});