const AWS = require('aws-sdk');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
dotenv.config();

AWS.config.update({
    region: process.env.REGION,
    accessKeyId: process.env.DB_ACCESS_KEY,
    secretAccessKey: process.env.DB_SECRET_ACCESS_KEY,
});

const client = new AWS.DynamoDB();

const tableName = 'Users';

class UserModel {

    // check if username exists
    static async userExists(email){
        const params = {
            TableName: tableName,
            Key: {
                'email' : {S: email},
            }
        }
        try {
            const result = await client.getItem(params).promise();
            // console.log(result.Item);
            if(result.Item == null){
                return false;
            }
            return true; // Return the first item if it exists, null otherwise
        } catch (err) {
            console.error(err);
            return null;
        }

    }

    // creates a user
    static async create( email,first_name, last_name, password, profile_picture, roles ) {

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
}

module.exports = UserModel;


