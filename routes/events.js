var express = require('express');
var router = express.Router();
const EventModel = require('../models/event');
const multer = require('multer');

const upload = multer();

router.post('/',  upload.single('photo'), async (req, res) => {
    const { title, description, location, studentGroup, dateTime, email } = req.body;
    const photo = req.file;
    try {
        EventModel.createEvent(title, description, location, studentGroup, dateTime, email, photo)
            .then((result) => {
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
    const { page, limit, search, following_email } = req.query;
    try {
        EventModel.getAllEvents( page, limit, following_email, search )
            .then((result) => {
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

router.get('/:event_id', async (req, res) => {
    const { event_id } = req.params;
    try {
        EventModel.getEventById(event_id)
            .then((result) => {
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

router.post('/edit/:event_id', upload.single('photo'), async (req, res) => {
    const { event_id } = req.params;
    const { title, description, location, dateTime, photo_url } = req.body;
    const photo = req.file;
    try {
        EventModel.editEvent(event_id, title, description, location, dateTime, photo, photo_url)
            .then((result) => {
                res.send(result);
            })
            .catch((err) => {
                console.error(err);
                res.status(500).send('Error editing event');
            });
    }
    catch(err) {
        console.error(err);
        res.status(500).send('Error editing event');
    }
});

router.delete('/:event_id', async (req, res) => {
    const { event_id } = req.params;
    try {
        EventModel.deleteEvent(event_id)
            .then((result) => {
                res.send(result);
            })
            .catch((err) => {
                console.error(err);
                res.status(500).send('Error deleting event');
            });
    }
    catch(err) {
        console.error(err);
        res.status(500).send('Error deleting event');
    }
});

module.exports = router;
