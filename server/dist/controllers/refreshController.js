var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import User from "../models/User";
import jwt from 'jsonwebtoken';
function handleRefreshToken(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const cookies = req.cookies;
            if (!(cookies === null || cookies === void 0 ? void 0 : cookies.jwt)) {
                console.log({ msg: 'no refresh token' });
                return res.sendStatus(401); // Unauthorized
            }
            const refreshToken = cookies.jwt;
            const foundUser = yield User.findOne({ refreshToken }).exec();
            if (!foundUser) {
                console.log('user not found');
                return res.sendStatus(403); // Forbidden
            }
            const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
            if (foundUser._id.toString() !== decoded._id) {
                console.log({ msg: 'usernames dont match', username: foundUser.username, decodedUsername: decoded.username });
                return res.sendStatus(403);
            }
            const roles = Object.values(foundUser.roles).filter(Boolean);
            const accessToken = jwt.sign({
                "UserInfo": {
                    "_id": foundUser._id,
                    "username": foundUser.username,
                    "roles": roles
                }
            }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '10s' });
            res.json({ accessToken });
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ msg: error.message });
        }
    });
}
export default handleRefreshToken;
