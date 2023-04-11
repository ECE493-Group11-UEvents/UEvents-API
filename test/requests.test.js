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
    "email": "test",
    "description": "test",
    "group_name": "test",
}

describe('Request Endpoint', () => {
    it('Should return 200 and create a new request', (done) => {
        chai.request(app)
            .post('/api/requests')
            .send(test_request)
            .end((err, res) => {
                console.log(res.body);
                expect(res).to.have.status(200);
                expect(res.body).to.have.property('email');
                expect(res.body).to.have.property('description');
                expect(res.body).to.have.property('group_name');
                expect(res.body).to.have.property('group_id');
                test_request.group_id = res.body.group_id;
                done();
            });
    });

    it("Approve the request and return 200", (done) => {
        chai.request(app)
            .put(`/api/requests/approve`)
            .send({
                "group_id": test_request.group_id,
                "email": test_request.email,
                "notification": false,
            })
            .end((err, res) => {
                expect(res).to.have.status(200);
                const client = new AWS.DynamoDB();
                const params = {
                    TableName: "Requests",
                    Key: {
                        "email": {"S": test_request.email},
                        "group_id": {"N": test_request.group_id},
                    },
                };
                client.getItem(params, (err, data) => {
                    if (err) {
                        console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
                    }
                    expect(data.Item.decision?.S).to.equal("approved");
                    done();
                });
            });
    });

    it("Reject the request and return 200", (done) => {
        chai.request(app)
            .put(`/api/requests/reject`)
            .send({
                "group_id": test_request.group_id,
                "email": test_request.email,
                "notification": false,
            })
            .end((err, res) => {
                expect(res).to.have.status(200);
                const client = new AWS.DynamoDB();
                const params = {
                    TableName: "Requests",
                    Key: {
                        "email": {"S": test_request.email},
                        "group_id": {"N": test_request.group_id},
                    },
                };
                client.getItem(params, (err, data) => {
                    if (err) {
                        console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
                    }
                    expect(data.Item.decision?.S).to.equal("rejected");
                    done();
                });
            });
    });

    after((done) => {
        // delete test request
        const client = new AWS.DynamoDB();
        const params = {
            TableName: "Requests",
            Key: {
                "email": {"S": test_request.email},
                "group_id": {"N": test_request.group_id},
            },
        };
        client.deleteItem(params, (err, data) => {
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
