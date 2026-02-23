const pool = require("../config/db")

async function getOrCreateConversation(email) {
  const existing = await pool.query(
    "SELECT * FROM conversations WHERE user_email = $1 AND status = 'open'",
    [email]
  )

  if (existing.rows.length > 0) {
    return existing.rows[0]
  }

  const newConv = await pool.query(
    "INSERT INTO conversations (user_email) VALUES ($1) RETURNING *",
    [email]
  )

  return newConv.rows[0]
}

module.exports = { getOrCreateConversation }