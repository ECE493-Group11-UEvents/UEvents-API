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

const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'test.jpg');
const file = fs.readFileSync(filePath);
const photo = {
  value: file,
  options: {
    filename: 'test.jpg',
    contentType: 'image/jpeg'
  }
};

const test_user = {
    "email": "johndoe@gmail.com",
    "first_name": "john",
    "last_name": "doe",
    "password": "pwd"
};

const edit_photo = {
    "email": "sam1234@gmail.com",
    "photo": photo
}

const edit_user = {
    "email": "sam1234@gmail.com",
    "first_name": "not sam",
    "last_name": "not smith",
};

const follow_user = {
    "followee_email": "johndoe@gmail.com",
    "follower_email": "sam1234@gmail.com"
}

describe('Profile Endpoint', () => {

    it('Should return 200 and fetch the profile', (done) => {
        chai.request(app)
            .get(`/api/profile/${test_user.email}`)
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.be.an('array');
                expect(res.body).to.have.lengthOf(7);

                // checking the user details
                expect(res.body[0]).to.have.property('Item');
                expect(res.body[0].Item).to.have.property('profile_picture');
                expect(res.body[0].Item.first_name.S).to.equal(test_user.first_name);
                expect(res.body[0].Item.last_name.S).to.equal(test_user.last_name);
                expect(res.body[0].Item.email.S).to.equal(test_user.email);
                expect(res.body[4]).to.be.an('array');
                expect(res.body[5]).to.equal(true);
                expect(res.body[6]).to.equal(true);
                done();
            });
    });

    it('Should return 200 and send follow request to the user', (done) => {
        chai.request(app)
            .post('/api/profile/follow')
            .send(follow_user)
            .end((err, res) => {
                expect(res).to.have.status(200);
                done();
            });
    });

    it('Should return 200 and accept the follow request', (done) => {
        chai.request(app)
            .post('/api/profile/accept')
            .send(follow_user)
            .end((err, res) => {
                expect(res).to.have.status(200);
                done();
            });
    });


    it('Should return 200 and unfollow the follower', (done) => {
        chai.request(app)
            .delete('/api/profile/unfollow')
            .send(follow_user)
            .end((err, res) => {
                expect(res).to.have.status(200);
                done();
            });
    });

    it('Should return 200 and edit the profile', (done) => {
        chai.request(app)
            .put('/api/profile/edit')
            .send(edit_user)
            .end((err, res) => {
                expect(res).to.have.status(200);
                done();
            });
    });

    it('Should return 200 and edit the profile picture', (done) => {
        chai.request(app)
            .put('/api/profile/edit_picture')
            .set('Content-Type', 'multipart/form-data')
            .field('email', edit_photo.email)
            .attach('photo', edit_photo.photo)
            .end((err, res) => {
                expect(res).to.have.status(200);
                done();
            });
    });

    it('Should return 200 and a list of users', (done) => {
        chai.request(app)
            .get('/api/profile/?search=john')
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.be.an('array');
                expect(res.body[0].first_name.S).to.equal('john');
                done();
            });
    });

});
