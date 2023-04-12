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

const user = {
    "follower_email": "johndoe@gmail.com",
};

describe('Follow Group Endpoint', () => {
    it('Should return 200 and follow a group', (done) => {
        chai.request(app)
            .post('/api/followGroup/0/follow')
            .send(user)
            .end((err, res) => {
                expect(res).to.have.status(200);
                done();
            });
    });

    it('Should return 200 and unfollow a group', (done) => {
        chai.request(app)
            .delete('/api/followGroup/0/unfollow')
            .send(user)
            .end((err, res) => {
                expect(res).to.have.status(200);
                done();
            });
    });

    it('Should return 200 and return following groups', (done) => {
        chai.request(app)
            .get('/api/followGroup/user/test@gmail.com')
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body.Items).to.be.an('array');
                done();
            });
    });

    it('Should return 200 and return following groups', (done) => {
        chai.request(app)
            .get('/api/followGroup/user/test@gmail.com/names')
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body.Responses.StudentGroups).to.be.an('array');
                done();
            });
    });

    it('Should return 200 and return followers of a group', (done) => {
        chai.request(app)
            .get('/api/followGroup/0')
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body.Items).to.be.an('array');
                done();
            });
    });

});