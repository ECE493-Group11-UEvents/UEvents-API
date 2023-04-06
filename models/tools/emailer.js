const AWS = require('aws-sdk');
const dotenv = require('dotenv');
const sgMail = require('@sendgrid/mail');

dotenv.config();

const EMAIL_ADDRESS = process.env.EMAIL_ADDRESS;
const EDIT_TEMPLATE_ID = process.env.SENDGRID_EDIT_TEMPLATE_ID;

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// AWS.config.update({
//     region: process.env.REGION,
//     accessKeyId: process.env.DB_ACCESS_KEY,
//     secretAccessKey: process.env.DB_SECRET_ACCESS_KEY,
// });

// const ses = new AWS.SES();

// class Emailer {
//     /**
//      * 
//      * @param {[string]} email 
//      * @param {string} subject 
//      * @param {string} body 
//      */
//     static async sendEmail(email = [], subject, body){
//         const params = {
//             Destination: {
//               ToAddresses: email
//             },
//             Message: {
//                 Body: {
//                     Text: {
//                         Charset: 'UTF-8',
//                         Data: body
//                     },
//                 },
//                 Subject: {
//                     Charset: 'UTF-8',
//                     Data: subject,
//                 },
//             },
//             Source: EMAIL_ADDRESS,
//         };

//         try {
//             let res = await ses.sendEmail(params).promise();
//             return res;
//         }
//         catch(err){
//             console.log(err);
//             return null;
//         }
//     }
// }

class Emailer {
    /**
     * 
     * @param {[string]} email 
     * @param {string} subject 
     * @param {string} body 
     */
    static async sendEmail(emailUserData = [], subject, body){
        const msgs = emailUserData.map((userData) => {
            return {
                to: userData.email,
                from: EMAIL_ADDRESS,
                subject: subject,
                templateId: EDIT_TEMPLATE_ID,
                dynamic_template_data: {
                    first_name: userData.first_name,
                    event_name: userData.event_name,
                    body: body,
                },
            };
        }, []);

        try {
            let res = await sgMail.send(msgs, false);
            return res;
        }
        catch(err){
            console.log(err);
            return null;
        }
    }
}

module.exports = Emailer;