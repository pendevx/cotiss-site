import fs from "fs"; 

export default function fileService(req, res) {
    console.log(req.body);
    fs.writeFile("./data/DbData.json", req.body, err => {
        if (err) {
            console.log(`Error updating table info: ${err}`);
            res.status(500);
            return;
        }
        res.status(200);
    })
}
