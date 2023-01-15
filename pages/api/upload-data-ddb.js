import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
const requestIp = require("request-ip");

export default async function uploadToDDB(req, res) {
    function isLocalIP(ip) {
        if (!(ip === "::1" || ip === "127.0.0.1" || ip === "::ffff:127.0.0.1")) {
            return false;
        }
        return true;
    }

    const ip = requestIp.getClientIp(req);
    if (!isLocalIP(ip)) {
        res.status(400);
        return;
    }

    const ddbCredentials = await fetch(`http://localhost:${req.body.PORT}/api/get-api-keys`)
        .then(res => res.json())
        .catch(err => console.log(err));

    const client = new DynamoDBClient({ 
        credentials: ddbCredentials,
        region: "us-east-1",
    });

    // Parameters to send to DynamoDB
    const params = {
        TableName: req.body.dbData.TableName,
        Item: {
            quoteId: {
                N: `${req.body.dbData.TableItemCount}`,
            },
            quote: {
                S: req.body.quote,
            }, 
        },
    };

    const command = new PutItemCommand(params);

    // Run the PutItemCommand to put an item into the database
    try {
        const data = await client.send(command);
        console.log(`Successfully uploaded data to DynamoDB table\n${data}`);
        res.status(200);
    } catch (err) {
        console.log(`Error uploading data to DynamoDB table\n${err}`);
        res.status(500).json({ error: err });
    }
}
