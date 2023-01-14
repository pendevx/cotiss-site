import { DynamoDBClient, GetItemCommand } from "@aws-sdk/client-dynamodb";

export default function uploadToDDB(req, res) {
    const ddbCredentials = fetch(`http://localhost:${req.body.PORT}/api/get-api-keys`).then(res => res.json()).catch(err => console.log(err));

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

    client.send(command)
        .then(data => {
            const quote = data.Item.quote.S;
            console.log(data);
            res.status(200).json({ quote: quote });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: err });
        }
    );
}
