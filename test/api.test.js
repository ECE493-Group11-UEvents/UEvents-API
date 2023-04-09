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

const test_user = {
    "email": "johndoe@g.c",
    "first_name": "john",
    "last_name": "doe",
    "password": "pwd"
};

describe('Signup Endpoint', () => {

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
});

describe('Login Endpoint', () => {
    
    it('Should return 200 and login a user', (done) => {
        chai.request(app)
            .post('/api/login')
            .send({
                "email": test_user.email,
                "password": test_user.password
            })
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.have.property('email');
                expect(res.body).to.have.property('first_name');
                expect(res.body).to.have.property('last_name');
                expect(res.body).to.not.have.property('password');
                done();
            });
    });

    it('Should return 401 and not login a user', (done) => {
        chai.request(app)
            .post('/api/login')
            .send({
                "email": "random_email_not_real",
                "password": "random_password_not_real"
            })
            .end((err, res) => {
                expect(res).to.have.status(401);
                done();
            });
    });

    // cleanup test user from database
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

describe('Student Group Endpoints', () => {
    let test_group = {
        "group_id": "100000",
        "group_name": "test group",
        "description": "test description",
        "photo_url": "test photo url"
    };

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
});