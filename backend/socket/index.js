const express = require('express');
const { Server } = require('socket.io');
const http = require('http');
const cors = require('cors');
const getUserDetailsFromToken = require('../helpers/getUserDetailsFromToken');
const UserModel = require('../models/UserModel');
const { ConversationModel, MessageModel } = require('../models/ConversationModel');
const getConversation = require('../helpers/getConversation');

const app = express();

// Socket connection setup
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: [process.env.CLIENT_URL],
        methods: ['GET', 'POST'],
    },
});

const onlineUser = new Set();

io.on('connection', async (socket) => {
    console.log("User connected:", socket.id);

    // Token validation and user retrieval
    const token = socket.handshake.auth.token;
    let user;

    try {
        user = await getUserDetailsFromToken(token);
    } catch (err) {
        console.error('Error fetching user details:', err);
        return socket.disconnect();
    }

    if (!user || !user._id) {
        console.error('Invalid token or user not found');
        return socket.disconnect();
    }

    // Join the user's room and add them to the online users set
    socket.join(user._id.toString());
    onlineUser.add(user._id.toString());

    // Emit the list of online users
    io.emit('onlineUser', Array.from(onlineUser));

    // Handle message page requests
    socket.on('message-page', async (userId) => {
        if (!userId) {
            console.error('UserId is undefined');
            return;
        }

        try {
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

            const conversation = await ConversationModel.findOne({
                "$or": [
                    { sender: user._id, receiver: userId },
                    { sender: userId, receiver: user._id }
                ]
            }).populate('messages').sort({ updatedAt: -1 });

            socket.emit('message', conversation?.messages || []);
        } catch (err) {
            console.error('Error handling message-page event:', err);
        }
    });

    // Handle new messages
    socket.on('new message', async (data) => {
        if (!data || !data.sender || !data.receiver) {
            console.error('Message data is incomplete');
            return;
        }

        try {
            let conversation = await ConversationModel.findOne({
                "$or": [
                    { sender: data.sender, receiver: data.receiver },
                    { sender: data.receiver, receiver: data.sender }
                ]
            });

            if (!conversation) {
                conversation = await new ConversationModel({
                    sender: data.sender,
                    receiver: data.receiver
                }).save();
            }

            const message = new MessageModel({
                text: data.text,
                imageUrl: data.imageUrl,
                videoUrl: data.videoUrl,
                msgByUserId: data.msgByUserId,
            });

            const savedMessage = await message.save();

            await ConversationModel.updateOne(
                { _id: conversation._id },
                { "$push": { messages: savedMessage._id } }
            );

            const updatedConversation = await ConversationModel.findOne({
                "$or": [
                    { sender: data.sender, receiver: data.receiver },
                    { sender: data.receiver, receiver: data.sender }
                ]
            }).populate('messages').sort({ updatedAt: -1 });

            io.to(data.sender).emit('message', updatedConversation?.messages || []);
            io.to(data.receiver).emit('message', updatedConversation?.messages || []);

            const conversationSender = await getConversation(data.sender);
            const conversationReceiver = await getConversation(data.receiver);

            io.to(data.sender).emit('conversation', conversationSender);
            io.to(data.receiver).emit('conversation', conversationReceiver);
        } catch (err) {
            console.error('Error handling new message event:', err);
        }
    });

    // Handle sidebar requests
    socket.on('sidebar', async (currentUserId) => {
        if (!currentUserId) {
            console.error('CurrentUserId is undefined');
            return;
        }

        try {
            const conversation = await getConversation(currentUserId);
            socket.emit('conversation', conversation);
        } catch (err) {
            console.error('Error handling sidebar event:', err);
        }
    });

    // Handle seen message event
    socket.on('seen', async (msgByUserId) => {
        if (!msgByUserId) {
            console.error('msgByUserId is undefined');
            return;
        }

        try {
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
        } catch (err) {
            console.error('Error handling seen event:', err);
        }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
        onlineUser.delete(user._id.toString());
        io.emit('onlineUser', Array.from(onlineUser)); // Update online users list
        console.log('User disconnected:', socket.id);
    });
});

module.exports = {
    app,
    server
};
