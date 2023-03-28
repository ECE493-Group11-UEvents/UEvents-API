var express = require('express');
var router = express.Router();
const EventModel = require('../models/event');

router.post('/', (req, res) => {
    const { title, description, location, studentGroup, dateTime, email, photo } = req.body;
    try {
        EventModel.createEvent(title, description, location, studentGroup, dateTime, email, photo);
        res.send("Event created");
    } 
    catch (err) {
        console.error(err);
        res.status(500).send('Error creating event');
    }
});

module.exports = router;
