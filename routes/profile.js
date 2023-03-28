const express = require('express');
const router = express.Router();
const UserModel = require('../models/user');
const EventModel = require('../models/event');
const FollowModel = require('../models/follow');

// Handle profile requests
router.get('/:email', async (req, res) => {

    const email = req.params.email;

    const my_user = req.query.user;

    var isFollowing = true;

    if(my_user){
        // checking if the user is followed
        isFollowing = await FollowModel.isFollowConfirm(my_user, email);
    }

    // getting the user information
    const user = await UserModel.profile(email);

    // getting the events user has signed up for
    const events = await EventModel.getEvents(email);

    // getting the followers of this user
    const followers = await FollowModel.getFollowers(email);

    // getting the followers of this user
    const followings = await FollowModel.getFollowings(email);

    
    if(isFollowing) {
        try {
            user.push(followers, followings, events);
      
            if (user[0].Item) {
              // User exists and credentials are valid, return the user object
              res.send(user);
            } else {
              // User does not exist or credentials are invalid, return an error message
              res.status(401).send('Invalid User');
            }
          } catch (err) {
            console.error(err);
            res.status(500).send('Error');
          }
    }
    else{
        try {

            user.push(followers.Count, followings.Count);
      
            if (user[0].Item) {
              // User exists and credentials are valid, return the user object
              res.send(user);
            } else {
              // User does not exist or credentials are invalid, return an error message
              res.status(401).send('Invalid User');
            }
          } catch (err) {
            console.error(err);
            res.status(500).send('Error');
          }
    }
    
});

router.post('/follow', async (req, res) => {

    const {follower_email, followee_email} = req.body;

    // checking if the user is followed
    const isFollowing = await FollowModel.isFollowing(follower_email, followee_email);

    if(isFollowing){
        res.status(400).json({ message: `${follower_email} is already following ${followee_email}` });    
    }
    else{
        const followSuccess = await FollowModel.follow(follower_email, followee_email);
        res.send(followSuccess);
    }
});

router.delete('/unfollow', async(req, res) => {
    const {follower_email, followee_email} = req.body;

    // checking if the user is followed
    const isFollowing = await FollowModel.isFollowing(follower_email, followee_email);

    if(isFollowing){
        const unfollowSuccess = await FollowModel.unfollow(follower_email, followee_email);
        res.send(unfollowSuccess);
    }
    else{
        res.status(400).json({ message: `${follower_email} is not following ${followee_email}` });    
    }
});


module.exports = router;
