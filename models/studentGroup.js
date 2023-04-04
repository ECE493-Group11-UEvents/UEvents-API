const AWS = require('aws-sdk');
const MemberGroupModel = require('./memberGroup');
const { v4: uuidv4 } = require('uuid');
const e = require('express');

AWS.config.update({
  region: process.env.REGION,
  accessKeyId: process.env.DB_ACCESS_KEY,
  secretAccessKey: process.env.DB_SECRET_ACCESS_KEY,
});

const DEFAULT_PROFILE_PICTURE = `https://${process.env.BUCKET_NAME}.s3.${process.env.REGION}.amazonaws.com/default_user_photo.jpg`;

const client = new AWS.DynamoDB();

const tableName = 'StudentGroups';

class StudentGroupModel {

    static async requestIdExists(id){
        try{

            var params = {
                TableName: 'Requests',
                IndexName: 'group_id-email-index',
                KeyConditionExpression: 'group_id = :id',
                ExpressionAttributeValues: {
                    ':id': { N: id }
                }
            }

            const result = await client.query(params).promise();
            console.log(result);
            if(result.Items.length === 0){
                return false;
            }
            return true;
        }
        catch (err) {
            console.error(err);
            return null;
        }
    }

    static async requestStudentGroup(email, description, id, group_name){

        try{

            if(id == -1){
                
                var random_id = Math.floor(Math.random() * -100000); 
                console.log(random_id);
                console.log(await this.requestIdExists(id));
                // while(await this.requestIdExists(id)){
                //     random_id = Math.floor(Math.random() * 100000); 
                // }

                var params = {
                    TableName: 'Requests',
                    Item: {
                    'email': { S: email },
                    'group_id': { N: random_id.toString()},
                    'decision': { S: "pending"},
                    'description': { S: description },
                    'group_name': {S: group_name}
                    }
                };
            }
            else{
                var params = {
                    TableName: 'Requests',
                    Item: {
                    'email': { S: email },
                    'group_id': { N: id},
                    'decision': { S: "pending"},
                    'description': { S: description },
                    'group_name': {S: group_name}
                    }
                };
            }
            
            const result = await client.putItem(params).promise();
            return result;
        }
        catch (err) {
            console.error(err);
            return null;
        }
    }

    /**
     * Retrieve all requests with a specific decision status from the 'Requests' table.
     * @param {string} status - The decision status to filter requests by.
     * @returns {Promise<object>} - A Promise that resolves to an object containing the results of the query.
     */
    static async viewRequests(status){
        
        var params = {
            TableName: 'Requests',
            IndexName: 'decision-index',
            KeyConditionExpression: 'decision = :decision',
            ExpressionAttributeValues: {
                ':decision': { S: status }
            }
        }

        const result = await client.query(params).promise();
        return result;
    }

    /**
     * Reject a request in the 'Requests' table for a specific email and group ID.
     * @param {string} email - The email address of the requester.
     * @param {number} group_id - The ID of the group the requester is requesting to join.
     * @returns {Promise<boolean>} - A Promise that resolves to a boolean indicating whether the request was successfully rejected.
     */
    static async rejectRequest(email, group_id){
        var params = {
            TableName: 'Requests',
            Key: {
                email: { S: email },
                group_id: { N: group_id },
            },
            UpdateExpression: 'set #decision = :decision',
            ExpressionAttributeNames: {
            '#decision': 'decision'
            },
            ExpressionAttributeValues: {
                ':decision': { S: 'rejected' }
            },
            ReturnValues: 'ALL_NEW'
        }

        try {
            const result = await client.updateItem(params).promise();
            return result.Attributes !== undefined;
        } catch (error) {
            console.error('Error rejecting request:', error);
            return false;
        }
    }

    /**
     * Accept a request in the 'Requests' table for a specific email and group ID, adding the requester as a member of the group.
     * @param {string} email - The email address of the requester.
     * @param {number} id - The ID of the group the requester is requesting to join.
     * @param {string} name - The name of the group the requester is requesting to join.
     * @returns {Promise<boolean>} - A Promise that resolves to a boolean indicating whether the request was successfully accepted and the requester added as a member of the group.
     */
    static async acceptRequest(email, id, name){

        id = parseInt(id);

        // creating a group if it doesn't exist'
        if(id < 0){
            var params = {
                TableName: 'StudentGroups',
                Item: {
                  group_id: {N: Math.abs(id).toString()},
                  group_name: {S: name},
                  group_photo: {S: DEFAULT_PROFILE_PICTURE},
                },
              };
            await client.putItem(params).promise();
        }

        // adding the coordinator
        var params = {
            TableName: 'MemberGroup',
            Item: {
                email: {S: email},
                group_id: {N: Math.abs(id).toString()},
            }
        }
        await client.putItem(params).promise();

        // approving the request
        params = {
            TableName: 'Requests',
            Key: {
                email: { S: email },
                group_id: { N: id.toString() },
            },
            UpdateExpression: 'set #decision = :decision',
            ExpressionAttributeNames: {
            '#decision': 'decision'
            },
            ExpressionAttributeValues: {
                ':decision': { S: 'approved' }
            },
            ReturnValues: 'ALL_NEW'
        }
        await client.updateItem(params).promise();

        return true;
    }

    /**
     * Gets the student groups the user belongs to
     * @param {string} email email of the user
     * @returns the batched response of the student groups the user belongs to 
     */
    static async getStudentGroups(email){
        let keys = [];
        const memberGroups = await MemberGroupModel.getMemberGroups(email);
        for (let i = 0; i < memberGroups.Count; i++) {
            keys.push({ 'group_id': {"N": memberGroups.Items[i].group_id.N} });
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
}

module.exports = StudentGroupModel;


