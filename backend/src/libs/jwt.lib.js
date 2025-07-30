import jwt from "jsonwebtoken"

const generateToken = (userId,res) => {
    try {
        const token = jwt.sign(
        {id: userId},process.env.JWT_SECRET,
        {expiresIn: "7d"}
)

res.cookie("jwt",token,{
    httpOnly: true,
    secure: process.env.NODE_ENV !== "development",
    sameSite: "lax",
    maxAge: 7*24*60*60*1000
})
return token
    } catch (error) {
        console.error("Error generating token", error)
        res.status(500).json({"msg":"500 Error generating token","error":error.message})
    
    }
    
}

export default generateToken