import { DynamoDBClient, GetItemCommand, PutItemCommand } from "@aws-sdk/client-dynamodb";
import React from "react";
import styles from "../styles/index.module.css";

// ddb: the DynamoDBClient used to interact with the DynamoDB service
let ddb = new DynamoDBClient({ 
    credentials: {
        accessKeyId: "AKIASDKGBI6CP2E3W5YQ",
        secretAccessKey: "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",
    },
    region: "us-east-1",
});

// uploadQuote: uploads a piece of feedback to the DynamoDB table
function uploadQuote(dbData, inputtedQuote) {
    // Ignore empty feedback
    if (inputtedQuote.trim() === "") {
        return;
    }

    // Parameters to send to DynamoDB
    const params = {
        TableName: dbData.TableName,
        Item: {
            quoteId: {
                N: `${dbData.TableItemCount}`,
            },
            quote: {
                S: inputtedQuote,
            },
        },
    };

    const command = new PutItemCommand(params);

    // Run the PutItemCommand to put an item into the database, and resolve the Promise
    ddb.send(command)
        .then(data => console.log(`Successfully uploaded data to DynamoDB table\n${data}`))
        .catch(err => console.log(`Error uploading data to DynamoDB table\n${err}`));

    dbData.TableItemCount++;

    // Replace the data in the json file with an updated TableItemCount
    fetch("http://localhost:3000/api/update-db-data", {
        method: "PUT",
        headers: {
            "Content-type": "text/plain",
        },
        body: JSON.stringify(dbData, null, 4),
    });
}

// Page: the component for the main page
export default function Page(props) {
    const [ input, setInput ] = React.useState("");

    let quote = "";

    // Handle if there is an error 
    if (props.error) {
        console.log(props.error);
        quote = props.error;
    } else {
        quote = props.quote;
    }

	return (
        <div className={styles.root}>
            <p>{quote}</p>
            <textarea 
                value={input}
                itemID={styles.quoteInput}
                onChange={e => setInput(e.target.value)}/> 
            <br/><br/>
            <button 
                itemID={styles.submitQuote}
                onClick={() => uploadQuote(props.data, input)}>Submit</button>
        </div>
    );
}

export async function getServerSideProps() {
    // Get the table's data from the json file
    const dbData = await fetch("http://localhost:3000/api/read-db-data").then(res => res.json());

    let props = { data: dbData };

    if (dbData.TableItemCount === 0) {
        props.error = "No feedback in the database!";
        return { props };
    }

    const params = {
        TableName: dbData.TableName,
        Key: {
            "quoteId": {
                N: `${Math.floor(Math.random() * dbData.TableItemCount)}`,
            },
        },
    };

    const command = new GetItemCommand(params);

    // Read one piece of data from the DynamoDB table and deal with any errors
    try {
        const data = await ddb.send(command);
        props.quote = data.Item.quote.S;
    } catch (err) {
        console.log(err);
        props.error = "Error fetching feedback from the database.";
    }

    return { props };
}
