const AWS = require('aws-sdk');
const dotenv = require('dotenv');
dotenv.config();

AWS.config.update({
    region: process.env.REGION,
    accessKeyId: process.env.DB_ACCESS_KEY,
    secretAccessKey: process.env.DB_SECRET_ACCESS_KEY,
});

const client = new AWS.DynamoDB();

class FollowGroupModel {

    static async getFollowers(group_id){
        const params = {
            TableName: 'FollowGroup',
            FilterExpression: 'group_id = :group_id',
            ExpressionAttributeValues: {
                ":group_id": { N: group_id },
            }
        };

        try {
            const result = await client.scan(params).promise();
            return result;
        } catch (err) {
            console.error(err);
            return null;
        }
    }

    static async isFollowing(group_id, follower){
        const params = {
            TableName: "FollowGroup"
        };

        try {
            let result = await client.scan(params).promise();
            result = result.Items.filter(user => {
                return user.group_id.N === group_id & user.email.S === follower
            })
            return result.length > 0;
        } catch (err) {
            console.error(err);
            return null;
        }
    }

    static async getFollowingGroups(email) {
        const params = {
            TableName: 'FollowGroup',
            KeyConditionExpression: "email = :email",
            ExpressionAttributeValues: {
                ":email": { S: email }
            }
        }
        try {
            const result = await client.query(params).promise();
            return result;
        }
        catch(err) {
            console.error(err);
            return null;
        }
    }

    static async follow(email, group_id){
        try{
            var params = {
                TableName: 'FollowGroup',
                Item: {
                    email: { S: email },
                    group_id: { N: group_id },
                },
            };

            console.log(params)
            await client.putItem(params).promise();

            return { message: `Successfully followed ${group_id}` };
        }
        catch(err){
            console.error(err);
            return null;
        }
    }

    static async unfollow(email, group_id){
        try{
            var params = {
                TableName: 'FollowGroup',
                Key: {
                  group_id: { N: group_id },
                  email: { S: email }
                }
              };
              await client.deleteItem(params).promise();
              return { message: `Successfully unfollowed ${group_id}` };
        }
        catch(err){
            console.error(err);
            return null;
        }    
    }

}

module.exports = FollowGroupModel;
