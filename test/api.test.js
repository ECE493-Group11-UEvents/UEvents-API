const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../app');
const expect = chai.expect;
const AWS = require('aws-sdk');

AWS.config.update({
  region: process.env.REGION,
  accessKeyId: process.env.DB_ACCESS_KEY,
  secretAccessKey: process.env.DB_SECRET_ACCESS_KEY,
});

chai.use(chaiHttp);

describe('Signup Endpoint', () => {
    const test_user = {
        "email": "johndoe@g.c",
        "first_name": "john",
        "last_name": "doe",
        "password": "pwd"
    };

    it('Should return 200 and create a new user', (done) => {
        chai.request(app)
            .post('/api/signup')
            .send(test_user)
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.have.property('email');
                expect(res.body).to.have.property('first_name');
                expect(res.body).to.have.property('last_name');
                expect(res.body).to.have.property('password');
                done();
            });
    });

    it('Should return 409 and not create a new user', (done) => {
        chai.request(app)
            .post('/api/signup')
            .send(test_user)
            .end((err, res) => {
                expect(res).to.have.status(409);
                done();
            });
    });

    after((done) => {
        const client = new AWS.DynamoDB();
        const params = {
            TableName: 'Users',
            Key: {
                'email': { 'S': test_user.email }
            }
        };
        client.deleteItem(params, (err, data) => {
            if (err) console.error(err);
            done();
        });
    });
});