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
        // try{
        //     // getting the followers that are accepeted
        //     var params = {
        //         TableName: 'FollowUser',
        //         IndexName: 'followee_email-index',
        //         KeyConditionExpression: 'followee_email = :followeeEmail',
        //         FilterExpression: 'followee_confirm = :confirm',
        //         ExpressionAttributeValues: {
        //           ':followeeEmail': { S: email },
        //           ':confirm': { BOOL: true }
        //         }
        //     };

        //     var result = await client.query(params).promise();
        //     return result;
        // }
        // catch(err){
        //     console.error(err);
        //     return null;
        // }
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
        // try{
        //     var params = {
        //         TableName: 'FollowUser',
        //         Item: {
        //         follower_email: { S: follower_email },
        //         followee_email: { S: followee_email },
        //         followee_confirm: { BOOL: false }
        //         },
        //     };

        //     await client.putItem(params).promise();

        //     return { message: `Successfully followed ${followee_email}` };
        // }
        // catch(err){
        //     console.error(err);
        //     return null;
        // }
    }

    static async unfollow(email, group_id){
        // try{
        //     var params = {
        //         TableName: 'FollowUser',
        //         Key: {
        //           follower_email: { S: follower_email },
        //           followee_email: { S: followee_email }
        //         }
        //       };
        //       await client.deleteItem(params).promise();
        //       return { message: `Successfully unfollowed ${followee_email}` };
        // }
        // catch(err){
        //     console.error(err);
        //     return null;
        // }    
    }

}

module.exports = FollowGroupModel;
