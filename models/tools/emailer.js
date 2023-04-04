const AWS = require('aws-sdk');
const dotenv = require('dotenv');

dotenv.config();

const AWS_EMAIL_ADDRESS = process.env.AWS_EMAIL_ADDRESS;

AWS.config.update({
    region: process.env.REGION,
    accessKeyId: process.env.DB_ACCESS_KEY,
    secretAccessKey: process.env.DB_SECRET_ACCESS_KEY,
});

const ses = new AWS.SES();

class Emailer {
    /**
     * 
     * @param {[string]} email 
     * @param {string} subject 
     * @param {string} body 
     */
    static async sendEmail(email = [], subject, body){
        const params = {
            Destination: {
              ToAddresses: email
            },
            Message: {
                Body: {
                    Text: {
                        Charset: 'UTF-8',
                        Data: body
                    },
                },
                Subject: {
                    Charset: 'UTF-8',
                    Data: subject,
                },
            },
            Source: AWS_EMAIL_ADDRESS,
        };

        try {
            let res = await ses.sendEmail(params).promise();
            return res;
        }
        catch(err){
            console.log(err);
            return null;
        }
    }
}

module.exports = Emailer;