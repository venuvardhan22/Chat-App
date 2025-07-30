import bcrypt from "bcrypt"
import UserModel from "../models/User.js"
import generateToken from "../libs/jwt.lib.js"

export const signup = async (req,res) => {
    const {email,password,name} = req.body
    try {
        const user = await UserModel.findOne({email})

        if(user) return res.status(400).send("User already exists")

        const hashedPassword = await bcrypt.hash(password,10)

        const newUser = new UserModel({
            name,
            email,
            password:hashedPassword
        })

        if(newUser) {
            await newUser.save()
            generateToken(newUser._id,res)
            res.status(201).json({'name':newUser.name,'email':newUser.email,'_id':newUser._id})
        } 
        else {
            res.status(400).json({"msg":"400 Invalid user credentials"})
        }

    } catch(error) {
        console.log("Error creating user",error)
        res.status(500).json({"msg":"500 Error creating user","error":error})
    }
}

export const login = async (req,res) => {
    const {email,password} = req.body
    try {
        const user = await UserModel.findOne({email})
        if(!user) return res.status(400).json({"msg":"400 Invalid user credentials"})

        const comparePassword = await bcrypt.compare(password,user.password)
        if(!comparePassword) return res.status(400).json({"msg":"400 Invalid user credentials"})

        generateToken(user._id,res)

        res.status(200).json({'name':user.name,'email':user.email,'_id':user._id})

    } catch(error) {
        console.log("Error logging in user",error)
        res.status(500).json({"msg":"500 Error logging in user","error":error})
    }
}

export const logout = async (req,res) => {
   try {
        res.cookie("jwt","",{maxAge:0})
        res.status(200).json({"msg":"200 User logged out"})
    }  catch(error) {
        console.log("Error logging out user",error)
        res.status(500).json({"msg":"500 Error logging out user","error":error})
    }  
}
