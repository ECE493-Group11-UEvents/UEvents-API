const express = require('express');
const router = express.Router();
const UserModel = require('../models/user');
const EventModel = require('../models/event');
const FollowModel = require('../models/follow');
const multer = require('multer');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'test/')
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
});

const upload = multer({ storage: storage });

// Handle profile requests, returns: user info, requests?, followers, followings, events, request sent?, follow confirm?
router.get('/:email', async (req, res) => {

    const email = req.params.email;

    const my_user = req.query.user;

    var isFollowConfirm = true;

    var isFollowing = true;

    // getting the user information
    const user = await UserModel.profile(email);

    // getting the events user has signed up for
    const events = await EventModel.getRSVPEventsDetails(email);

    // getting the followers of this user
    const followers = await FollowModel.getFollowers(email);

    // getting the followers of this user
    const followings = await FollowModel.getFollowings(email);

    if(my_user){
        // checking if the user is followed (confirmed)
        isFollowConfirm = await FollowModel.isFollowConfirm(my_user, email);

        // checking if the user is followed
        isFollowing = await FollowModel.isFollowing(my_user, email);
    }
    else{
        const requests = await FollowModel.getFollowRequests(email);

        user.push(requests);
    }
    
    if(isFollowConfirm) {
        try {
            user.push(followers, followings, events, true, isFollowConfirm);
      
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

            // checking if follow request is sent
            var followeRequest;
            if (isFollowing && isFollowing.Item) {

                followeRequest = true;

            } else {
                followeRequest = false;
            }

            user.push(followers.Count, followings.Count, followeRequest, false);
      
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

router.post('/accept', async (req, res) => {

    const {follower_email, followee_email} = req.body;

    // checking if the user is followed
    const isFollowing = await FollowModel.isFollowing(follower_email, followee_email);

    if(isFollowing){
        const followSuccess = await FollowModel.accept(follower_email, followee_email);
        res.send(followSuccess);
    }
    else{
        res.status(400).json({ message: `${follower_email} is not following ${followee_email}` });    
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

router.put('/edit', async (req, res) => {
    
    const {email, first_name, last_name} = req.body;

    const result = await UserModel.editProfile(email, first_name, last_name);

    res.send(result);
    
});

router.put('/edit_picture', upload.single('photo'), async (req, res) => {

    const {email} = req.body;

    const photo = req.file;

    const result = await UserModel.editProfilePicture(email, photo);

    if(result){
        res.send(result);
    }
    else{
        res.status(500).send("Error");
    }
    
});

/**
 * Route for getting all users based on search query
 */
router.get('/', async (req, res) => {
    const {search} = req.query;
    try {
        let users = await UserModel.getAllUsers(search);
        res.send(users);
    }
    catch(err) {
        console.error(err);
        res.status(500).send('Error');
    }
});

module.exports = router;
