import jwt from "jsonwebtoken"
import UserModel from "../models/User.js"

export const protectedRoute = async (req,res,next) => {
    try{
        const token = req.cookies.jwt

        if(!token) return res.status(401).json({msg:"Token not generated"})

        const decodedToken = jwt.verify(token,process.env.JWT_SECRET)

        if(!decodedToken) return res.status(401).json({msg:"Unauthorized user"})

        const user = await UserModel.findById(decodedToken.id).select("-password")

        if(!user) return res.status(401).json({msg:"User not valid"})

        req.user = user

        next()

    } catch(error) {
        console.log("Error verifying token",error)
        res.status(500).json({"msg":"500 Error verifying token","error":error.message})
    }
}