const express = require('express');
const router = express.Router();
const StudentGroupModel = require('../models/studentgroup');

// Handle password change requests
router.get('/:email', async (req, res) => {
    const email = req.params.email;

    const studentGroups = await StudentGroupModel.getStudentGroups(email);
    if (studentGroups) {
        res.send(studentGroups);
    } else {
        res.send('Failed to get student groups');
    }
});


module.exports = router;
