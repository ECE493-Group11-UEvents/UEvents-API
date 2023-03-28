const AWS = require('aws-sdk');
const MemberGroupModel = require('./memberGroup');

AWS.config.update({
  region: process.env.REGION,
  accessKeyId: process.env.DB_ACCESS_KEY,
  secretAccessKey: process.env.DB_SECRET_ACCESS_KEY,
});

const client = new AWS.DynamoDB();

const tableName = 'StudentGroups';

class StudentGroupModel {
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
}

module.exports = StudentGroupModel;


