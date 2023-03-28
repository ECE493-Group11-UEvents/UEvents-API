const express = require('express');
const router = express.Router();
const UserModel = require('../models/user');
const EventModel = require('../models/event');
const FollowModel = require('../models/follow');

// Handle login requests
router.get('/:email', async (req, res) => {

    const email = req.params.email;

    const my_user = req.query.user;
    
    console.log(my_user);
    
    try {
      // getting the user information
      const user = await UserModel.profile(email);

      // getting the events user has signed up for
      const events = await EventModel.getEvents(email);

      // getting the followers of this user
      const followers = await FollowModel.getFollowers(email);

      // getting the followers of this user
      const followings = await FollowModel.getFollowings(email);
        
      user.push(followers, followings, events);

      if (user) {
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
});


module.exports = router;
