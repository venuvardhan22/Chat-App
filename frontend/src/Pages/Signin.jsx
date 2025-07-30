import React from 'react'
import axios from 'axios'
import {useState} from 'react'
import { useNavigate } from 'react-router-dom'
import socket from "../lib/socket";

const Signin = () => {

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [name, setName] = useState("")

    const navigate = useNavigate()

    const sendData = async(e) => {
        e.preventDefault()
        
        try {
            const res = await axios.post( import .meta.env.MODE === "development" ? "http://localhost:5000/auth/signup":"/auth/signup", {email,name,password}, {withCredentials:true})
            console.log(res.data)
            localStorage.setItem("user",JSON.stringify(res.data))
            const userData = res.data;
            console.log("User data:", userData);
            if (!socket.connected) socket.connect();
            socket.emit("joinRoom", userData._id, (resp) => {
            console.log("Joined my own room:", resp);
      });
            navigate("/home")
        } catch (error) {
            console.log("Error posting the data",error.message)
        }
    }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-amber-400 to-yellow-500 p-6">
  <h1 className="text-3xl font-bold text-white mb-8">Register</h1>

  <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
    <form onSubmit={sendData} className="space-y-5">
      
      <div className="flex flex-col">
        <label htmlFor="email" className="text-gray-700 font-semibold mb-1 text-left">
          Email
        </label>
        <input
          type="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-amber-400 focus:outline-none"
        />
      </div>

      <div className="flex flex-col">
        <label htmlFor="name" className="text-gray-700 font-semibold mb-1 text-left">
          Name
        </label>
        <input
          type="text"
          name="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your name"
          className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-amber-400 focus:outline-none"
        />
      </div>

      <div className="flex flex-col">
        <label htmlFor="password" className="text-gray-700 font-semibold mb-1 text-left">
          Password
        </label>
        <input
          type="password"
          name="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Create a password"
          className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-amber-400 focus:outline-none"
        />
      </div>

      <button
        type="submit"
        className="w-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-white font-bold py-3 rounded-lg transition transform hover:scale-105 shadow-lg"
      >
        Register
      </button>

      <div className="text-center mt-4">
        <p className="text-gray-600">Already have an account?</p>
        <button
          type="button"
          onClick={() => navigate("/")}
          className="text-amber-600 hover:underline font-semibold"
        >
          Log In
        </button>
      </div>

    </form>
  </div>
</div>



  )
}

export default Signin