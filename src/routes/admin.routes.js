const express = require("express")
const router = express.Router()
const controller = require("../controllers/admin.controller")

router.get("/conversations", controller.getAllConversations)
router.post("/reply", controller.replyToConversation)

module.exports = router