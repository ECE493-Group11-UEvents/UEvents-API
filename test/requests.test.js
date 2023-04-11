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

const test_request = {
    "email": "test2",
    "description": "test",
    "group_name": "test",
    "group_id": "35",
}

describe('Request Endpoint', () => {
    it('Should return 200 and create a new request', (done) => {
        chai.request(app)
            .post('/api/requests')
            .send(test_request)
            .end((err, res) => {
                expect(res).to.have.status(200);
                done();
            });
    });

    after((done) => {
        // delete test request
        const dynamoDb = new AWS.DynamoDB.DocumentClient();
        const params = {
            TableName: "Requests",
            Key: {
                "email": {"S": test_request.email},
                "group_id": {"S": test_request.group_id},
            },
        };
        dynamoDb.delete(params, (err, data) => {
            if (err) {
                console.error("Unable to delete item. Error JSON:", JSON.stringify(err, null, 2));
            } else {
                console.log("DeleteItem succeeded:", JSON.stringify(data, null, 2));
            }
        });
        done();
    });
});

describe('view status of request', () => {
    it('Should return 200 and view the status of the request', (done) => {
        chai.request(app)
            .get(`/api/requests/approved`)
            .end((err, res) => {
                expect(res.body.Items).to.be.an('array');
                expect(res).to.have.status(200);
                done();
            });
    });
});
