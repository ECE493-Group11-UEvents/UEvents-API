var express = require('express');
var router = express.Router();

const RSVPModel = require('../models/rsvp');

router.get('/:event_id', async (req, res) => {
    const { event_id } = req.params;
    try {
        RSVPModel.getRSVPsByEventId(event_id)
            .then((result) => {
                res.send(result);
            })
            .catch((err) => {
                console.error(err);
                res.status(500).send('Error getting all event RSVPs');
            });
    }
    catch(err) {
        console.error(err);
        res.status(500).send('Error getting all event RSVPs');
    }
});

router.get('/:event_id/:email', async (req, res) => {
    const { event_id, email } = req.params;
    try {
        RSVPModel.isRSVP(event_id, email)
            .then((result) => {
                res.send(result);
            })
            .catch((err) => {
                console.error(err);
                res.status(500).send('Error getting all event RSVPs');
            });
    }
    catch(err) {
        console.error(err);
        res.status(500).send('Error getting all event RSVPs');
    }
});

router.post('/:event_id', async (req, res) => {
    const { event_id } = req.params;
    const { email } = req.body;
    try {
        console.log(event_id, email)
        RSVPModel.RSVP(event_id, email)
            .then((result) => {
                res.send(result);
            })
            .catch((err) => {
                console.error(err);
                res.status(500).send('Error RSVPing to event');
            });
    }
    catch(err) {
        console.error(err);
        res.status(500).send('Error RSVPing to event');
    }
});

router.delete('/:event_id', async (req, res) => {
    const { event_id } = req.params;
    const { email } = req.body;
    try {
        RSVPModel.deleteRSVP(event_id, email)
            .then((result) => {
                res.send(result);
            })
            .catch((err) => {
                console.error(err);
                res.status(500).send('Error deleting RSVP');
            });
    }
    catch(err) {
        console.error(err);
        res.status(500).send('Error deleting RSVP');
    }
});

module.exports = router;