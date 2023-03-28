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

    static async createEvent(title, description, location, studentGroup, dateTime, email, photo){
        let nextId = await this.getNextId();

        const item = {
            "event_coordinator_email": {"S": email},
            "event_coordinator_group_id": {"N": studentGroup},
            "event_date_time": {"S": dateTime},
            "event_description": {"S": description},
            "event_location": {"S": location},
            "event_name": {"S": title},
            "event_photo": {"S": photo},
            "event_id": {"N": nextId}
        };

        await client.putItem({ TableName: "Events", Item: item }).promise();
            
        return item;
    }

    /**
     * Helper function for getting the next unique ID to use for a new item
     * @returns {Promise<string | null>} The next ID to use
     */
    static async getNextId() {
        // Increment the value of the LAST_USED_ID item
        const updateParams = {
            TableName: 'COUNTERS',
            Key: { "table_name": {'S': 'Events'} },
            UpdateExpression: 'SET #value = #value + :incr',
            ExpressionAttributeNames: {
                '#value': 'LAST_USED_ID',
            },
            ExpressionAttributeValues: {
                ':incr': {"N": "1"},
            },
            ReturnValues: 'UPDATED_NEW',
        };
      
        try {
            const updatedData = await client.updateItem(updateParams).promise();
            return updatedData.Attributes.LAST_USED_ID.N;
        } catch (err) {
            console.error('Error getting the next ID:', JSON.stringify(err));
            throw err;
        }
      };
}

module.exports = EventModel;
