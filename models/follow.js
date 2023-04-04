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

    /**
     * Checks if a follower is following a specific followee.
     * @param {string} follower_email - The email address of the follower.
     * @param {string} followee_email - The email address of the followee.
     * @returns {Promise<boolean|null>} - A Promise that resolves to a boolean indicating whether or not the follower is following the followee, or null if an error occurs.
     */
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

    /**
     * Checks if a follower's follow request to a followee has been confirmed.
     * @param {string} follower_email - The email address of the follower.
     * @param {string} followee_email - The email address of the followee.
     * @returns {Promise<boolean>} - A Promise that resolves to a boolean indicating whether or not the follow request has been confirmed, or false if the follow request has not been confirmed.
     */
    static async isFollowConfirm(follower_email, followee_email){

        var result = await this.isFollowing(follower_email, followee_email);

        if(result.Item){
            return result.Item.followee_confirm.BOOL;
        }

        return false;
    }

    /**
     * Retrieves a list of followers for a specific user.
     * @param {string} email - The email address of the user whose followers are to be retrieved.
     * @returns {Promise<object|null>} - A Promise that resolves to an object containing the user's followers, or null if an error occurs.
     */
    static async getFollowers(email){
        try{
            // getting the followers that are accepeted
            var params = {
                TableName: 'FollowUser',
                IndexName: 'followee_email-index',
                KeyConditionExpression: 'followee_email = :followeeEmail',
                FilterExpression: 'followee_confirm = :confirm',
                ExpressionAttributeValues: {
                  ':followeeEmail': { S: email },
                  ':confirm': { BOOL: true }
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

    /**
     * Retrieves a list of follow requests for a specific user.
     * @param {string} email - The email address of the user whose followers are to be retrieved.
     * @returns {Promise<object|null>} - A Promise that resolves to an object containing the user's followers, or null if an error occurs.
     */
    static async getFollowRequests(email){
        try{
            // getting the followers that are accepeted
            var params = {
                TableName: 'FollowUser',
                IndexName: 'followee_email-index',
                KeyConditionExpression: 'followee_email = :followeeEmail',
                FilterExpression: 'followee_confirm = :confirm',
                ExpressionAttributeValues: {
                  ':followeeEmail': { S: email },
                  ':confirm': { BOOL: false }
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

    /**
     * Retrieves a list of users that a specific user is following.
     * @param {string} email - The email address of the user who is following others.
     * @returns {Promise<object|null>} - A Promise that resolves to an object containing the users that the specified user is following, or null if an error occurs.
     */
    static async getFollowings(email){
        try{
            // getting the followings
            var params = {
                KeyConditionExpression: 'follower_email = :follower_email',
                ExpressionAttributeValues: {
                    ':follower_email': { S: email },
                    ':confirm': { BOOL: true }
                },
                FilterExpression: 'followee_confirm = :confirm',
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

    /**
     * Sends a follow request from a follower to a followee.
     * @param {string} follower_email - The email address of the follower.
     * @param {string} followee_email - The email address of the followee.
     * @returns {Promise<object|null>} - A Promise that resolves to an object containing a success message if the follow request was sent successfully, or null if an error occurs.
     */
    static async follow(follower_email, followee_email){1
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

    /**
     * Accepts a follow request from a follower on the part of a followee.
     * @param {string} follower_email - The email address of the follower.
     * @param {string} followee_email - The email address of the followee.
     * @returns {Promise<object|null>} - A Promise that resolves to an object containing a success message if the follow request was accepted successfully, or null if an error occurs.
     */
    static async accept(follower_email, followee_email){
        try{
            var params = {
                TableName: 'FollowUser',
                Key: {
                  follower_email: { S: follower_email },
                  followee_email: { S: followee_email }
                },
                UpdateExpression: 'SET followee_confirm = :val',
                ExpressionAttributeValues: {
                  ':val': { BOOL: true }
                },
                ReturnValues: 'ALL_NEW'
              };
              const result = await client.updateItem(params).promise();
              return { message: `Successfully accepted follow from ${follower_email}` };
        }
        catch(err){
            console.error(err);
            return null;
        }   
    }

    /**
     * Unfollows a followee on the part of a follower.
     * @param {string} follower_email - The email address of the follower.
     * @param {string} followee_email - The email address of the followee.
     * @returns {Promise<object|null>} - A Promise that resolves to an object containing a success message if the unfollow was successful, or null if an error occurs.
     */
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
