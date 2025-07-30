import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import socket from "../lib/socket"; 

const Messages = ({ paramId, receiverName }) => {
  const [messages, setMessages] = useState([]);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef(null);

  const currentUser = JSON.parse(localStorage.getItem("user")); 
  const currentUserId = currentUser?._id;

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const res = await axios.get( import .meta.env.MODE === "development" ? `http://localhost:5000/messages/${paramId}`:`/messages/${paramId}`, {
        withCredentials: true,
      });
      setMessages(res.data);
    } catch (error) {
      console.log("Error getting messages", error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessages = async () => {
    if (!msg.trim() || !paramId) return;

    try {
      socket.emit(
        "sendMessage",
        {
          content: msg,
          senderId: currentUserId,
          receiverId: paramId,
        },
        (ack) => console.log("Message send ack:", ack)
      );

      const res = await axios.post(
        import .meta.env.MODE === "development" ? `http://localhost:5000/messages/send/${paramId}`:`/messages/send/${paramId}`,
        { content: msg },
        { withCredentials: true }
      );

      setMessages((prev) => [...prev, res.data]);
      setMsg("");
    } catch (error) {
      console.error("Send failed:", error);
      alert(`Message failed: ${error.message}`);
    }
  };

  useEffect(() => {
    if (currentUserId) {
      socket.emit("joinRoom", currentUserId, (ack) => {
        console.log("Joined room ack:", ack);
      });
    }

    const handleReceive = (newMessage) => {
      console.log("Incoming:", newMessage);
      if (
        (newMessage.senderId === paramId && newMessage.receiverId === currentUserId) ||
        (newMessage.senderId === currentUserId && newMessage.receiverId === paramId)
      ) {
        setMessages((prev) => [...prev, newMessage]);
      }
    };

    socket.on("receiveMessage", handleReceive);
    return () => socket.off("receiveMessage", handleReceive);
  }, [paramId, currentUserId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
    if (!paramId) return;
    fetchMessages();
  }, [paramId]);


  return (
  <div className="flex flex-col h-full bg-gradient-to-br from-amber-50 via-white to-yellow-100 rounded-2xl">

  <div className="p-4 bg-amber-500 text-white font-bold text-lg flex items-center rounded-t-2xl shadow">
    {receiverName || "Chat"}
  </div>

  <div className="flex-1 overflow-y-auto p-4 bg-gradient-to-br from-amber-50 via-white to-yellow-100 flex flex-col space-y-3">
    {loading ? (
      <>
        <div className="w-40 h-8 bg-yellow-200 rounded-2xl animate-pulse self-start"></div>
        <div className="w-52 h-8 bg-yellow-300 rounded-2xl animate-pulse self-end"></div>
        <div className="w-32 h-8 bg-yellow-200 rounded-2xl animate-pulse self-start"></div>
      </>
    ) : (
      messages.map((message) => (
        <div
          key={message._id}
          className={`max-w-[70%] px-4 py-2 rounded-2xl shadow-md transition-all ${
            message.receiverId === paramId
              ? "bg-white text-gray-800 self-start rounded-bl-sm border border-amber-200"
              : "bg-amber-500 text-white self-end rounded-br-sm"
          }`}
        >
          {message.content}
        </div>
      ))
    )}
    <div ref={scrollRef}></div>
  </div>

  <div className="p-3 flex gap-2 border-t bg-white items-center rounded-b-2xl">
    <input
      placeholder="Type a message..."
      type="text"
      value={msg}
      onChange={(e) => setMsg(e.target.value)}
      className="flex-1 border border-gray-300 p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-amber-400"
    />
    <button
      onClick={sendMessages}
      className="px-6 py-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-white font-bold rounded-full shadow-lg transition transform hover:scale-105"
    >
      ➤ Send
    </button>
  </div>
</div>


  );
};

export default Messages;
