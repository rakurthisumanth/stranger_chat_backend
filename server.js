const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

app.use(cors());

app.get('/get_check', (req, res) => {
  console.log("Server is running on port 3000");
  res.send("Server is running");
});

// Store users
const users = {};           // { username: socketId }
const socketToUser = {};    // { socketId: username }

io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  // Handle user login
  socket.on('login', (username) => {
    users[username] = socket.id;
    socketToUser[socket.id] = username;
    console.log(`${username} logged in`);

    // Broadcast online users
    io.emit('users_online', Object.keys(users));
  });

  // Handle private message sending
  socket.on('send_private_message', ({ to, from, message }) => {
    const targetSocketId = users[to];
    if (targetSocketId) {
      io.to(targetSocketId).emit('private_message', { from, to, message }); // include 'to' for frontend tracking
    }
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    const username = socketToUser[socket.id];
    if (username) {
      delete users[username];
      delete socketToUser[socket.id];
      console.log(`${username} disconnected`);
      io.emit('users_online', Object.keys(users));
    }
  });
});

server.listen(3000, () => {
  console.log('Server listening on http://localhost:3000');
});
