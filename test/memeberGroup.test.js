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

describe('Memeber Group Endpoint', () => {

    it('Should return 200 and fetch an array of groups user is a member of', (done) => {
        chai.request(app)
            .get('/api/memberGroups/syjiao@ualberta.ca')
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body.Items).to.be.an('array');
                done();
            });
    });

    it('Should return 200 and fetch the event coordinators of a group', (done) => {
        chai.request(app)
            .get('/api/memberGroups/group_members/0')
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.be.an('array');
                done();
            });
    });

    it('Should return 200 and fetch the event coordinators of a group', (done) => {
        chai.request(app)
            .delete('/api/memberGroups/sajad@ualberta.com/0')
            .end((err, res) => {
                expect(res).to.have.status(200);
                done();
            });
    });

});