"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
//  Payload types tpo be defined
class SocketOrder {
    constructor(io, socket) {
        this.send = (payload) => {
            this.io.in(payload.room).emit('recieve_message', payload);
        };
        this.disconnect = () => {
            console.log(`User disconnected from ${(this, this.socket.id)}`);
        };
        this.io = io;
        this.socket = socket;
    }
    joinRoom(payload) {
        console.log('User joined room#:', payload);
        this.socket.join(payload);
    }
    invokeListeners() {
        this.socket.on('join_room', this.joinRoom);
        this.socket.on('disconnect', this.disconnect);
        this.socket.on('send_message', this.send);
    }
}
exports.default = SocketOrder;
