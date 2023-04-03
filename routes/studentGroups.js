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
