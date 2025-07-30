import { Server } from 'socket.io';
import http from 'http';
import express from 'express';

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true,
  },
});

function printRooms() {
  const rooms = {};
  for (let [roomId, members] of io.sockets.adapter.rooms) {
    rooms[roomId] = Array.from(members);
  }
  console.log("Active Rooms:", rooms);
}

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);
  printRooms();

  socket.on('joinUserRoom', (userId) => {
    if (!userId) return;
    socket.join(`user:${userId}`);
    console.log(`User ${socket.id} joined personal room user:${userId}`);
    printRooms();
  });

  socket.on('joinRoom', (chatId, callback) => {
    if (!chatId) {
      if (typeof callback === 'function') return callback({ error: 'Room ID required' });
      return;
    }

    socket.join(chatId);
    console.log(`User ${socket.id} joined room ${chatId}`);
    printRooms();

    if (typeof callback === 'function') {
      callback({ status: 'joined', room: chatId });
    }
  });

  socket.on('joinMultipleRooms', (roomIds = []) => {
    roomIds.forEach(roomId => {
      socket.join(roomId);
      console.log(`User ${socket.id} joined room ${roomId}`);
    });
    printRooms();
  });

  socket.on('sendMessage', async (data, callback) => {
    try {
      const { content, senderId, receiverId } = data;
      console.log(`sendMessage received from ${senderId} → ${receiverId}: "${content}"`);
      printRooms();

      const messagePayload = {
        content,
        senderId,
        receiverId,
        createdAt: Date.now(),
      };

      io.to(`user:${receiverId}`).emit('receiveMessage', messagePayload);
      console.log(`Message sent to user:${receiverId}`);

      if (typeof callback === 'function') {
        callback({ status: 'delivered' });
      }
    } catch (err) {
      console.error("Error in sendMessage:", err.message);
      if (typeof callback === 'function') {
        callback({ error: err.message });
      }
    }
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
    printRooms();
  });
});

export { io, app, server };
