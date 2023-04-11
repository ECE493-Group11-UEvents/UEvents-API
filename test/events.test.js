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

const test_event = {
    "title": "test",
    "description": "test",
    "dateTime": "2023-03-28T15:23:53-06:00",
    "location": "test",
    "studentGroup": "0",
    "eventTags": JSON.stringify(["test"]),
    "email": "test"
}

describe("Events Endpoint", () => {
    it("Should return 200 and create a new event", (done) => {
        chai
            .request(app)
            .post("/api/events")
            .send(test_event)
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.have.property("event_name");
                expect(res.body).to.have.property("event_description");
                expect(res.body).to.have.property("event_date_time");
                expect(res.body).to.have.property("event_location");
                expect(res.body).to.have.property("event_coordinator_group_id");
                expect(res.body).to.have.property("event_photo");
                expect(res.body).to.have.property("event_tags");
                expect(res.body).to.have.property("event_coordinator_email");
                expect(res.body).to.have.property("event_id");
                event_id = res.body.event_id.N;
                done();
            });
    });

    it("Should return 200 and get all events", (done) => {
        chai
            .request(app)
            .get("/api/events")
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.be.a("array");
                done();
            });
    });

    it("Should return 200 and get an event by id", (done) => {
        chai
            .request(app)
            .get(`/api/events/${event_id}`)
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.have.property("event_name");
                expect(res.body).to.have.property("event_description");
                expect(res.body).to.have.property("event_date_time");
                expect(res.body).to.have.property("event_location");
                expect(res.body).to.have.property("event_coordinator_group_id");
                expect(res.body).to.have.property("event_photo");
                expect(res.body).to.have.property("event_tags");
                expect(res.body).to.have.property("event_coordinator_email");
                done();
            });
    });

    it("should return 200 get edit the event", (done) => {
        chai
            .request(app)
            .post(`/api/events/edit/${event_id}`)
            .send({
                ...test_event,
                title: "test2"
            })
            .end((err, res) => {
                expect(res).to.have.status(200);
            });

        chai
            .request(app)
            .get(`/api/events/${event_id}`)
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.have.property("event_name");
                expect(res.body.event_name.S).to.equal("test2");
                expect(res.body).to.have.property("event_description");
                expect(res.body).to.have.property("event_date_time");
                expect(res.body).to.have.property("event_location");
                expect(res.body).to.have.property("event_coordinator_group_id");
                expect(res.body).to.have.property("event_photo");
                expect(res.body).to.have.property("event_tags");
                expect(res.body).to.have.property("event_coordinator_email");
                done();
            });
    });

    it("should return 200 and delete the event", (done) => {
        chai
            .request(app)
            .delete(`/api/events/${event_id}`)
            .end((err, res) => {
                expect(res).to.have.status(200);
                done();
            });
    });
});

