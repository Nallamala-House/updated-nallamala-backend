const conversationService = require('../services/conversation.service');

const createConversation = async (req, res) => {
  try {
    const { email } = req.body;

    const conversation = await conversationService.createConversation(email);

    res.status(201).json(conversation);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating conversation" });
  }
};

module.exports = {
  createConversation,
};