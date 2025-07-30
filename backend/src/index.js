import express from "express";
import dotenv from 'dotenv'
import auth from "./routes/auth.routes.js"
import mongoose from "mongoose"
import messages from "./routes/messages.routes.js"
import cookieParser from "cookie-parser"
import cors from "cors"
import { app, server } from "./libs/socket.js";
import path from "path";

dotenv.config();

const __dirname = path.resolve();

app.use(express.json())

app.use(cookieParser())

app.use(cors({
    origin:"http://localhost:5173",
    credentials:true
}))

const PORT = process.env.PORT || 5000

try {
    await mongoose.connect(process.env.MONGO_URL)
    console.log("Connected to MongoDB")
}
catch(error) {
    console.log("Error connecting to MongoDB",error)
}

server.listen(PORT,()=>{
    console.log(`Server running on port ${5000}`)
})

app.use("/auth", auth)

app.use("/messages", messages)

if(process.env.NODE_ENV === "production") {  
    app.use(express.static(path.join(__dirname, "../frontend/dist")))
    app.get("*", (req, res) => {
        res.sendFile(path.resolve(__dirname, "../frontend", "dist", "index.html"))
    })
}
