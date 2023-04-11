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

const test_group = {
    "group_id": "10000",
    "group_name": "Biochemistry Club",
    "description": "We are the Biochem club! We do cool stuff",
    "photo_url": "https://uevents-s3.s3.us-east-2.amazonaws.com/default_user_photo.jpg"
};

describe('Student Group Endpoints', () => {
    before(async () => {
        // create test student group
        const client = new AWS.DynamoDB();
        await client.putItem({
            TableName: "StudentGroups",
            Item: {
                "group_id": {"N": test_group.group_id},
                "group_name": {"S": test_group.group_name},
                "description": {"S": test_group.description},
                "group_photo": {"S": test_group.photo_url},
            },            
        }).promise();
    });

    it('Should return 200 and edit a new student group', (done) => {
        chai.request(app)
            .post(`/api/studentGroups/edit/${test_group.group_id}`)
            .send(test_group)
            .end((err, res) => {
                expect(res).to.have.status(200);
                done();
            });
    });

    it('Should return 200 and get a student group', (done) => {
        chai.request(app)
            .get(`/api/studentGroups/${test_group.group_id}`)
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.have.property('group_id');
                expect(res.body).to.have.property('group_name');
                expect(res.body).to.have.property('description');
                expect(res.body).to.have.property('group_photo');
                done();
            });
    });

    it('Should return 200 and get a student group name', (done) => {
        chai.request(app)
            .get(`/api/studentGroups/${test_group.group_id}/name`)
            .end((err, res) => {
                console.log(res.body)
                expect(res).to.have.status(200);
                expect(res.body).to.have.property('S');
                done();
            });
    });

    it('Should return 200 and get student groups', (done) => {
        chai.request(app)
            .get('/api/studentGroups')
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body.Items).to.be.an('array');
                expect(res.body.Items[0]).to.have.property('group_id');
                expect(res.body.Items[0]).to.have.property('group_name');
                expect(res.body.Items[0]).to.have.property('description');
                expect(res.body.Items[0]).to.have.property('group_photo');
                done();
            });
    });

    after((done) => {
        // delete test student group
        const client = new AWS.DynamoDB();
        const params = {
            TableName: "StudentGroups",
            Key: {
                "group_id": {"N": test_group.group_id},
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