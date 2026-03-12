import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, PutCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { UserData } from './types';

const client = new DynamoDBClient({
  region: process.env.APP_AWS_REGION || 'us-east-1',
});

const docClient = DynamoDBDocumentClient.from(client);
const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME || 'latijn-users';

export async function getUser(userId: string): Promise<UserData | undefined> {
  const command = new GetCommand({
    TableName: TABLE_NAME,
    Key: {
      userId: userId,
    },
  });

  try {
    const response = await docClient.send(command);
    return response.Item as UserData | undefined;
  } catch (error) {
    console.error("Error getting user from DynamoDB:", error);
    return undefined;
  }
}

export async function saveUser(user: UserData) {
  const command = new PutCommand({
    TableName: TABLE_NAME,
    Item: user,
  });

  try {
    await docClient.send(command);
  } catch (error) {
    console.error("Error saving user to DynamoDB:", error);
    throw error;
  }
}

export async function updateUser(userId: string, update: Partial<UserData>) {
  // Building dynamic update expression
  let updateExpression = "SET";
  const expressionAttributeNames: Record<string, string> = {};
  const expressionAttributeValues: Record<string, any> = {};

  Object.entries(update).forEach(([key, value], index) => {
    const attributeName = `#attr${index}`;
    const attributeValue = `:val${index}`;
    
    updateExpression += ` ${attributeName} = ${attributeValue},`;
    expressionAttributeNames[attributeName] = key;
    expressionAttributeValues[attributeValue] = value;
  });

  // Remove trailing comma
  updateExpression = updateExpression.slice(0, -1);

  const command = new UpdateCommand({
    TableName: TABLE_NAME,
    Key: { userId },
    UpdateExpression: updateExpression,
    ExpressionAttributeNames: expressionAttributeNames,
    ExpressionAttributeValues: expressionAttributeValues,
  });

  try {
    await docClient.send(command);
  } catch (error) {
    console.error("Error updating user in DynamoDB:", error);
    throw error;
  }
}
