const { MessageModel } = require('../models/ConversationModel');

// Controller to mark messages as read
const markMessagesAsRead = async (req, res) => {
  const { senderId, receiverId } = req.body;

  try {
    // Find conversation between sender and receiver
    const conversation = await MessageModel.findOne({ sender: senderId, receiver: receiverId });

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    // Update messages in the conversation
    const result = await MessageModel.updateMany(
      { _id: { $in: conversation.messages }, seen: false },
      { $set: { seen: true } }
    );

    res.status(200).json({ message: 'Messages marked as read', result });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};

module.exports = {
  markMessagesAsRead
};
