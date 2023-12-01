import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, PutCommand, QueryCommandInput, ScanCommand } from "@aws-sdk/lib-dynamodb";

const getCredentials = () => {
    if (import.meta.env.VITE_AWS_ACCESS_KEY_ID && import.meta.env.VITE_AWS_SECRET_ACCESS_KEY) {
      const credentials = {
        accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID,
        secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY,
        
        //sessionToken: import.meta.env.VITE_AWS_SESSION_TOKEN,
      };
      //logger.debug('Using extra DynamoDB Credentials');
      return credentials;
    }
  };

const ddbClient = new DynamoDBClient({
    region: import.meta.env.VITE_AWS_REGION,
    credentials: getCredentials(),
  });

  const ddbDocClient = DynamoDBDocumentClient.from(ddbClient, {
    marshallOptions: {
      convertEmptyValues: false,
      removeUndefinedValues: false,
      convertClassInstanceToMap: true, 
    },
    unmarshallOptions: {
      wrapNumbers: false, 
    },
  });

/*
export async function readFragment(id) {
    const params = {
      TableName: import.meta.env.VITE_AWS_DYNAMODB_TABLE_NAME,
      Key: { id },
    };

    const command = new GetCommand(params);
  
    try {

      const data = await ddbDocClient.send(command);

      return data?.Item;
    } catch (err) {
      //logger.warn({ err, params }, 'error reading fragment from DynamoDB');
      throw err;
    }
  }
  */

 export async function listMarkers() {

    const params:QueryCommandInput = { TableName: import.meta.env.VITE_AWS_DYNAMODB_TABLE_NAME };

  
    // Create a QUERY command to send to DynamoDB
    const command = new ScanCommand(params);
  
    try {
      // Wait for the data to come back from AWS
      const data = await ddbDocClient.send(command);

      return data?.Items;
    } catch (err) {
      //logger.error({ err, params }, 'error getting all fragments for user from DynamoDB');
      throw err;
    }
  }

export const writeEntry = (entry) => {
    // Configure our PUT params, with the name of the table and item (attributes and keys)
    const params = {
      TableName: import.meta.env.VITE_AWS_DYNAMODB_TABLE_NAME,
      Item: entry,
    };
  
    // Create a PUT command to send to DynamoDB
    const command = new PutCommand(params);
  
    try {
      return ddbDocClient.send(command);
    } catch (err) {
      //logger.warn({ err, params, fragment }, 'error writing fragment to DynamoDB');
      throw err;
    }
  }