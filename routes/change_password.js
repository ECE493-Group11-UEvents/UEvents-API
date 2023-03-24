const express = require('express');
const router = express.Router();
const UserModel = require('../models/user');

// Handle password change requests
router.put('/:email', async (req, res) => {

    const email = req.params.email;
    const { password } = req.body;

    // compare email with that of the authenticated email from middleware check
    if (email !== req.AUTH_EMAIL) {
        return res.status(401).send('Unauthorized: You can only change your own password');
    }
  
    const success = await UserModel.change_password(email, password);
    if (success) {
        res.send("Success");
    } else {
        res.send('Failed to change password');
    }
});


module.exports = router;
