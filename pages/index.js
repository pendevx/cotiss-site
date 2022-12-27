import useSWR from "swr"; 
import * as AWS from "aws-sdk";
import React from "react";

let dbData = {};
let inputAreaRef = 0;

const fetcher = async (url) => {
    const res = await fetch(url); 
    const data = await res.json();

    if (res.status !== 200) {
        throw new Error(data.message); 
    }

    return data; 
}

function QuoteDisplay(props) {
    let ddb = new AWS.DynamoDB({ apiVersion: "2012-08-10" }); 
    const { data, error } = useSWR("/api/read-db-data", fetcher);

    if (error) {
        console.log(error);
        return <p id="quote-display">Error fetching feedback from the database.</p>; 
    }

    if (!data) {
        return <p>loading...</p>
    }

    if (data.TableItemCount === 0) {
        return <p id="quote-display">No feedback in the database.</p>
    }

    const params = {
        TableName: data.TableName,
        Key: {
            "quoteId": { 
                N: `${Math.random() * data.TableItemCount}`,
            }, 
        }
    };
    
    ddb.getItem(params, (err, data) => {
        if (err) {
            console.log(err); 
            return <p id="quote-display">Error fetching feedback from the database.</p>; 
        } else {
            return <p id="quote-display">{data}</p>
        }
    });
}

async function uploadQuote() {
    const feedback = inputAreaRef.current.value;
    if (feedback === "") {
        return;
    }

    let ddb = new AWS.DynamoDB({ apiVersion: "2012-08-10" }); 

    const params = {
        TableName: dbData.TableName,
        Item: {
            quoteId: {
                N: `${dbData.TableItemCount}`,
            },
            quote: {
                S: feedback,
            },
        },
    };

    // ddb.putItem(params, (err, data) => {
    //     if (err) {
    //         console.log(`Error uploading data to DynamoDB table\n${err}`); 
    //     } else {
    //         console.log(`Successfully uploaded data to DynamoDB table\n${data}`);
    //     }
    // })

    dbData.TableItemCount++;

    console.log(JSON.stringify(dbData));

    fetch("http://localhost:3000/api/update-db-data", {
        method: "PUT",
        headers: {
            "Content-type": "application/json",
        },
        body: JSON.stringify(dbData, null, 4),
    }).then(res => console.log(res));
}

export default function Page() {
    AWS.config.update({
        region: "us-east-1",
        accessKeyId: "AKIASDKGBI6CP2E3W5YQ",
        secretAccessKey: "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",
    }); 

    inputAreaRef = React.useRef(null); 
    const { data, error } = useSWR("/api/read-db-data", fetcher);

    if (error) {
        console.log(`Error reading DynamoDB table info\n${error}`);
        return;
    }

    dbData = data;

    let quoteDisplayArea = <QuoteDisplay/>; 
    let submitButton = <button id="submit-quote" onClick={uploadQuote}>Submit</button>;

	return (
        <div className="root">
            {quoteDisplayArea}
            <textarea id="quote-input" ref={inputAreaRef}></textarea> <br/><br/>
            {submitButton}
        </div>
    );
}
