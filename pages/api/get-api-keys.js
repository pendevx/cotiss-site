const requestIp = require("request-ip");

export default async function getApiKeys(req, res) {
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
    
    res.status(200).json({
        accessKeyId: process.env.DDB_Quotes_AKI,
        secretAccessKey: process.env.DDB_Quotes_SAK
    });
}
