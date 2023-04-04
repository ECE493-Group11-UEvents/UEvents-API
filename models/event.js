const AWS = require('aws-sdk');
const uuid = require('uuid');
const dotenv = require('dotenv');
const RSVPModel = require('./rsvp');
const FollowModel = require('./follow');
const FollowGroupModel = require('./followGroup')
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
    static async getRSVPEventsDetails(email){
        try{
            const resultRsvp = await RSVPModel.getRSVPsByEmail(email);
        
            const events = [];
        
            if (resultRsvp.length > 0) {
                const keys = resultRsvp.map(item => ({
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

    static async getAllEvents( page = 1, limit = 10, following_email, searchText ) {
        const params = {
            TableName: "Events",
            Limit: limit,
        };

        try {
            // get events RSVPed by the current following_email user follows
            if (following_email) {
                // get following users
                const followers = await FollowModel.getFollowings(following_email);
                // get events RSVPed by following users
                const followingUsersEvents = await followers.Items.reduce(async (acc, follow) => {
                    const events = await RSVPModel.getRSVPsByEmail(follow.followee_email.S);
                    return [...acc, ...events];
                }, []);
                // get groups that user is following
                const followingGroups = await FollowGroupModel.getFollowingGroups(following_email);

                // get RSVPed events that following users have
                const followingUserEventIds = followingUsersEvents.map((_, index) => `:eventId${index + 1}`);
                // get group ids of groups that user is following
                const followingGroupIds = followingGroups.Items.map((_, index) => `:groupId${index + 1}`);

                // setup our filter
                params.FilterExpression = `event_id IN (${followingUserEventIds}) OR event_coordinator_group_id IN (${followingGroupIds})`;
                const followingUsersAttributes = followingUsersEvents.reduce((acc, follow, index) => {
                    acc[`:eventId${index + 1}`] = {N: follow.event_id.N}
                    return acc
                }, {});
                const followingGroupsAttributes = followingGroups.Items.reduce((acc, groupId, index) => {
                    acc[`:groupId${index + 1}`] = {N: groupId.group_id.N}
                    return acc
                }, {});
                params.ExpressionAttributeValues = {
                    ...followingUsersAttributes,
                    ...followingGroupsAttributes
                }
            }

            const result = await this.scanTablePaginated(params, page, limit);

            return result.sort((a, b) => Number(b.event_id.N) - Number(a.event_id.N));
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
     * Edits a given event with id. If a photo is provided, it will be used instead of the photo link.
     * @param {string} id 
     * @param {string} title 
     * @param {string} description 
     * @param {string} location 
     * @param {string} dateTime 
     * @param {multer} photo 
     * @param {string} link_to_photo
     * @returns 
     */
    static async editEvent( id, title, description, location, dateTime, photo, link_to_photo = null ) {
        let photo_url = "";
        // If a photo is provided, use that instead of the link to photo.
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
        else if (link_to_photo.startsWith(`https://${process.env.BUCKET_NAME}.s3.${process.env.REGION}.amazonaws.com/`)) {
            photo_url = link_to_photo;
        }

        const item = {
            "event_date_time": {"S": dateTime},
            "event_description": {"S": description},
            "event_location": {"S": location},
            "event_name": {"S": title},
            "event_photo": {"S": photo_url || DEFAULT_EVENT_PICTURE}
        };

        const params = {
            TableName: 'Events',
            Key: { event_id:{ N: id } },
            UpdateExpression: 'set #attr1 = :value1, #attr2 = :value2, #attr3 = :value3, #attr4 = :value4, #attr5 = :value5',
            ExpressionAttributeNames: {
              '#attr1': 'event_name',
              '#attr2': 'event_description',
              '#attr3': 'event_location',
              '#attr4': 'event_date_time',
              '#attr5': 'event_photo',
            },
            ExpressionAttributeValues: {
                ':value1': {"S": title},
                ':value2': {"S": description},
                ':value3': {"S": location},
                ':value4': {"S": dateTime},
                ':value5': {"S": photo_url || DEFAULT_EVENT_PICTURE }
            },
            ReturnValues: 'UPDATED_NEW'
        };

        try {
            client.updateItem(params).promise()
                .then((data) => {
                    console.log(data);
                    return item;
                })
                .catch((err) => {
                    return err
                });
        } catch (err) {
            console.error(err);
            return null;
        }
    };

    static async deleteEvent( id ) {
        const params = {
            TableName: 'Events',
            Key: { event_id:{ N: id } }
        };

        try {
            const result = await client.deleteItem(params).promise();
            return result;
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

    static async scanTablePaginated( params, pageNumber, pageSize ) {
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
