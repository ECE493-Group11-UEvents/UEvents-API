const AWS = require('aws-sdk');
const bcrypt = require('bcrypt');
const crypto = require('crypto');


// const { DynamoDBClient, PutItemCommand } = require("@aws-sdk/client-dynamodb");


AWS.config.update({
  region: 'us-east-2',
  accessKeyId: process.env.ACCESSKEY,
  secretAccessKey: process.env.SECRETACCESSKEY,
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

    }
}

module.exports = UserModel;


