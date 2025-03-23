import express from 'express';
import http from 'http';
import cors from 'cors';
import { Server } from 'socket.io';
import roomRouter from '../routers/room.router.js';

const PORT = process.env.PORT || 5000;
const app = express();


const allowedOrigins = ['http://localhost:4200', 'https://watch-unity-frontend.vercel.app'];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      return callback(new Error('Not allowed by CORS'), false);
    }
    return callback(null, true);
  }
}));

app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: allowedOrigins
  }
});

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('joinRoom', (roomId) => {
    socket.join(roomId);
    console.log(`Socket ${socket.id} joined room ${roomId}`);
  });

  socket.on('videoControl', (data) => {
    console.log('Received video control event:', data);
    socket.to(data.roomId).emit('videoControl', data);
  });

  // chat

  socket.on('chatMessage', (messageData) => {
    // Broadcast chat messages to room
    socket.to(messageData.roomId).emit('chatMessage', messageData);
  });


  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

app.use('/rooms', roomRouter);

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));





