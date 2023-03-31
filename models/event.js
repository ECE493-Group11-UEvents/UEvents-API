const AWS = require('aws-sdk');
const uuid = require('uuid');
const dotenv = require('dotenv');
dotenv.config();

AWS.config.update({
    region: process.env.REGION,
    accessKeyId: process.env.DB_ACCESS_KEY,
    secretAccessKey: process.env.DB_SECRET_ACCESS_KEY,
});

const client = new AWS.DynamoDB();
const s3 = new AWS.S3();

const DEFAULT_EVENT_PICTURE = `https://${process.env.BUCKET_NAME}.s3.${process.env.REGION}.amazonaws.com/default_event_photo.png`;

class EventModel {

    /**
     * Retrieves the RSVP'd events for the given email.
     * @param {string} email - The email to get the RSVP'd events for.
     * @returns {Promise<Object[]>} An array of RSVP'd events with their details.
     * Returns null if there was an error.
     */
    static async getEvents(email){
        try{
            const params = {
                KeyConditionExpression: 'email = :email',
                ExpressionAttributeValues: {
                  ':email': { S: email },
                },
                TableName: 'RSVP',
              };
              const resultRsvp = await client.query(params).promise();
          
              const events = [];
          
              if (resultRsvp.Count > 0) {
                const keys = resultRsvp.Items.map(item => ({
                  'event_id': { N: item.event_id.N },
                }));
                const params = {
                  RequestItems: {
                    'Events': {
                      Keys: keys,
                    },
                  },
                };
                const resultEvents = await client.batchGetItem(params).promise();
                events.push(...resultEvents.Responses.Events);
              }

            return events;
        }
        catch(err){
            console.error(err);
            return null;
        }
    }

    static async createEvent(title, description, location, studentGroup, dateTime, email, photo){
        let photo_url = "";
        if (photo){
            const params = {
                Bucket: process.env.BUCKET_NAME,
                Key: uuid.v4() + photo.originalname,
                Body: photo.buffer,
                ContentType: photo.mimetype,
                ACL: 'public-read'
            };
            await s3.putObject(params).promise();
            photo_url = `https://${process.env.BUCKET_NAME}.s3.${process.env.REGION}.amazonaws.com/${params.Key}`;
        }

        let nextId = await this.getNextId();

        const item = {
            "event_coordinator_email": {"S": email},
            "event_coordinator_group_id": {"N": studentGroup},
            "event_date_time": {"S": dateTime},
            "event_description": {"S": description},
            "event_location": {"S": location},
            "event_name": {"S": title},
            "event_photo": {"S": photo_url || DEFAULT_EVENT_PICTURE},
            "event_id": {"N": nextId}
        };

        await client.putItem({ TableName: "Events", Item: item }).promise();
            
        return item;
    }

    static async getAllEvents( page = 1, limit = 10 ) {
        const params = {
            TableName: "Events",
            Limit: limit
        };

        try {
            const result = await this.scanTablePaginated(params, page, limit);
            return result;
        } catch (err) {
            console.error(err);
            return null;
        }
    }

    static async getEventById( id ) {
        const params = {
            TableName: "Events",
            Key: {
                'event_id' : {N: id},
            }
        };

        try {
            const result = await client.getItem(params).promise();
            return result.Item;
        } catch (err) {
            console.error(err);
            return null;
        }
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

    static async scanTablePaginated( params, pageNumber, pageSize) {
        let items = [];
        let pageCount = 0;
        let lastEvaluatedKey = undefined;

        do {
            const result = await client.scan(params).promise();
            items = items.concat(result.Items);
            pageCount++;
            lastEvaluatedKey = result.LastEvaluatedKey;
            params.ExclusiveStartKey = lastEvaluatedKey;
        } while (lastEvaluatedKey && pageCount < pageNumber);

        return items.slice(0, pageSize);
    }
}

module.exports = EventModel;
