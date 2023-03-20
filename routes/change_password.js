const express = require('express');
const router = express.Router();
const UserModel = require('../models/user');

// Handle login requests
router.put('/:email', async (req, res) => {

    const email = req.params.email;
    const password = req.query.password;
  
    const success = await UserModel.change_password(email, password);
    if (success) {
        res.send("Success");
    } else {
        res.send('Failed to change password');
    }
});


module.exports = router;
