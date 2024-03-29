const AWS = require('aws-sdk');
const MemberGroupModel = require('./memberGroup');
const uuid = require('uuid');

const DEFAULT_EVENT_PICTURE = `https://${process.env.BUCKET_NAME}.s3.${process.env.REGION}.amazonaws.com/default_event_photo.png`;

AWS.config.update({
  region: process.env.REGION,
  accessKeyId: process.env.DB_ACCESS_KEY,
  secretAccessKey: process.env.DB_SECRET_ACCESS_KEY,
});

const DEFAULT_PROFILE_PICTURE = `https://${process.env.BUCKET_NAME}.s3.${process.env.REGION}.amazonaws.com/default_user_photo.jpg`;

const client = new AWS.DynamoDB();
const s3 = new AWS.S3();

const tableName = 'StudentGroups';

class StudentGroupModel {

    /**
     * Gets the student groups the user belongs to
     * @param {string} email email of the user
     * @returns the batched response of the student groups the user belongs to 
     */
    static async getStudentGroups(email){
        let keys = [];
        const memberGroups = await MemberGroupModel.getMemberGroups(email);
        if (memberGroups.Count === 0) return null;
        for (let i = 0; i < memberGroups.Count; i++) {
            if (memberGroups.Count > 0) keys.push({ 'group_id': {"N": memberGroups.Items[i].group_id.N} });
        }
        const batchGetParams = {
            RequestItems: {
              [tableName]: {
                Keys: keys
              },
            },
          };
        try {
            return await client.batchGetItem(batchGetParams).promise();
        } catch (err) {
            console.error(err);
            return null;
        }
    }

    static async getGroupsFollow(email){
        const params = {
            TableName: 'FollowGroup'
        }
        try {
            let followings = await client.scan(params).promise();
            followings = followings.Items.filter(follow => {
                return follow.email.S === email
            })
            return followings;
        } catch (err) {
            console.error(err);
            return null;
        }
    }

    static async getStudentGroupById(id) {
        const params = {
            TableName: tableName,
            Key: {
                'group_id': { N: id },
            }
        };
        try {
            return await client.getItem(params).promise();
        } catch (err) {
            console.error(err);
            return null;
        }
    }

    static async getGroupName(id) {
        const params = {
            TableName: tableName,
            Key: {
                'group_id': { N: id },
            }
        };

        try {
            const group = await client.getItem(params).promise();
            return group.Item.group_name;
        } catch (err) {
            console.error(err);
            return null;
        }
    }

    static async editStudentGroup(group_id, group_name, description, photo, link_to_photo = null){
        if(await this.groupExists(group_id)){
            let photo_url = "";

            if(photo){
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
                "group_name": {"S": group_name},
                "description": {"S": description},
                "group_photo": {"S": photo_url || DEFAULT_EVENT_PICTURE},
            };

            var params = {
                TableName: tableName,
                Key: {
                    group_id: { N: group_id }
                },
                UpdateExpression: 'set group_name = :value1, description = :value2, group_photo = :value3',
                ExpressionAttributeValues: {
                    ':value1': { S: group_name },
                    ':value2': { S: description },
                    ':value3': { S: photo_url || DEFAULT_EVENT_PICTURE}
                },
                ReturnValues: 'UPDATED_NEW'
            };

            try{
                client.updateItem(params).promise()
                    .then((data) => {
                        console.log(data);
                        return item;
                    })
                    .catch((err) => {
                        return err
                    });
            } catch(error){
                console.error(error);
                throw error;
            }
        } else{
            return "Group does not exist";
        }
    }

    static async groupExists(group_id){
        const params = {
            TableName: tableName,
            Key: {
                group_id: { N: group_id }
            }
        };

        try {
            const result = await client.getItem(params).promise();

            if( result.Item == null){
                return false;
            }

            return true;
        } catch(err){
            console.error(err);
            return null;
        }
    }

    static async getHostedEvents(group_id){
        const params = {
            TableName: "Events",
        };

        try {
            let result = await client.scan(params).promise();
            result = result.Items.filter(event => {
                return event.event_coordinator_group_id.N === group_id
            })
            return result;
        } catch (err) {
            console.error(err);
            return null;
        }
    };
    
    static async getAllStudentGroups(search) {
        const params = {
            TableName: tableName,
        };

        if (search) {
            params.FilterExpression = 'contains(group_name, :search) OR contains(description, :search)';
            params.ExpressionAttributeValues = {
                ':search': { S: search },
            };
        }

        try {
            return await client.scan(params).promise();
        } catch (err) {
            console.error(err);
            return null;
        }
    };

    static async createStudentGroup(group_name, group_id, email) {
        const params = {
            TableName: tableName,
            Item: {
                group_id: { N: group_id },
                group_name: { S: group_name },
                description: { S: "" },
                group_photo: { S: DEFAULT_PROFILE_PICTURE },
            }
        };

        try {
            await client.putItem(params).promise();
            await MemberGroupModel.addGroupMember(email, group_id);
            return params.Item;
        } catch (err) {
            console.error(err);
            return null;
        }
    }
}

module.exports = StudentGroupModel;


