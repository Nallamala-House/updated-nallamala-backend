const pool = require('../config/db');

const createConversation = async (email) => {
  const result = await pool.query(
    `INSERT INTO conversations (user_email)
     VALUES ($1)
     RETURNING *`,
    [email]
  );

  return result.rows[0];
};

const getConversationById = async (id) => {
  const result = await pool.query(
    `SELECT * FROM conversations WHERE id = $1`,
    [id]
  );

  return result.rows[0];
};

module.exports = {
  createConversation,
  getConversationById,
};