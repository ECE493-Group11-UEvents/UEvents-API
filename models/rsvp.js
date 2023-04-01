const AWS = require('aws-sdk');
const dotenv = require('dotenv');
dotenv.config();

AWS.config.update({
    region: process.env.REGION,
    accessKeyId: process.env.DB_ACCESS_KEY,
    secretAccessKey: process.env.DB_SECRET_ACCESS_KEY,
});

const client = new AWS.DynamoDB();

class RSVPModel {
    static async RSVP( id, email ) {
        const item = {
            event_id: { N: id },
            email: { S: email }
        }

        try {
            const result = await client.putItem({ TableName: "RSVP", Item: item }).promise();
            return result;
        } catch (err) {
            console.error(err);
            return null;
        }
    }

    static async getRSVPsByEventId( id ) {
        const params = {
            TableName: 'RSVP',
            FilterExpression: 'event_id = :event_id',
            ExpressionAttributeValues: {
              ':event_id': { N: id },
            }
        }

        try {
            const result = await client.scan(params).promise();
            return result.Items;
        }
        catch(err) {
            console.error(err);
            return null;
        }
    }

    static async isRSVP( id, email ) {
        const params = {
            TableName: 'RSVP',
            KeyConditionExpression: 'email = :email AND event_id = :event_id',
            ExpressionAttributeValues: {
                ':email': { S: email },
                ':event_id': { N: id },
            }
        }

        try {
            const result = await client.query(params).promise();
            return result.Count > 0;
        }
        catch(err) {
            console.error(err);
            return null;
        }
    }
}

module.exports = RSVPModel;