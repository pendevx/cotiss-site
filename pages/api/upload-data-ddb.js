import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";

export default function uploadToDDB(req, res) {
    const ddbCredentials = fetch(`http://localhost:${req.body.PORT}/api/get-api-keys`)
        .then(res => res.json())
        .catch(err => console.log(err));

    const client = new DynamoDBClient({ 
        credentials: ddbCredentials,
        region: "us-east-1",
    });

    console.log(req.body);

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

    // Run the PutItemCommand to put an item into the database, and resolve the Promise
    client.send(command)
        .then(data => {
            console.log(`Successfully uploaded data to DynamoDB table\n${data}`);
            res.status(200);
        })
        .catch(err => {
            console.log(`Error uploading data to DynamoDB table\n${err}`);
            res.status(500).json({ error: err });
        }
    );
}
