/**
 * events.js
 * Routes used to facilitate event creation, fetching, editing, deletion, and notifications
 * Functional Requirements: REQ 14, 15, 16, 17, 18, 21, 22, 23, 24
 */

var express = require('express');
var router = express.Router();
const EventModel = require('../models/event');
const multer = require('multer');

const upload = multer();

router.post('/',  upload.single('photo'), async (req, res) => {
    const { title, description, location, studentGroup, dateTime, email, eventTags } = req.body;
    const photo = req.file;
    try {
        EventModel.createEvent(title, description, location, studentGroup, dateTime, email, photo, eventTags)
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
    const { page, limit, search, following_email, filter } = req.query;
    try {
        EventModel.getAllEvents( page, limit, following_email, search, filter )
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
    const { title, description, location, dateTime, photo_url, eventTags, notification, message } = req.body;
    const photo = req.file;
    try {
        console.log(req.body);
        EventModel.editEvent(event_id, title, description, location, dateTime, photo, photo_url, eventTags, notification === 'true' || notification === true ? true : false, message)
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
    const { notification, message } = req.body;
    try {
        EventModel.deleteEvent(event_id, notification === 'true' || notification === true ? true : false, message)
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

if (process.env.NODE_ENV !== 'production') {
    router.post('/TEST_EMAILER/:event_id', async (req, res) => {
        const { event_id } = req.params;
        const { subject, body } = req.body;
        try {
            EventModel.notifyUsersEdit(event_id, subject, body)
                .then((result) => {
                    res.send(result);
                })
                .catch((err) => {
                    console.error(err);
                    res.status(500).send('Error sending email');
                });
        }
        catch(err) {
            console.error(err);
            res.status(500).send('Error sending email');
        }
    });
}

module.exports = router;
