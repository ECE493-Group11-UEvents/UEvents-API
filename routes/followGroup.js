const express = require('express');
const router = express.Router();
const FollowGroupModel = require('../models/followGroup');

router.post('/:group_id/follow', async (req, res) => {
    const { group_id } = req.params;
    const {follower_email} = req.body

    const isFollowing = await FollowGroupModel.isFollowing(group_id, follower_email);

    if(isFollowing){
        res.status(400).json({ message: `${follower_email} is already following ${group_id}` });    
    } else {
        const followSuccess = await FollowGroupModel.follow(follower_email, group_id);
        res.send(followSuccess);
    }
});

router.delete('/:group_id/unfollow', async (req, res) => {
    const { group_id } = req.params;
    const {follower_email} = req.body

    const isFollowing = await FollowGroupModel.isFollowing(group_id, follower_email);

    if(isFollowing){
        const unfollowSuccess = await FollowGroupModel.unfollow(follower_email, group_id);
        res.send(unfollowSuccess);
    } else {
        res.status(400).json({ message: `${follower_email} is not following ${group_id}` });    
        
    }
});

router.get('/user/:email', async (req, res) => {
    const { email } = req.params;

    const followingGroups = await FollowGroupModel.getFollowingGroups(email);

    if(followingGroups){
        res.send(followingGroups);
    } else {
        res.send('Failed to get student groups')
    }
});

router.get('/user/:email/names', async (req, res) => {
    const { email } = req.params;

    const followingGroups = await FollowGroupModel.getFollowingGroups(email);
    if(followingGroups){
        const followingNames = await FollowGroupModel.getFollowingGroupsNames(followingGroups);
        res.send(followingNames);
    } else {
        res.send('Failed to get student groups')
    }

})


router.get('/:id', async (req, res) => {
    const { id } = req.params;

    const followers = await FollowGroupModel.getFollowers(id);

    if(followers){
        res.send(followers);
    } else{
        res.send('Failed to get followers')
    }
})

module.exports = router;
