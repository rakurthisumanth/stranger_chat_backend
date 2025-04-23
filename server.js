const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

app.use(cors());

io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);
    
    socket.on('send_message', (data) => {
        console.log(data,"server resposne");
        io.emit('received',data)
    });

    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
    });
});

// Use `server.listen` instead of `app.listen`
server.listen(3000, () => {
    console.log('Server is running on port 3000');
});
