import { DynamoDBClient, GetItemCommand } from "@aws-sdk/client-dynamodb";
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
    
    const params = {
        TableName: req.body.dbData.TableName,
        Key: {
            "quoteId": {
                N: `${Math.floor(Math.random() * req.body.dbData.TableItemCount)}`,
            },
        },
    };

    const command = new GetItemCommand(params);

    try {
        const data = await client.send(command);
        const quote = data.Item.quote.S;
        console.log(data);
        res.status(200).json({ quote: quote });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Error fetching data from DynamoDB table" });
    }
}
