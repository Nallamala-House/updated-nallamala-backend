const pool = require("../config/db")

exports.sendMessage = async (req, res) => {
  try {
    const { conversationId, sender, content } = req.body

    if (!conversationId || !sender || !content) {
      return res.status(400).json({ error: "Missing fields" })
    }

    await pool.query(
      "INSERT INTO messages (conversation_id, sender, content) VALUES ($1, $2, $3)",
      [conversationId, sender, content]
    )

    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

exports.getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params

    const messages = await pool.query(
      "SELECT * FROM messages WHERE conversation_id = $1 ORDER BY created_at ASC",
      [conversationId]
    )

    res.json(messages.rows)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}