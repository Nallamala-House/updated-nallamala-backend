const express = require("express")
const cors = require("cors")

const conversationRoutes = require("./routes/conversation.routes")
const messageRoutes = require("./routes/message.routes")
const adminRoutes = require("./routes/admin.routes")

const app = express()

app.use(cors())
app.use(express.json())

app.get("/", (req, res) => {
  res.json({ message: "Backend is running 🚀" });
});

app.use("/api/conversations", conversationRoutes)
app.use("/api/messages", messageRoutes)
app.use("/api/admin", adminRoutes)

module.exports = app