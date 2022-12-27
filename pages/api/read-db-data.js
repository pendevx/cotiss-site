import fs from "fs"; 

export default function fileService(req, res) {
    fs.readFile("./data/DbData.json", (err, data) => {
        data = JSON.parse(data.toString());

        if (err) {
            throw err;
        }

        res.status(200).json(data); 
    });

    res.status(500);
}
