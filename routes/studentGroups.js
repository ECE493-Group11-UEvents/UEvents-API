const express = require('express');
const router = express.Router();
const StudentGroupModel = require('../models/studentGroup');

// Handle password change requests
router.get('/user/:email', async (req, res) => {
    const email = req.params.email;

    const studentGroups = await StudentGroupModel.getStudentGroups(email);
    if (studentGroups) {
        res.send(studentGroups);
    } else {
        res.send('Failed to get student groups');
    }
});

router.get('/:id', async (req, res) => {
    const id = req.params.id;

    const studentGroup = await StudentGroupModel.getStudentGroupById(id);
    if (studentGroup) {
        res.send(studentGroup.Item);
    } else {
        res.send('Failed to get student group');
    }
});

router.post('/request', async (req, res) => {
    const {email, description, id, group_name} = req.body;

    const studentGroup = await StudentGroupModel.requestStudentGroup(email, description, id, group_name);
    if (studentGroup) {
        res.send(studentGroup.Item);
    } else {
        res.send('Failed to send request student group');
    }
});

router.get('/requests/:status', async (req, res) => {

    const status = req.params.status;

    const requests = await StudentGroupModel.viewRequests(status);
    if (requests) {
        res.send(requests);
    } else {
        res.send('Failed to get student group requests');
    }
});

router.put('/approve', async (req, res) => {
    const {email, group_id, group_name} = req.body;

    const result = await StudentGroupModel.acceptRequest(email, group_id, group_name);

    if (result) {
        res.send("Successfuly approved the request");
    } else {
        res.send('Failed to send request student group');
    }
});

router.put('/reject', async (req, res) => {
    const {email, group_id} = req.body;

    const result = await StudentGroupModel.rejectRequest(email, group_id, group_name);
    if (result) {
        res.send("Successfuly rejected the request");
    } else {
        res.send('Failed to send request student group');
    }
});


module.exports = router;
