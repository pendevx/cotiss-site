import fs from "fs"; 
const requestIp = require("request-ip");

export default function fileService(req, res) {
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

    console.log(req.body);
    fs.writeFile("./data/DbData.json", JSON.stringify(req.body, null, 4), err => {
        if (err) {
            console.log(`Error updating table info: ${err}`);
            res.status(500);
            return;
        }
        res.status(200);
    })
}
