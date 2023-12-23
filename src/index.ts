import express, { Express, Request, Response, Application } from 'express';
import dotenv from 'dotenv';
import { Server, Socket } from 'socket.io';
import http from 'http';
import SocketOrder from './handlers/orderHandler';
//For env File
dotenv.config();

const app: Application = express();
const port = process.env.PORT || 8000;
const server = http.createServer(app);

app.get('/', (req: Request, res: Response) => {
  res.send('Welcome to Express & TypeScript Server');
});

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['*'],
    credentials: true,
  },
});
const onConnection = (socket: Socket) => {
  console.log('User connected to', socket.id);
  const orderHandler = new SocketOrder(io, socket);
  orderHandler.invokeListeners();
};
io.on('connection', (socket) => onConnection(socket));

app.listen(port, () => {
  console.log(`Server is Fire at http://localhost:${port}`);
});
