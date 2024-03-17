
const asyncHandler = require('express-async-handler');
const Chat = require('../models/chat');
const User = require('../models/user');
const BadRequest = require('../errors/BadRequest');
const Message = require('../models/message');
exports.accessChatByChatId = asyncHandler(async (req, res, next) => {
    const { chatId } = req.body;
    let seen = false;
    let message = await Message.findOne({chat: chatId }).sort({ createdAt: -1 });
    if (message && (message.sender.toString()!==req.user._id.toString())) {
        message = await Message.updateOne({ _id: message._id }, { seen: true });
        seen=true
        }
        res.status(200).json({
            status: "success",
            data:seen 
        })
    })

exports.accessChat = asyncHandler(async (req, res, next) => {
    const { userId } = req.body;
    let chatData = await Chat.find({
        $and: [
            { users: { $elemMatch: { $eq: req.user._id } } },
            { users: { $elemMatch: { $eq: userId } } },
        ]
    })
    console.log(chatData.length)
    if (chatData.length > 0) {   
        res.status(200).json({
            status: "success",
            data:chatData[0]
        })
    } else {
        var newChat = {
            users: [req.user._id, userId],
            chatName: "sender",
        }
        const createChat = await Chat.create(newChat);

        const fullChat = await Chat.findOne({ _id: createChat._id })
            .populate("users", "-password");
        if (!fullChat) {
            next(new BadRequest("the chat not exist",400))
        }
        res.status(201).json({
            status: "success",
            data:fullChat
        })
    }
})
exports.fetchChats = asyncHandler(async (req, res, next) => {
         const chats = await Chat.aggregate([
         {
        $match: { users: { $elemMatch: { $eq: req.user._id } } }
    },
    {
        $lookup: {
            from: 'messages',
            let: { chatId: '$_id' },
            pipeline: [
                { $match: { $expr: { $eq: ['$chat', '$$chatId'] } } },
                { $sort: { 'createdAt': -1 } },
                { $limit: 1 }
            ],
            as: 'lastMessage'
        }
    },
    {
        $set: {
            lastMessage: { $arrayElemAt: ['$lastMessage', 0] }
        }
    }
         ]);
     for (const chat of chats) {
        await Message.populate(chat.lastMessage, { path: 'sender', select: 'name image' });
    }

            res.status(200).json({
                status: "success",
                data:chats
            })
        
})
exports.createGroup = asyncHandler(async (req, res, next) => {
    const users = JSON.parse(req.body.users);
    if (users.length < 2) {
    next(new BadRequest('Group should be more than 2',400))
    }
    users.push(req.user);
        const chatGroup = await Chat.create({
        chatName: req.body.name,
        users,
        groupAdmin:req.user
        })
    const group = await Chat.findOne({ _id: chatGroup._id })
        .populate('users', '-password')
        .populate('groupAdmin','-password')

    res.status(200).json({
        status: 'success',
        data:group
    })
})
exports.renameGroup = asyncHandler(async (req, res, next) => {
    const { chatId, chatName } = req.body;
    if (!chatId || !chatName) {
        next(new BadRequest("you should provide chatId and chatName ",400))
    }
    const chat = await Chat.findById(chatId);
    if (chat.groupAdmin.toString() !== req.user._id.toString()) {
        next(new BadRequest('you not admin to rename chatname',400))
    }
    const newChat = await Chat.findByIdAndUpdate(chatId,{
        chatName
    }, {
        new: true,
        runValidators:true
    }).populate('users','-password').populate('groupAdmin','-password');
    res.status(200).json({
        status: 'success',
        data:newChat
    })
})
exports.addUserToGroup = asyncHandler(async (req, res, next) => {
    const { chatId, userId } = req.body;
    if (!chatId || !userId) {
        next(new BadRequest("you should provide chatId and userId ",400))
    }
    const chat = await Chat.findById(chatId);
    if (chat.groupAdmin.toString() !== req.user._id.toString()) {
        next(new BadRequest('you not admin to add user to group',400))
    }
    const newChat = await Chat.findByIdAndUpdate(chatId, {
        $push: { users: userId }
    }, {
        runValidators: true,
        new: true
    }).populate('users','-password').populate('groupAdmin','-password');
    if (!newChat) {
        next(new BadRequest("chatId or userId not found",400));
    }
    res.status(200).json({
        status: 'success',
        data:newChat
    })
})
exports.deleteUserFromGroup = asyncHandler(async (req, res, next) => {
    const { chatId, userId } = req.body;
    if (!chatId || !userId) {
        next(new BadRequest("you should provide chatId and userId ",400))
    }
    const chat = await Chat.findById(chatId);
    if (chat.groupAdmin.toString() !== req.user._id.toString()) {
        next(new BadRequest('you not admin to delete user from group',400))
    }
    const newChat = await Chat.findByIdAndUpdate(chatId, {
        $pull: { users: userId }
    }, {
        runValidators: true,
        new: true
    }).populate('users','-password').populate('groupAdmin','-password');
    if (!newChat) {
        next(new BadRequest("chatId or userId not found",400));
    }
    res.status(200).json({
        status: 'success',
        data:newChat
    })
})