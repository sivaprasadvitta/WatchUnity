import express from 'express';
import http from 'http';
import cors from 'cors';
import { Server } from 'socket.io';
import roomRouter from '../routers/room.router.js';

const PORT = process.env.PORT || 5000;
const app = express();

// Define allowed origins based on your environment
// In development, allow both localhost and production domain
const allowedOrigins = ['http://localhost:4200', 'https://watch-unity-frontend.vercel.app'];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
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

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

app.use('/rooms', roomRouter);

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));







// import express from 'express';
// import http from 'http';
// import cors from 'cors';
// import { Server } from 'socket.io';  
// import roomRouter from '../routers/room.router.js';

// const PORT = process.env.PORT || 5000;
// const app = express();
// app.use(cors({ origin: 'https://watch-unity-frontend.vercel.app' }));
// app.use(express.json());

// const server = http.createServer(app);
// const io = new Server(server, { cors: { origin: 'https://watch-unity-frontend.vercel.app' } });

// io.on('connection', (socket) => {
//   console.log('Client connected:', socket.id);

//   socket.on('joinRoom', (roomId) => {
//     socket.join(roomId);
//     console.log(`Socket ${socket.id} joined room ${roomId}`);
//   });

//   socket.on('videoControl', (data) => {
//     console.log('Received video control event:', data);
//     socket.to(data.roomId).emit('videoControl', data);
//   });

//   socket.on('disconnect', () => {
//     console.log('Client disconnected:', socket.id);
//   });
// });

// app.use('/rooms',roomRouter);

// server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
