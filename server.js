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

// Store users
const users = {}; // { username: socket.id }
const socketToUser = {}; // { socket.id: username }

io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  // Login handler
  socket.on('login', (username) => {
    users[username] = socket.id;
    socketToUser[socket.id] = username;
    console.log(`${username} logged in`);

    // Send updated user list to everyone
    io.emit('users_online', Object.keys(users));
  });

  // Handle private message
  socket.on('send_private_message', ({ to, from, message }) => {
    const targetSocketId = users[to];
    if (targetSocketId) {
      io.to(targetSocketId).emit('private_message', { from, message });
    }
  });

  // On disconnect
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
