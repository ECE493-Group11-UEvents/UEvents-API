/**
 * UserModel class for interacting with DynamoDB table for user data.
 */

const AWS = require('aws-sdk');
const bcrypt = require('bcrypt');

AWS.config.update({
  region: process.env.REGION,
  accessKeyId: process.env.DB_ACCESS_KEY,
  secretAccessKey: process.env.DB_SECRET_ACCESS_KEY,
});

const client = new AWS.DynamoDB();

const tableName = 'Users';

class UserModel {

    /**
     * Check if user with specified email exists in the DynamoDB table.
     * @param {String} email - The email address of the user.
     * @returns {Boolean} - True if user exists, false if not, null if there is an error.
     */
    static async userExists(email){
        const params = {
            TableName: tableName,
            Key: {
                'email' : {S: email},
            }
        }
        try {
            const result = await client.getItem(params).promise();

            if(result.Item == null){
                return false;
            }
            return true; // Return the first item if it exists, null otherwise
        } catch (err) {
            console.error(err);
            return null;
        }

    }

    /**
     * Create a new user with the specified data in the DynamoDB table.
     * @param {String} email - The email address of the user.
     * @param {String} first_name - The first name of the user.
     * @param {String} last_name - The last name of the user.
     * @param {String} password - The password for the user.
     * @param {String} profile_picture - The URL of the user's profile picture.
     * @param {Array} roles - An array of roles for the user.
     * @returns {Object} - The newly created user object.
     */
    static async create( email,first_name, last_name, password, profile_picture = "", roles = []) {

        const salt = await bcrypt.genSalt();
        var hash = await bcrypt.hash(password, salt);
        hash = hash.toString();

        const item = {
          "email": {"S": email},
          "first_name": {"S": first_name},
          "last_name": {"S": last_name},
          "password": {"S": hash},
          "profile_picture": {"S": profile_picture},
          "roles": {"L": roles},
        };
    
        await client.putItem({ TableName: tableName, Item: item }).promise();
    
        return item;
    }

    /**
     * Check if login credentials are valid for the specified user.
     * @param {String} email - The email address of the user.
     * @param {String} password - The password for the user.
     * @returns {Object|null} - The user object if credentials are valid, null if not or if there is an error.
     */
    static async login(email, password){
        try {
            // Retrieve item from the table by email
            const result = await client.getItem({
              TableName: tableName,
              Key: {
                "email": {"S": email}
              }
            }).promise();
        
            const hash = result.Item.password.S;
            const isValidPassword = await bcrypt.compare(password, hash);
        
            if (isValidPassword) {
              // Password is valid, return the user object
              const user = {
                email: result.Item.email.S,
                first_name: result.Item.first_name.S,
                last_name: result.Item.last_name.S,
                profile_picture: result.Item.profile_picture.S,
                roles: result.Item.roles.L
              };
              return user;
            } else {
              // Password is invalid, return null
              return null;
            }
          } catch (err) {
            console.error(err);
            return null;
          }
    }

    /**
     * Change the password for the specified user.
     * @param {String} email - The email address of the user.
     * @param {String} new_password - The new password for the user.
     * @returns {Boolean} - True if password was successfully changed, false if not.
     */
    static async change_password(email, new_password){
        try {
            // Generate a new hash for the new password
            const salt = await bcrypt.genSalt();
            const hash = await bcrypt.hash(new_password, salt);
        
            // Update the password attribute of the item in the DynamoDB table
            await client.updateItem({
              TableName: tableName,
              Key: {
                "email": {"S": email}
              },
              UpdateExpression: "SET #password = :password",
              ExpressionAttributeNames: {
                "#password": "password"
              },
              ExpressionAttributeValues: {
                ":password": {"S": hash.toString()}
              }
            }).promise();
        
            // Return true to indicate success
            return true;
          } catch (err) {
            console.error(err);
            return false;
          }
    }

    /**
     * Retrieves the user profile information associated with the given email address
     * @param email The email address for the user whose profile information is being retrieved
     * @return An array containing the user's profile information (email, first name, last name, and profile picture), or null if the user cannot be found
     */
    static async profile(email){
        try {
            
            var params = {
                TableName: tableName,
                Key: {
                    'email' : {S: email},
                },
                ProjectionExpression: 'email, first_name, last_name, profile_picture',
            }

            var result_user = await client.getItem(params).promise();

            var result = new Array();

            result.push(result_user);

            return result;

        }
        catch(err){
            console.error(err);
            return null;
        }
    }

    /**
     * Updates the user profile information associated with the given email address
     * @param email The email address for the user whose profile information is being updated
     * @param first_name The new first name for the user
     * @param last_name The new last name for the user
     * @param profile_picture The new profile picture for the user
     * @return A string indicating whether the profile was successfully updated or if the user does not exist
     */
    static async editProfile(email, first_name, last_name, profile_picture){

        if(await this.userExists(email)){
            var params = {
                TableName: tableName,
                Key: { email: { S: email } },
                UpdateExpression: 'set first_name = :fn, last_name = :ln, profile_picture = :pp',
                ExpressionAttributeValues: {
                ':fn': { S: first_name },
                ':ln': { S: last_name },
                ':pp': { S: profile_picture }
                },
                ReturnValues: 'ALL_NEW'
            };
            try {
                const result = await client.updateItem(params).promise();
                return "Successfuly update the profile";
            } catch (error) {
                console.error(error);
                throw error;
            }
        }
        else {
            return "User does not exist";
        }

    }
}

module.exports = UserModel;


