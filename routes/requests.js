const express = require('express');
const router = express.Router();
const RequestModel = require('../models/request');

router.post('/', async (req, res) => {
    const {email, description, group_name} = req.body;

    const studentGroup = await RequestModel.requestStudentGroup(email, description, group_name);
    if (studentGroup) {
        res.send(studentGroup.Item);
    } else {
        res.send('Failed to send request student group');
    }
});

router.get('/:status', async (req, res) => {

    const status = req.params.status;

    const requests = await RequestModel.viewRequests(status);
    if (requests) {
        res.send(requests);
    } else {
        res.send('Failed to get student group requests');
    }
});

router.put('/approve', async (req, res) => {
    const { email, group_id } = req.body;

    const result = await RequestModel.acceptRequest(email, typeof group_id === 'number' ? parseInt(group_id) : group_id);

    if (result) {
        res.send("Successfuly approved the request");
    } else {
        res.send('Failed to send request student group');
    }
});

router.put('/reject', async (req, res) => {
    const {email, group_id} = req.body;

    const result = await RequestModel.rejectRequest(email, group_id);
    if (result) {
        res.send("Successfuly rejected the request");
    } else {
        res.send('Failed to send request student group');
    }
});

module.exports = router;