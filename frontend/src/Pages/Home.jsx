import React from 'react'
import axios from 'axios'
import { Link, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import Messages from './Messages'
import socket from "../lib/socket";
const Home = () => {

    const [chats,setChats] = React.useState([])
    const [unchatted,setUnchatted] = React.useState([])
    const [selectedChat, setSelectedChat] = React.useState(null)
    const [selectedTab, setSelectedTab] = React.useState("chats")
    const [lastMessage, setLastMessage] = React.useState([])
    const [sortedChats, setSortedChats] = React.useState([])

  const currentUser = JSON.parse(localStorage.getItem("user"));
  const currentUserId = currentUser?._id;
    const navigate = useNavigate()
    const getChats = async() => {
        try {
            const res = await axios.get( import .meta.env.MODE === "development" ? "http://localhost:5000/messages/chats":"/messages/chats",{withCredentials:true})
            if(!res.data) {
                console.log("No chats found")
                return
            }
            setChats(res.data)
            console.log("Chats fetched successfully",chats)
            if(res.data) console.log(res.data)
            else console.log("No chats")
        } catch (error) {
            console.log("Error getting chats",error)
        } 
    }
    
      const getLastMessage = async () => {
      try {
        const res = await axios.get(import .meta.env.MODE === "development" ? "http://localhost:5000/messages/last":"/messages/last", { withCredentials: true });
        console.log("Last message:", res.data);
        setLastMessage(res.data);
      } catch (error) {
        console.log("Error getting last message", error);
      }
    };


    const getUnchatted = async() => {
      try {
        const res = await axios.get( import .meta.env.MODE === "development" ? "http://localhost:5000/messages/unchatted":"/messages/unchatted",{withCredentials:true})
        setUnchatted(res.data)
        console.log("Unchatted users fetched successfully",unchatted)
      } catch(error) {
        console.log("Error getting unchatted users",error)
      }
    }

    const handleLogout = async() => {
        try {
            const res = await axios.post( import .meta.env.MODE === "development" ? "http://localhost:5000/auth/logout":"/auth/logout",{}, {withCredentials:true})
            console.log(res.data)
            localStorage.removeItem("user")
            alert("Logged out successfully")
            navigate("/")
        } catch (error) {
            console.log("Error logging out",error)
            if(error.response.status === 401) {
                alert("You are not logged in")
            }
        }
    }

    console.log("Selected chat ID:", selectedChat)

    useEffect(() => {
      const fetchData = async () => {
        await getChats();
        await getUnchatted();
        await getLastMessage();
      };
      fetchData();
    }, []);

  useEffect(() => {
  if (chats.length && lastMessage.length) {
    const sorted = [...chats].sort((a, b) => {
      const timeA = lastMessage.find((m) => m.userId === a._id)?.time || 0;
      const timeB = lastMessage.find((m) => m.userId === b._id)?.time || 0;
      return new Date(timeB) - new Date(timeA);
    });
    setSortedChats(sorted);
  } else {
    setSortedChats(chats); 
  }
}, [lastMessage, chats]);

useEffect(() => {
    if (!currentUserId) return;

    socket.emit("joinUserRoom", currentUserId);

    if (chats.length) {
      const roomIds = chats.map(chat => chat._id);
      socket.emit("joinMultipleRooms", roomIds);
      console.log("Joined rooms:", roomIds);
    }
  }, [currentUserId, chats]);

  useEffect(() => {
  const handleReceive = (newMessage) => {
    const chatUserId = newMessage.senderId === currentUserId
      ? newMessage.receiverId
      : newMessage.senderId;

    setUnchatted(prevUnchatted => {
      const user = prevUnchatted.find(u => u._id === chatUserId);
      if (user) {
        setChats(prevChats => {
   
          if (!prevChats.some(c => c._id === user._id)) {
            return [...prevChats, user];
          }
          return prevChats;
        });
        return prevUnchatted.filter(u => u._id !== chatUserId);
      }
      return prevUnchatted;
    });

    setLastMessage(prev => {
      const updated = prev.filter(m => m.userId !== chatUserId);
      return [
        { userId: chatUserId, lastMessage: newMessage.content, time: newMessage.createdAt },
        ...updated
      ];
    });
  };

  socket.on("receiveMessage", handleReceive);
  return () => socket.off("receiveMessage", handleReceive);
}, [currentUserId]);



  return (
<div className="h-[90vh] bg-gradient-to-br from-amber-500 to-yellow-400 flex rounded-2xl shadow-lg overflow-hidden p-3">

  <div className="w-[30%] bg-white rounded-2xl flex flex-col shadow-lg">

    <div className="flex bg-amber-500 text-white font-bold rounded-t-2xl">
      <button
        onClick={() => setSelectedTab("chats")}
        className={`flex-1 py-3 transition-all ${
          selectedTab === "chats"
            ? "bg-amber-600 shadow-inner"
            : "hover:bg-amber-400"
        }`}
      >
        Chats
      </button>
      <button
        onClick={() => setSelectedTab("unchatted")}
        className={`flex-1 py-3 transition-all ${
          selectedTab === "unchatted"
            ? "bg-amber-600 shadow-inner"
            : "hover:bg-amber-400"
        }`}
      >
        New Chats
      </button>
    </div>

    <ul className="flex-1 overflow-y-auto p-3 space-y-2">
      {selectedTab === "chats"
        ? sortedChats.map((chat) => {
            const lm = lastMessage.find((m) => m.userId === chat._id);
            return (
              <li
                key={chat._id}
                onClick={() => setSelectedChat(chat)}
                className={`p-4 cursor-pointer rounded-xl transition-all ${
                  selectedChat?._id === chat._id
                    ? "bg-amber-100 border-l-4 border-amber-500 shadow"
                    : "hover:bg-amber-50"
                }`}
              >
                <div className="text-lg font-semibold text-gray-800">{chat.name}</div>
                <div className="text-sm text-gray-500 truncate">
                  {lm ? lm.lastMessage : "No messages yet"}
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {lm ? new Date(lm.time).toLocaleString() : ""}
                </div>
              </li>
            );
          })
        : unchatted.map((user) => (
            <li
              key={user._id}
              onClick={() => setSelectedChat(user)}
              className="p-4 cursor-pointer rounded-xl hover:bg-amber-50 transition-all"
            >
              <div className="text-lg font-semibold text-gray-800">{user.name}</div>
              <div className="text-sm text-gray-400">Start a new chat</div>
            </li>
          ))}
    </ul>

    <div className="p-3">
      <button
        onClick={handleLogout}
className="w-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-white py-2 rounded-xl font-semibold shadow transition"

      >
        Logout
      </button>
    </div>
  </div>

  <div className="flex-1 bg-white rounded-2xl ml-3 shadow-lg flex flex-col">
    {selectedChat ? (
      <Messages paramId={selectedChat._id} receiverName={selectedChat.name} />
    ) : (
      <div className="flex justify-center items-center h-full text-gray-600 text-xl font-medium">
        Select a chat to view messages
      </div>
    )}
  </div>

</div>



  )
}

export default Home