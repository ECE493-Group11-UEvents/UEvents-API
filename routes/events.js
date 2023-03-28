var express = require('express');
var router = express.Router();
const EventModel = require('../models/event');

router.post('/', async (req, res) => {
    const { title, description, location, studentGroup, dateTime, email, photo } = req.body;
    try {
        EventModel.createEvent(title, description, location, studentGroup, dateTime, email, photo)
            .then((result) => {
                console.log(result);
                res.send(result);
            })
            .catch((err) => {
                console.error(err);
                res.status(500).send('Error creating event');
            });
    } 
    catch (err) {
        console.error(err);
        res.status(500).send('Error creating event');
    }
});

router.get('/', async (req, res) => {
    const { page, limit } = req.query;
    try {
        EventModel.getAllEvents( page, limit )
            .then((result) => {
                console.log(result);
                res.send(result);
            })
            .catch((err) => {
                console.error(err);
                res.status(500).send('Error getting all events');
            });
    }
    catch(err) {
        console.error(err);
        res.status(500).send('Error getting all events');
    }
});

module.exports = router;
