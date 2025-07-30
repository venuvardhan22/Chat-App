import express from "express"
import {signup,login,logout} from "../controllers/auth.controllers.js"
import {protectedRoute} from "../middleware/protectedRoute.js"

const router = express.Router()

router.post("/signup",signup)

router.post("/login",login)

router.post("/logout",logout)

router.get("/check",protectedRoute, (req,res) => res.status(200).json(req.user))

export default router