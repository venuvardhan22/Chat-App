import UserModel from "../models/User.js"
import MessageModel from "../models/Messages.js"

export const getMessages = async (req,res) => {
    try {
        const {id:otherId} = req.params

        const myId = req.user._id

        const messages = await MessageModel.find({
            $or:[{senderId:myId,receiverId:otherId},
                {senderId:otherId,receiverId:myId}
            ]})

        res.status(200).json(messages)

    } catch(error) {
        console.log("Error getting messages",error)
        res.status(500).json({"msg":"500 Error getting messages","error":error})
    }
}

export const getLastMessage = async (req, res) => {
  try {
    const userId = req.user._id;

    const chats = await MessageModel.aggregate([
      {
        $match: {
          $or: [
            { senderId: userId },
            { receiverId: userId }
          ]
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ["$senderId", userId] },
              "$receiverId",
              "$senderId"
            ]
          },
          lastMessage: { $first: "$content" },
          time: { $first: "$createdAt" },
          sender: { $first: "$senderId" }
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user"
        }
      },
      { $unwind: "$user" },
      {
        $project: {
          _id: 0,
          userId: "$user._id",
          userName: "$user.name",
          lastMessage: 1,
          time: 1,
          sender: 1
        }
      },
      { $sort: { time: -1 } }
    ]);

    res.json(chats);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Failed to get chats" });
  }
};


export const getChats = async (req, res) => {
  try {
    const userId = req.user._id;

    const chattedUserIds = await MessageModel.distinct("receiverId", { senderId: userId });
    const receivedUserIds = await MessageModel.distinct("senderId", { receiverId: userId });

    const allChatIds = [...new Set([...chattedUserIds, ...receivedUserIds])];

    const filteredChats = await UserModel.find({
      _id: { $in: allChatIds, $ne: userId }
    }).select("-password");

    res.status(200).json(filteredChats);
  } catch (error) {
    console.log("Error getting chats", error);
    res.status(500).json({ msg: "500 Error getting chats", error });
  }
};

export const unChatted = async (req, res) => {
  try {
    const userId = req.user._id;

    const allUsers = await UserModel.find({ _id: { $ne: userId } }).select("-password");

    if (!allUsers || allUsers.length === 0) {
      return res.status(404).json({ msg: "No users found" });
    }

    const chattedReceiverIds = await MessageModel.distinct("receiverId", { senderId: userId });
    const chattedSenderIds = await MessageModel.distinct("senderId", { receiverId: userId });

    const allChattedIds = [...new Set([...chattedReceiverIds, ...chattedSenderIds, userId.toString()])];


    const unchattedUsers = await UserModel.find({ _id: { $nin: allChattedIds } }).select("-password");

    res.status(200).json(unchattedUsers);
  } catch (error) {
    console.log("Error getting unchatted users", error);
    res.status(500).json({ msg: "500 Error getting unchatted users", error });
  }
};



export const sendMessages = async (req,res) => {
    try {
        const {id} = req.params
        const {content} = req.body
        const senderId = req.user._id
        const receiverId = id

        const newMessage = new MessageModel({
            senderId,
            receiverId,
            content,
            date: new Date().toISOString() 
        })

        res.status(201).json(newMessage)
        await newMessage.save()

    } catch(error) {
        console.log("Error sending message",error)
        res.status(500).json({"msg":"500 Error sending message","error":error})
    }
}