import jwt from 'jsonwebtoken';
function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (!(authHeader === null || authHeader === void 0 ? void 0 : authHeader.startsWith('Bearer '))) {
        res.sendStatus(401); // Unauthorized
        return;
    }
    const token = authHeader.split(' ')[1];
    const accessSecret = process.env.ACCESS_TOKEN_SECRET;
    if (!accessSecret) {
        res.sendStatus(401);
        return;
    }
    jwt.verify(token, accessSecret, (err, decoded) => {
        if (err) {
            res.sendStatus(403);
            return;
        }
        if (typeof decoded !== 'string' && 'UserInfo' in decoded) {
            req.userInfo = decoded.UserInfo;
        }
        else {
            res.sendStatus(403);
        }
        next();
    });
}
export default verifyJWT;
