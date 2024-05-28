import {SESClient} from "@aws-sdk/client-ses";
import {sesClient} from "./index";

const region = "eu-west-1";

// Create an SES client with the specified region and credentials from a shared config file (like ~/.aws/credentials)
export function initializeSESClient() {
    return new SESClient({
        region: region,
        credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
        }
    });
}

export const getAWSCredentials = async () => {
    try {
        const credentials = await sesClient.config.credentials();
        console.log("Access key:", credentials.accessKeyId);
    } catch (err: any) {
        if (err) {
            console.log('AWS ERROR GET CREDENTIALS', err);
        } else {
            console.log('Unexpected error', err);
        }
    }
};