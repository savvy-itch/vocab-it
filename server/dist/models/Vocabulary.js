import mongoose, { Schema } from "mongoose";
const wordSchema = new Schema({
    _id: {
        type: String,
        required: true,
    },
    word: {
        type: String,
        required: true
    },
    translation: {
        type: String,
        required: true
    },
    progress: {
        type: Number,
        default: 0
    },
    trained: {
        type: Number,
        default: 0
    }
});
const vocabSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    words: {
        type: [wordSchema],
        default: []
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    lang: {
        type: String,
        default: 'default'
    }
});
export default mongoose.model('Vocabulary', vocabSchema);
