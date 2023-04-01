var express = require('express');
var router = express.Router();

const RSVPModel = require('../models/rsvp');

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

module.exports = router;