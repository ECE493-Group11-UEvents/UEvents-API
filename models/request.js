const AWS = require('aws-sdk');
const MemberGroupModel = require('./memberGroup');
const StudentGroupModel = require('./studentGroup');
const { getNextId } = require('./tools/helper')

AWS.config.update({
    region: process.env.REGION,
    accessKeyId: process.env.DB_ACCESS_KEY,
    secretAccessKey: process.env.DB_SECRET_ACCESS_KEY,
});

const client = new AWS.DynamoDB();

const tableName = 'Requests';

class RequestModel {

    /**
     * Check if a request with a specific group ID exists in the 'Requests' table.
     * @param {string} email - The email address of the requester.
     * @param {string} id - The ID of the group to check for in the 'Requests' table.
     * @returns {Promise<AWS.DynamoDB.ItemList|null>} - A Promise that resolves to a JSON object containing the results of the request, or null if an error occurred.
     */
    static async getRequestByKey(email, id){
        try{
            const params = {
                TableName: tableName,
                KeyConditionExpression: "#pk = :pk and #sk = :sk",
                ExpressionAttributeNames: {
                  "#pk": "email",
                  "#sk": "group_id",
                },
                ExpressionAttributeValues: {
                  ":pk": { S: email },
                  ":sk": { N: id },
                },
            }

            const result = await client.query(params).promise();

            return result.Items[0];
        }
        catch (err) {
            console.error(err);
            return null;
        }
    }

    /**
     * Create a new request in the 'Requests' table for a specific student group.
     * @param {string} email - The email address of the requester.
     * @param {string} description - The description of the student group.
     * @param {number} id - The ID of the student group.
     * @param {string} group_name - The name of the student group.
     * @returns {Promise<object|null>} - A Promise that resolves to an object containing the results of the request creation, or null if an error occurred.
     */
    static async requestStudentGroup(email, description, group_name){

        try{
            let nextId = await getNextId("StudentGroups", client);

            var params = {
                TableName: tableName,
                Item: {
                    'email': { S: email },
                    'group_id': { N: nextId},
                    'decision': { S: "pending"},
                    'description': { S: description },
                    'group_name': {S: group_name}
                }
            };
            
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
            TableName: tableName,
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
            TableName: tableName,
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
     * @param {string} id - The ID of the group the requester is requesting to join.
     * @returns {Promise<boolean>} - A Promise that resolves to a boolean indicating whether the request was successfully accepted and the requester added as a member of the group.
     */
    static async acceptRequest(email, id){
        try {
            // get the request
            const group_req = await this.getRequestByKey(email, id);

            if (!group_req) return false

            // approving the request
            const params = {
                TableName: tableName,
                Key: {
                    email: { S: group_req.email.S },
                    group_id: { N: group_req.group_id.N },
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

            // creating a group if it doesn't exist
            if(Object.keys(await StudentGroupModel.getStudentGroupById(id)).length === 0){
                await StudentGroupModel.createStudentGroup(group_req.group_name.S, group_req.group_id.N, group_req.email.S);
            }
            // else if it does exist, we add the member
            else {
                await MemberGroupModel.addGroupMember(group_req.email.S, group_req.group_id.N);
            }

            return true;
        }
        catch (err) {
            console.error(err);
            return false;
        }
    }

}

module.exports = RequestModel;