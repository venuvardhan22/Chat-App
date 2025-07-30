import express from 'express'
import {getChats, unChatted, getMessages, sendMessages, getLastMessage} from "../controllers/messages.controllers.js"
import { protectedRoute } from '../middleware/protectedRoute.js'

const router = express.Router()

router.get("/chats",protectedRoute,getChats)

router.get("/unchatted", protectedRoute,unChatted)

router.get("/last", protectedRoute, getLastMessage)

router.get("/:id",protectedRoute,getMessages)

router.post("/send/:id",protectedRoute,sendMessages)

export default router