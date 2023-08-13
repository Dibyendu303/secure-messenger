/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */

const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { PutCommand, DynamoDBDocumentClient } = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const tableName = process.env.USERTABLE;

exports.handler = async (event, context) => {
  // insert code to be executed by your lambda trigger

  // save user to DynamoDB
  if (!event?.request?.userAttributes?.sub) {
    console.log("No sub provided");
    return;
  }

  const now = new Date();
  const timeStamp = now.getTime();

  const userItem = {
    __typename: 'User',
    _lastChangedAt: timeStamp,
    _version: 1,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    id: event.request.userAttributes.sub,
    name: event.request.userAttributes.name,
    email: event.request.userAttributes.email,
    userName: event.request.userAttributes.preferred_username,
  }

  console.log('User attributes: ', event.request.userAttributes);

  const command = new PutCommand({
    TableName: tableName,
    Item: userItem
  });

  // Call DynamoDB to add the item to the table
  try {
    const response = await docClient.send(command);
    console.log('Successfully added user to DynamoDB');
    console.log(response);
  } catch (e) {
    console.log('Error while adding user to DynamoDB.');
    console.log(e);
  }
};
