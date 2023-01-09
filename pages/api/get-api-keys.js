const requestIp = require("request-ip");

export default function getApiKeys(req, res) {
    const clientIp = requestIp.getClientIp(req);

    if (!(clientIp === "::1" || clientIp === "127.0.0.1")) {
        res.status(400);
        return;
    }
    
    res.status(200).json({
        accessKeyId: process.env.DDB_Quotes_AKI,
        secretAccessKey: process.env.DDB_Quotes_SAK
    });
}
