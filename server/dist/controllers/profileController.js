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
import Vocabulary from "../models/Vocabulary";
function getProfile(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const foundUser = yield User.findById(req.userInfo._id).populate('vocabularies').exec();
            if (!foundUser) {
                return res.status(404).json({ msg: `User ${req.userInfo.username} not found` });
            }
            res.status(200).json({
                username: foundUser.username,
                vocabularies: foundUser.vocabularies,
            });
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ message: error.message });
        }
    });
}
function updateUsername(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { username } = req.body;
        try {
            const updatedUser = yield User.findByIdAndUpdate(req.userInfo._id, { username });
            if (!updatedUser) {
                console.log('user not found');
                return res.status(404).json({ msg: `User with ID ${req.userInfo._id} not found` });
            }
            res.sendStatus(204);
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ message: error.message });
        }
    });
}
function deleteAccount(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const userToDelete = yield User.findByIdAndDelete(req.userInfo._id);
            if (!userToDelete) {
                return res.status(404).json({ msg: `User ID ${req.userInfo._id} not found` });
            }
            // remove all user's vocabs
            yield Vocabulary.deleteMany({ userId: req.userInfo._id });
            res.sendStatus(204);
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ msg: error.message });
        }
    });
}
export { getProfile, updateUsername, deleteAccount };
