const express = require('express');
const router = express.Router();
const MemberGroupModel = require('../models/membergroup');

// Handle password change requests
router.get('/:email', async (req, res) => {
    const email = req.params.email;

    const memberGroups = await MemberGroupModel.getMemberGroups(email);
    if (memberGroups) {
        res.send(memberGroups);
    } else {
        res.send('Failed to get member groups');
    }
});


module.exports = router;
