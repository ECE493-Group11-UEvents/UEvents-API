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
        if (studentGroup) studentGroup.events = events
        res.send(studentGroup);
    } else {
        res.send('Failed to get student group');
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
