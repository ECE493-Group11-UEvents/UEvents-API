

/**
 * Helper function for getting the next unique ID to use for a new item
 * @param {string} counterName The name of the counter to use
 * @param {DynamoDB} client The DynamoDB client to use
 * @returns {Promise<string | null>} The next ID to use
 */
async function getNextId(counterName, client) {
    // Increment the value of the LAST_USED_ID item
    const updateParams = {
        TableName: 'COUNTERS',
        Key: { "table_name": {'S': counterName} },
        UpdateExpression: 'SET #value = #value + :incr',
        ExpressionAttributeNames: {
            '#value': 'LAST_USED_ID',
        },
        ExpressionAttributeValues: {
            ':incr': {"N": "1"},
        },
        ReturnValues: 'UPDATED_NEW',
    };
    
    try {
        const updatedData = await client.updateItem(updateParams).promise();
        return updatedData.Attributes.LAST_USED_ID.N;
    } catch (err) {
        console.error('Error getting the next ID:', JSON.stringify(err));
        throw err;
    }
};

module.exports = {getNextId}