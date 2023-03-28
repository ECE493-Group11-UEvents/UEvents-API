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
}

module.exports = MemberGroupModel;


