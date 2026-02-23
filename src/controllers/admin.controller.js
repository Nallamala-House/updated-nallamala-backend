const pool = require("../config/db")

exports.getAllConversations = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM conversations ORDER BY created_at DESC"
    )

    res.json(result.rows)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

exports.replyToConversation = async (req, res) => {
  try {
    const { conversationId, content } = req.body

    await pool.query(
      "INSERT INTO messages (conversation_id, sender, content) VALUES ($1, 'admin', $2)",
      [conversationId, content]
    )

    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}