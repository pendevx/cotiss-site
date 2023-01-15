import React from "react";
import styles from "../styles/index.module.css";

const _PORT = process.env.port || 8080;

// uploadQuote: uploads a piece of feedback to the DynamoDB table
function uploadQuote(_dbData, inputtedQuote) {
    // Ignore empty feedback
    if (inputtedQuote.trim() === "") {
        return;
    }

    fetch(`http://localhost:${_PORT}/api/upload-data-ddb`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            PORT: _PORT,
            dbData: _dbData,
            quote: inputtedQuote
        })
    });

    _dbData.TableItemCount++;

    // Replace the data in the json file with an updated TableItemCount
    fetch(`http://localhost:${_PORT}/api/update-db-data`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(_dbData)
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
    const _dbData = await fetch(`http://localhost:${_PORT}/api/read-db-data`).then(res => res.json());

    let props = { data: _dbData };

    if (_dbData.TableItemCount === 0) {
        props.error = "No feedback in the database!";
        return { props };
    }
    
    const quote = await fetch(`http://localhost:${_PORT}/api/read-db-quote`, {
        method: "POST",
        headers: { 
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            PORT: _PORT,
            dbData: _dbData
        })
    })
    .then(res => res.json())
    .then(data => data.quote)
    .catch(err => {
        console.log(err);
        props.error = "Error reading data from the DynamoDB table.";
    });

    props.quote = quote;

    return { props };
}
