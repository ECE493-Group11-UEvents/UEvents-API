const express = require('express');
const router = express.Router();
const UserModel = require('../models/user');

// Handle sign-up requests
router.post('/', async (req, res) => {

  const { email, first_name, last_name, password } = req.body;

  try {
    // Check if user already exists
    const user = await UserModel.userExists(email);

    if (user) {
      return res.status(409).send('user already exists');
    }

    console.log(JSON.stringify(req.body))

    // Create the user record
    const newUser = await UserModel.create( email, first_name, last_name, password );
    res.send(newUser);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error creating user');
  }
});

module.exports = router;
