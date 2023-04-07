const dotenv = require('dotenv');
const sgMail = require('@sendgrid/mail');

dotenv.config();

const EMAIL_ADDRESS = process.env.EMAIL_ADDRESS;
const EDIT_TEMPLATE_ID = process.env.SENDGRID_EDIT_TEMPLATE_ID;
const DECISION_TEMPLATE_ID = process.env.SENDGRID_DECISION_TEMPLATE_ID;
const NOTIFICATION_TEMPLATE_ID = process.env.SENDGRID_NOTIFICATION_TEMPLATE_ID;

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

class Emailer {
    /**
     * 
     * @param {[{}]} emailUserData includes email, first_name, event_name, and body
     * @param {string} subject 
     * @param {string} body 
     * @param {boolean} notif_msg signifies if the email is a notification email or a normal edit tempalte email.
     */
    static async sendEmail(emailUserData = [], subject, body, notif_msg = false){
        const recipients = emailUserData.map((userData) => {
            return {
                to: userData.email,
                dynamic_template_data: {
                    first_name: userData.first_name,
                    event_name: userData.event_name,
                    body: body,
                    "subject": subject,
                },
            };
        });

        const msg = {
            personalizations: recipients,
            from: EMAIL_ADDRESS,
            templateId: notif_msg ? NOTIFICATION_TEMPLATE_ID : EDIT_TEMPLATE_ID
        }

        // console.log(msg);

        try {
            let res = await sgMail.send(msg);
            console.log(res);
            return res;
        }
        catch(err){
            console.log(err);
            return null;
        }
    }

    static async sendSingleDecisionEmail(email, first_name, group_name, decision, subject, body){
        const msg = {
            to: email,
            from: EMAIL_ADDRESS,
            templateId: DECISION_TEMPLATE_ID,
            dynamic_template_data: {
                first_name: first_name,
                group_name: group_name,
                decision: decision,
                subject: subject,
                body: body,
            },
        }

        try {
            let res = await sgMail.send(msg);
            console.log(res);
            return res;
        }
        catch(err){
            console.log(err);
            return null;
        }
    }
}

module.exports = Emailer;