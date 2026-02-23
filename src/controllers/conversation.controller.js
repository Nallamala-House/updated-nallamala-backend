const { getOrCreateConversation } = require("../services/conversation.service")

exports.createConversation = async (req, res) => {
  try {
    const { email } = req.body

    if (!email) {
      return res.status(400).json({ error: "Email required" })
    }

    const conversation = await getOrCreateConversation(email)

    res.json(conversation)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}