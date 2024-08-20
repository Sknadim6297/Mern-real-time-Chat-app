const express = require('express');
const { Server } = require('socket.io');
const http = require('http');
const cors = require('cors');
const getUserDetailsFromToken = require('../helpers/getUserDetailsFromToken');
const UserModel = require('../models/UserModel');
const { ConversationModel, MessageModel } = require('../models/ConversationModel');
const getConversation = require('../helpers/getConversation');

const app = express();

/***socket connection */
const server = http.createServer(app);
const io = new Server(server);

const onlineUser = new Set();

io.on('connection', async (socket) => {
    console.log("User connected ", socket.id);

    const token = socket.handshake.auth.token;

    // Current user details
    const user = await getUserDetailsFromToken(token);

    // Check if user is valid
    if (!user || !user._id) {
        console.error('User not found or invalid token');
        return socket.disconnect(); // Optionally disconnect the socket
    }

    // Create a room and add user to online users
    socket.join(user._id.toString());
    onlineUser.add(user._id.toString());

    // Emit online users
    io.emit('onlineUser', Array.from(onlineUser));

    // Handle message page request
    socket.on('message-page', async (userId) => {
        if (!userId) {
            console.error('UserId is undefined');
            return;
        }
        
        console.log('userId', userId);
        const userDetails = await UserModel.findById(userId).select("-password");

        if (userDetails) {
            const payload = {
                _id: userDetails._id,
                name: userDetails.name,
                email: userDetails.email,
                profile_pic: userDetails.profile_pic,
                online: onlineUser.has(userId),
            };
            socket.emit('message-user', payload);
        } else {
            console.error('User details not found');
        }

        // Get previous messages
        const getConversationMessage = await ConversationModel.findOne({
            "$or": [
                { sender: user._id, receiver: userId },
                { sender: userId, receiver: user._id }
            ]
        }).populate('messages').sort({ updatedAt: -1 });

        socket.emit('message', getConversationMessage?.messages || []);
    });

    // Handle new message
    socket.on('new message', async (data) => {
        if (!data || !data.sender || !data.receiver) {
            console.error('Message data is incomplete');
            return;
        }

        let conversation = await ConversationModel.findOne({
            "$or": [
                { sender: data.sender, receiver: data.receiver },
                { sender: data.receiver, receiver: data.sender }
            ]
        });

        // If conversation is not available, create a new one
        if (!conversation) {
            const createConversation = new ConversationModel({
                sender: data.sender,
                receiver: data.receiver
            });
            conversation = await createConversation.save();
        }

        const message = new MessageModel({
            text: data.text,
            imageUrl: data.imageUrl,
            videoUrl: data.videoUrl,
            msgByUserId: data.msgByUserId,
        });
        const saveMessage = await message.save();

        await ConversationModel.updateOne({ _id: conversation._id }, {
            "$push": { messages: saveMessage._id }
        });

        const getConversationMessage = await ConversationModel.findOne({
            "$or": [
                { sender: data.sender, receiver: data.receiver },
                { sender: data.receiver, receiver: data.sender }
            ]
        }).populate('messages').sort({ updatedAt: -1 });

        io.to(data.sender).emit('message', getConversationMessage?.messages || []);
        io.to(data.receiver).emit('message', getConversationMessage?.messages || []);

        // Send conversation updates
        const conversationSender = await getConversation(data.sender);
        const conversationReceiver = await getConversation(data.receiver);

        io.to(data.sender).emit('conversation', conversationSender);
        io.to(data.receiver).emit('conversation', conversationReceiver);
    });

    // Handle sidebar request
    socket.on('sidebar', async (currentUserId) => {
        if (!currentUserId) {
            console.error('CurrentUserId is undefined');
            return;
        }

        console.log("current user", currentUserId);
        const conversation = await getConversation(currentUserId);
        socket.emit('conversation', conversation);
    });

    // Handle seen event
    socket.on('seen', async (msgByUserId) => {
        if (!msgByUserId) {
            console.error('msgByUserId is undefined');
            return;
        }

        const conversation = await ConversationModel.findOne({
            "$or": [
                { sender: user._id, receiver: msgByUserId },
                { sender: msgByUserId, receiver: user._id }
            ]
        });

        if (conversation) {
            const conversationMessageId = conversation.messages || [];
            await MessageModel.updateMany(
                { _id: { "$in": conversationMessageId }, msgByUserId: msgByUserId },
                { "$set": { seen: true } }
            );

            const conversationSender = await getConversation(user._id.toString());
            const conversationReceiver = await getConversation(msgByUserId);

            io.to(user._id.toString()).emit('conversation', conversationSender);
            io.to(msgByUserId).emit('conversation', conversationReceiver);
        } else {
            console.error('Conversation not found in seen event');
        }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
        onlineUser.delete(user._id.toString());
        console.log('User disconnected', socket.id);
    });
});

module.exports = {
    app,
    server
};
