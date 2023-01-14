import fs from "fs"; 

export default function fileService(req, res) {
    let data = JSON.parse(fs.readFileSync("./data/DbData.json", "utf8"));

    console.log(data);
    
    res.status(200).json(data);
}
