import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { SESClient } from "@aws-sdk/client-ses";
import { S3Client } from "@aws-sdk/client-s3";

const region = process.env.AWS_REGION || "us-east-1";

export const ddbClient = new DynamoDBClient({ region });
export const ddbDoc = DynamoDBDocumentClient.from(ddbClient);
export const sesClient = new SESClient({ region });
export const s3Client = new S3Client({ region });