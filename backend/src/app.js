import express from 'express';
import http from 'http';
import cors from 'cors';
import { Server } from 'socket.io';  // <-- Use the named export "Server"

const PORT = process.env.PORT || 5000;
const app = express();
app.use(cors({ origin: 'https://watch-unity-frontend.vercel.app/' }));
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: 'https://watch-unity-frontend.vercel.app/' } });

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

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
