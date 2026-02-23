const express = require("express")
const router = express.Router()
const controller = require("../controllers/message.controller")

router.post("/", controller.sendMessage)
router.get("/:conversationId", controller.getMessages)

module.exports = router