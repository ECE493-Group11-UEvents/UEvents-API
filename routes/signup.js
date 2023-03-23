const express = require('express');
const router = express.Router();
const UserModel = require('../models/user');

// Handle sign-up requests
router.post('/signup', async (req, res) => {

  const { email, first_name, last_name, password, profile_picture, roles } = req.body;

  try {
    // Check if user already exists
    const user = await UserModel.userExists(email);

    if (user) {
      return res.status(409).send('user already exists');
    }

    // Create the user record
    const newUser = await UserModel.create( email, first_name, last_name, password, profile_picture, roles );
    res.send(newUser);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error creating user');
  }
});

router.get('/', async (req, res) => {
    res.send("Here in signup");
});

module.exports = router;
