import express, { Express, Request, Response, Application } from 'express';
import dotenv from 'dotenv';
import { Server, Socket } from 'socket.io';
import http from 'http';
import SocketOrder from './handlers/orderHandler';
import cors from 'cors';
//For env File
dotenv.config();

const app: Application = express();
const port = process.env.PORT || 8000;
const server = http.createServer(app);

app.use(cors());

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['*'],
  },
});
function onConnection(socket: Socket) {
  console.log('User connected to', socket.id);
  const orderHandler = new SocketOrder(io, socket);
  orderHandler.invokeListeners();
}
io.on('connection', (socket) => {
  onConnection(socket);
});

server.listen(port, () => {
  console.log(`Server live at http://localhost:${port}`);
});
