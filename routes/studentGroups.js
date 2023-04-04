const express = require('express');
const router = express.Router();
const StudentGroupModel = require('../models/studentGroup');
const multer = require('multer');

const upload = multer();

// Handle password change requests
router.get('/user/:email', async (req, res) => {
    const email = req.params.email;

    const studentGroups = await StudentGroupModel.getStudentGroups(email);
    const followingGroups = await StudentGroupModel.getGroupsFollow(email);
    let results = {}
    results.studentGroups = studentGroups
    results.followingGroups = followingGroups
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
        const followers = await StudentGroupModel.getFollowers(id);
        // TODO: add the members of the group as well
        // const members = await StudentGroupModel.getMembers(id);
        studentGroup.events = events
        studentGroup.followers = followers
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

router.post('/:group_id/follow', async (req, res) => {
    const { group_id } = req.params;
    const {follower_email} = req.body

    const isFollowing = await StudentGroupModel.isFollowing(group_id, follower_email);

    if(isFollowing){
        res.status(400).json({ message: `${follower_email} is already following ${group_id}` });    
    } else {
        const followSuccess = await StudentGroupModel.follow(group_id, follower_email);
        res.send(followSuccess);
    }
});

router.delete('/:group_id/unfollow', async (req, res) => {
    const { group_id } = req.params;
    const {follower_email} = req.body

    const isFollowing = await StudentGroupModel.isFollowing(group_id, follower_email);

    if(isFollowing){
        const unfollowSuccess = await StudentGroupModel.unfollow(group_id, follower_email);
        res.send(unfollowSuccess);
    } else {
        res.status(400).json({ message: `${follower_email} is not following ${group_id}` });    
        
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
