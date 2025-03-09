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
function handleLogout(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const cookies = req.cookies;
        try {
            if (!cookies.jwt) {
                return res.sendStatus(204); // No content sent
            }
            const refreshToken = cookies.jwt;
            const foundUser = yield User.findOne({ refreshToken }).exec();
            if (!foundUser) {
                res.clearCookie('jwt', { httpOnly: true, sameSite: 'none', secure: true });
                return res.sendStatus(204);
            }
            foundUser.refreshToken = '';
            yield foundUser.save();
            res.clearCookie('jwt', { httpOnly: true, sameSite: 'none', secure: true });
            return res.sendStatus(204);
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ msg: error.message });
        }
    });
}
export default handleLogout;
