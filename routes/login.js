const express = require('express');
const router = express.Router();
const UserModel = require('../models/user');

// Handle login requests
router.get('/:email', async (req, res) => {

  try {
    // Check if user already exists
    const user = await UserModel.userExists(username);

    if (user) {
      return res.status(409).send('user already exists');
    }

    // Create the user record
    // const newUser = await UserModel.create(username, email, password);
    // res.send(newUser);
    res.send('finished');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error creating user');
  }
});


module.exports = router;
