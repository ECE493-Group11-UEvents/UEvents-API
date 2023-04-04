const express = require('express');
const router = express.Router();
const StudentGroupModel = require('../models/studentGroup');
const multer = require('multer');

const upload = multer();

router.get('/user/:email', async (req, res) => {
    const email = req.params.email;

    const studentGroups = await StudentGroupModel.getStudentGroups(email);
    let results = {}
    results.studentGroups = studentGroups
    if (results) {
        res.send(results);
    } else {
        res.send('Failed to get student groups');
    }
});

router.get('/:id', async (req, res) => {
    const id = req.params.id;

    let studentGroup = await StudentGroupModel.getStudentGroupById(id);
    if (studentGroup) {
        studentGroup = studentGroup.Item;

        const events = await StudentGroupModel.getHostedEvents(id);
        // TODO: add the members of the group as well
        studentGroup.events = events
        res.send(studentGroup);
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

router.get('/:id/name', async (req, res) => {
    const id = req.params.id;

    let name = await StudentGroupModel.getGroupName(id);
    if(name){
        res.send(name);

    }else {
        res.send('Failed to get student group name');
    }

})

router.post('/edit/:group_id', upload.single('photo'), async (req, res) => {
    const { group_id } = req.params;

    const { group_name, description, photo_url} = req.body;
    const photo = req.file;

    try {
        StudentGroupModel.editStudentGroup(group_id, group_name,description, photo, photo_url)
        .then(result => {
            res.send(result);
        })
        .catch(err => {
            console.error(err);
            res.status(500).send('Error editing group')
        })
    }
    catch(err) {
        console.error(err);
        res.status(500).send('Error editing group');
    }
});

router.get('/', async (req, res) => {
    const { search } = req.query;

    const studentGroups = await StudentGroupModel.getAllStudentGroups(search);
    if (studentGroups) {
        res.send(studentGroups);
    } else {
        res.send('Failed to get student groups');
    }
});


module.exports = router;
