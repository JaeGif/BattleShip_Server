"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const socket_io_1 = require("socket.io");
const http_1 = __importDefault(require("http"));
const orderHandler_1 = __importDefault(require("./handlers/orderHandler"));
//For env File
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 8000;
const server = http_1.default.createServer(app);
app.get('/', (req, res) => {
    res.send('Welcome to Express & TypeScript Server');
});
const io = new socket_io_1.Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
        allowedHeaders: ['*'],
        credentials: true,
    },
});
const onConnection = (socket) => {
    console.log('User connected to', socket.id);
    const orderHandler = new orderHandler_1.default(io, socket);
    orderHandler.invokeListeners();
};
io.on('connection', (socket) => onConnection(socket));
app.listen(port, () => {
    console.log(`Server is Fire at http://localhost:${port}`);
});
