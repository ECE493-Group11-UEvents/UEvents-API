/**
 * login.js
 * Route used to authenticate a user.
 * Functional Requirements: REQ 2
 */

const express = require('express');
const router = express.Router();
const UserModel = require('../models/user');

// Handle login requests
router.post('/', async (req, res) => {

    const { email, password } = req.body;
  
    try {
      // Verify user's credentials using the UserModel.login function
      const user = await UserModel.login(email, password);
  
      if (user) {
        // User exists and credentials are valid, return the user object
        res.send(user);
      } else {
        // User does not exist or credentials are invalid, return an error message
        res.status(401).send('Invalid email or password');
      }
    } catch (err) {
      console.error(err);
      res.status(500).send('Error logging in');
    }
});


module.exports = router;
