const AWS = require('aws-sdk');
const MemberGroupModel = require('./memberGroup');
const StudentGroupModel = require('./studentGroup');
const Emailer = require('./tools/emailer');
const { getNextId } = require('./tools/helper');
const UserModel = require('./user');

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
     * @param {string|null} group_id - The ID of the student group IF the student group already exists.
     * @returns {Promise<object|null>} - A Promise that resolves to an object containing the results of the request creation, or null if an error occurred.
     */
    static async requestStudentGroup(email, description, group_name, group_id){

        try{
            let groupDetails = {
                description: description,
                group_name: group_name,
                email: email
            };

            if (group_id) {
                const existingGroup = await StudentGroupModel.getStudentGroupById(group_id);
                groupDetails.group_name = existingGroup?.Item?.group_name?.S || group_name;
                groupDetails.group_id = existingGroup?.Item?.group_id?.N || await getNextId("StudentGroups", client);
            }
            else {
                groupDetails.group_id = await getNextId("StudentGroups", client);
            }
            
            var params = {
                TableName: tableName,
                Item: {
                    'email': { S: groupDetails.email },
                    'group_id': { N: groupDetails.group_id},
                    'decision': { S: "pending"},
                    'description': { S: groupDetails.description },
                    'group_name': {S: groupDetails.group_name}
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

            await this.sendDecisionNotification(email, group_id, "rejected", "UEvents Group Request Rejected");

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

            await this.sendDecisionNotification(email, id, "approved", "UEvents Group Request Approved");

            return true;
        }
        catch (err) {
            console.error(err);
            return false;
        }
    }

    static async sendDecisionNotification(email, group_id, decision, subject) {
        try {
            const req = await this.getRequestByKey(email, group_id);
            const req_user = await UserModel.profile(email);
            const res = await Emailer.sendSingleDecisionEmail(
                email, 
                req_user.first_name.S, 
                req.group_name.S, 
                decision, 
                subject
            );
    
            return res;
        }
        catch (err) {
            console.error(err);
        }
    }
}

module.exports = RequestModel;