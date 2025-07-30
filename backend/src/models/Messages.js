import mongoose from "mongoose";

const Messages = mongoose.Schema({

    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    receiverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    content: {
        type: String,
        trim: true
    },
    chat: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Chat"
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
},
    {timstamps: true}
)

const MessageModel = mongoose.model("Message",Messages)

export default MessageModel