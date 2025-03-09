var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import Vocabulary from "../models/Vocabulary";
import User from "../models/User";
function getVocabs(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const foundUser = yield User.findById(req.userInfo._id).populate('vocabularies').exec();
            if (!foundUser) {
                return res.status(404).json({ msg: `User ${req.userInfo.username} not found` });
            }
            res.status(200).json({
                vocabularies: foundUser.vocabularies,
            });
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ message: error.message });
        }
    });
}
function addVocab(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { title } = req.body;
            if (!title) {
                return res.status(400).json({ msg: 'Invalid "title" property' });
            }
            const duplicate = yield Vocabulary.findOne({ title }).where({ user: req.userInfo._id });
            if (duplicate) {
                return res.status(409).json({ msg: 'Vocabulary with this name already exists' });
            }
            const newVocab = yield Vocabulary.create({
                "title": title,
                "userId": req.userInfo._id
            });
            const foundUser = yield User.findById(req.userInfo._id).exec();
            const updatedVocabs = [...foundUser.vocabularies, newVocab._id];
            foundUser.vocabularies = updatedVocabs;
            yield foundUser.save();
            yield foundUser.populate('vocabularies');
            return res.status(201).json({
                vocabularies: foundUser.vocabularies
            });
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ msg: error.message });
        }
    });
}
function getVocab(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const foundVocab = yield Vocabulary.findById(req.body._id).lean();
            if (!foundVocab) {
                return res.status(400).json({ msg: 'Vocabulary not found' });
            }
            const { _id, title, words, lang } = foundVocab;
            return res.status(200).json({ _id, title, words, lang });
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ msg: error.message });
        }
    });
}
function updateTitle(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { _id, title } = req.body;
            if (!title) {
                return res.status(400).json({ msg: 'Invalid title property' });
            }
            const duplicate = yield Vocabulary.findOne({ title }).where({ user: req.userInfo._id });
            if (duplicate) {
                return res.status(409).json({ msg: 'Vocabulary with this name already exists' });
            }
            const vocabToUpdate = yield Vocabulary.findByIdAndUpdate(_id, { title });
            if (!vocabToUpdate) {
                return res.status(409).json({ msg: 'Invalid vocab ID' });
            }
            return res.sendStatus(204);
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ msg: error.message });
        }
    });
}
const validLangCodes = ['FRA', 'GER', 'SPA', 'default'];
function updateLang(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { vocabId, updatedLang } = req.body;
            if (!validLangCodes.includes(updatedLang)) {
                return res.status(400).json({ msg: 'Invalid title property' });
            }
            const vocabToUpdate = yield Vocabulary.findByIdAndUpdate(vocabId, { lang: updatedLang }, { new: true });
            if (!vocabToUpdate) {
                return res.status(409).json({ msg: 'Invalid vocab ID' });
            }
            const { _id, title, words, lang } = vocabToUpdate;
            return res.status(200).json({ _id, title, words, lang });
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ msg: error.message });
        }
    });
}
function deleteVocab(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { _id } = req.body;
            yield Vocabulary.findByIdAndDelete(_id);
            const userToUpdate = yield User.findById(req.userInfo._id).exec();
            const updatedVocabs = userToUpdate.vocabularies.filter(vocab => vocab._id.toString() !== _id);
            userToUpdate.vocabularies = updatedVocabs;
            yield userToUpdate.save();
            res.sendStatus(204);
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ msg: error.message });
        }
    });
}
export { getVocabs, addVocab, getVocab, updateTitle, updateLang, deleteVocab };
