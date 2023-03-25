const UserModel = require('../models/user');

const basicAuth = async (req, res, next) => {
    try {        
        const authHeader = req.headers.authorization;
    
        if (!authHeader) {
            return res.status(401).send('Unauthorized: No authentication header provided');
        }
    
        const auth = Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':');
        const email = auth[0];
        const password = auth[1];

        const user = await UserModel.login(email, password);

        if (!user) {
            return res.status(401).send('Unauthorized: Invalid username or password');
        }

        // store the authenticated email for processing in other routes, if needed.
        req.AUTH_EMAIL = email;

        next();
    }
    catch(err) {
        console.error(err);
        res.status(500).send(`There was an error parsing the authentication header: ${JSON.stringify(err)}`);
    }
};

module.exports = basicAuth;