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

    let data = JSON.parse(fs.readFileSync("./data/DbData.json", "utf8"));
    
    res.status(200).json(data);
}
