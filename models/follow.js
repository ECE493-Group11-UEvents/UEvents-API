const AWS = require('aws-sdk');
const dotenv = require('dotenv');
dotenv.config();

AWS.config.update({
    region: process.env.REGION,
    accessKeyId: process.env.DB_ACCESS_KEY,
    secretAccessKey: process.env.DB_SECRET_ACCESS_KEY,
});

const client = new AWS.DynamoDB();

class FollowModel {

    // checks to see if user_a is following user_b
    static async isFollowing(user_a, user_b) {

    }

    static async getFollowers(email){
        try{
            // getting the followers
            var params = {
                TableName: 'FollowUser',
                IndexName: 'followee_email-index',
                KeyConditionExpression: 'followee_email = :followeeEmail',
                ExpressionAttributeValues: {
                ':followeeEmail': { S: email }
                }
            };

            var result = await client.query(params).promise();
            return result;
        }
        catch(err){
            console.error(err);
            return null;
        }
    }

    static async getFollowings(email){
        try{
            // getting the followings
            var params = {
                KeyConditionExpression: 'follower_email = :email',
                ExpressionAttributeValues: {
                ':email': { S: email }
                },
                TableName: 'FollowUser'
            };

            var result = await client.query(params).promise();
            return result;
        }
        catch(err){
            console.error(err);
            return null;
        }
    }

}

module.exports = FollowModel;
