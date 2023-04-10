const AWS = require('aws-sdk');

AWS.config.update({
  region: process.env.REGION,
  accessKeyId: process.env.DB_ACCESS_KEY,
  secretAccessKey: process.env.DB_SECRET_ACCESS_KEY,
});

const client = new AWS.DynamoDB();

const tableName = 'MemberGroup';

class MemberGroupModel {
    /**
     * Gets the MemberGroups the user belongs to (group ids)
     * @param {string} email email of the user
     * @returns membergroups that the user belongs to
     */
    static async getMemberGroups(email){
        const params = {
            TableName: tableName,
            KeyConditionExpression: '#pk = :pkValue',
            ExpressionAttributeNames: {
                '#pk': 'email',
            },
            ExpressionAttributeValues: {
                ':pkValue': {"S": email},
            },
        }
        try {
            return await client.query(params).promise();
        } catch (err) {
            console.error(err);
            return null;
        }
    }

    /**
     * Retrieves the email addresses of all members of a group with the specified ID.
     * 
     * @param {string} id - The ID of the group to retrieve members for.
     * @returns {Promise<Array<Object>|null>} - A Promise that resolves to an array of objects containing email addresses for the members of the specified group, or null if an error occurs.
     */
    static async getGroupMembers(id){

        try{

            var params = {
                TableName: tableName,
                IndexName: 'group_id-email-index',
                KeyConditionExpression: 'group_id = :id',
                ExpressionAttributeValues: {
                    ':id': { N: id }
                },
                ProjectionExpression: 'email'
            }

            const result = await client.query(params).promise();

            return result.Items;
        }
        catch (err) {
            console.error(err);
            return null;
        }
    }
    
    /**
     * Deletes a group member with the specified email address and group ID.
     * 
     * @param {string} email - The email address of the group member to delete.
     * @param {number} id - The ID of the group to delete the member from.
     * @returns {Promise<object|null>} - A Promise that resolves to the result of the delete operation, or null if an error occurs.
     */
    static async deleteGroupMember(email, id){
        try{
            var params = {
                TableName: tableName,
                Key: {
                    "email": { "S": email },
                    "group_id": { "N": id.toString() }
                }
            };
            const result = await client.deleteItem(params).promise();
            return result;
        }
        catch (err) {
            console.error(err);
            return null;
        }
    }

    static async addGroupMember(email, id){
        try{
            var params = {
                TableName: tableName,
                Item: {
                    "email": { "S": email },
                    "group_id": { "N": id.toString() }
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
}

module.exports = MemberGroupModel;


