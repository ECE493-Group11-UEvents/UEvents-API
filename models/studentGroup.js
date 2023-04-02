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

    static async requestStudentGroup(email, description, id){
        var result;
        try{
            // if(id && this.getStudentGroupById(id)){
                var params = {
                    TableName: 'Requests',
                    Item: {
                    'email': { S: email },
                    'group_id-role': { S: id+"-event_coordinator"},
                    'decision': { S: "pending"},
                    'description': { S: description },
                    'id': { N: id }
                    }
                };
                result = await client.putItem(params).promise();
            // }
            // else{
            //     var params = {
            //         TableName: 'Requests',
            //         Item: {
            //         'email': { S: email },
            //         'decision': {S: "pending"},
            //         'description': { S: description },
            //         'id': { N: null }
            //         }
            //     };
            //     result = await client.putItem(params).promise();
            // }
            return result;
        }
        catch (err) {
            console.error(err);
            return null;
        }
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


