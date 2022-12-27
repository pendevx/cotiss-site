import fs from "fs"; 

export default function fileService(req, res) {
    let json = {};
    fs.readFile("./data/DbData.json", (err, data) => {
        data = JSON.parse(data.toString());

        if (err) {
            throw err;
        }

        json = data;

        res.status(200).json(json); 
        return;
    });

    res.status(500);
}
