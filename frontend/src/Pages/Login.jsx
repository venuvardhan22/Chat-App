import React from 'react'
import axios from 'axios'
import {useState} from 'react'
import { useNavigate } from 'react-router-dom'
import socket from "../lib/socket"; 


const Login = () => {

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")

    const handleEmailChange = (e) => setEmail(e.target.value)
    const handlePasswordChange = (e) => setPassword(e.target.value)

    const navigate = useNavigate()
    const handleData = async(e) => {
        e.preventDefault()
        try {
            const res = await axios.post( import .meta.env.MODE === "development" ? "http://localhost:5000/auth/login":"/auth/login",
                {email,password},
                {withCredentials:true})
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
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-amber-500 to-yellow-400 p-6">
  <h1 className="text-3xl font-bold text-white mb-8">Login Page</h1>

  <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
    <form onSubmit={handleData} className="space-y-5">
      
      <div className="flex flex-col">
        <label htmlFor="email" className="text-gray-700 font-semibold mb-1 text-left">
          Email
        </label>
        <input
          type="email"
          name="email"
          className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-amber-400 focus:outline-none"
          value={email}
          onChange={handleEmailChange}
          placeholder="Enter your email"
        />
      </div>

      <div className="flex flex-col">
        <label htmlFor="password" className="text-gray-700 font-semibold mb-1 text-left">
          Password
        </label>
        <input
          type="password"
          name="password"
          className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-amber-400 focus:outline-none"
          value={password}
          onChange={handlePasswordChange}
          placeholder="Enter your password"
        />
      </div>

      <button
        type="submit"
        className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 rounded-lg transition duration-300"
      >
        Login
      </button>

      <div className="text-center mt-4">
        <p className="text-gray-600">Don't have an account?</p>
        <button
          type="button"
          onClick={() => navigate("/signin")}
          className="text-amber-600 hover:underline font-semibold"
        >
          Register
        </button>
      </div>
    </form>
  </div>
</div>


  )
}

export default Login