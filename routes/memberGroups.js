/**
 * memberGroups.js
 * Routes used to facilitate fetching and deleting EC members of student groups
 * Functional Requirements: REQ 13
 */

const express = require('express');
const router = express.Router();
const MemberGroupModel = require('../models/memberGroup');

// Handle group memeber requests
router.get('/:email', async (req, res) => {
    const email = req.params.email;

    const memberGroups = await MemberGroupModel.getMemberGroups(email);
    if (memberGroups) {
        res.send(memberGroups);
    } else {
        res.send('Failed to get member groups');
    }
});

router.get('/group_members/:id', async (req, res) => {
    const id = req.params.id;

    const groupMemebers = await MemberGroupModel.getGroupMembers(id);
    if (groupMemebers) {
        res.send(groupMemebers);
    } else {
        res.send('Failed to get group members');
    }
});

router.delete('/:email/:id', async (req, res) => {
    const email = req.params.email;
    const id = req.params.id;

    const groupMemebers = await MemberGroupModel.deleteGroupMember(email, id);
    if (groupMemebers) {
        res.send("User deleted successfully");
    } else {
        res.send('Failed to delete the member');
    }
});



module.exports = router;
