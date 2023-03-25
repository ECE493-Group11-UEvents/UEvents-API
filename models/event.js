const AWS = require('aws-sdk');
const dotenv = require('dotenv');
dotenv.config();

AWS.config.update({
    region: process.env.REGION,
    accessKeyId: process.env.DB_ACCESS_KEY,
    secretAccessKey: process.env.DB_SECRET_ACCESS_KEY,
});

const client = new AWS.DynamoDB();

class EventModel {

    // get individual events based on event_id
    static async getEvent(id){
        try{
            var params = {
                TableName: "Events",
                Key: {
                    'event_id' : {N: id},
                }
            }
            const result = await client.getItem(params).promise();

            return result;
        }
        catch(err){
            console.error(err);
            return null;
        }
    }

    // getting the RSVP'd events
    static async getEvents(email){
        try{
            var params = {
                KeyConditionExpression: 'email = :email',
                ExpressionAttributeValues: {
                    ':email': { S: email }
                },
                TableName: 'RSVP'
            };

            var result_rsvp = await client.query(params).promise();

            console.log(result_rsvp.Count);

            var events = [];
            var promises = [];

            var id;

            if(result_rsvp.Count > 0){
                for (var i = 0; i < result_rsvp.Count; i++){
                    id = result_rsvp.Items[i].event_id.N;
                    promises.push(this.getEvent(id));
                }
                events.push(...await Promise.all(promises));
            }

            return events;
        }
        catch(err){
            console.error(err);
            return null;
        }
    }
}

module.exports = EventModel;
