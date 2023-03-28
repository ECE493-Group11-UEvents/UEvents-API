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
    static async isFollowing(follower_email, followee_email) {
        try{
            var params = {
                TableName: 'FollowUser',
                Key: {
                'follower_email': { S: follower_email },
                'followee_email': { S: followee_email }
                }
            };

            var result = await client.getItem(params).promise();
            // console.log(result);

            if(!(result.Item)){
                return false;
            }

            return result;
        }
        catch(err){
            console.error(err);
            return null;
        }
    }

    static async isFollowConfirm(follower_email, followee_email){

        var result = await this.isFollowing(follower_email, followee_email);

        if(result.Item){
            return result.Item.followee_confirm.BOOL;
        }

        return false;
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

    static async follow(follower_email, followee_email){
        try{
            var params = {
                TableName: 'FollowUser',
                Item: {
                follower_email: { S: follower_email },
                followee_email: { S: followee_email },
                followee_confirm: { BOOL: false }
                },
            };

            await client.putItem(params).promise();
            
            return { message: `Successfully followed ${followee_email}` };
        }
        catch(err){
            console.error(err);
            return null;
        }
    }

    static async unfollow(follower_email, followee_email){
        try{
            var params = {
                TableName: 'FollowUser',
                Key: {
                  follower_email: { S: follower_email },
                  followee_email: { S: followee_email }
                }
              };
              await client.deleteItem(params).promise();
              return { message: `Successfully unfollowed ${followee_email}` };
        }
        catch(err){
            console.error(err);
            return null;
        }    
    }

}

module.exports = FollowModel;
