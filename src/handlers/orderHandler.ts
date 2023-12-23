import { Server, Socket } from 'socket.io';
type Payload = any;
//  Payload types tpo be defined

export default class SocketOrder {
  io: Server;
  socket: Socket;
  constructor(io: Server, socket: Socket) {
    this.io = io;
    this.socket = socket;
  }
  joinRoom(payload: Payload) {
    console.log('User joined room#:', payload);
    this.socket.join(payload);
  }
  send = (payload: Payload) => {
    this.io.in(payload.room).emit('recieve_message', payload);
  };
  disconnect = () => {
    console.log(`User disconnected from ${(this, this.socket.id)}`);
  };
  invokeListeners() {
    this.socket.on('join_room', this.joinRoom);
    this.socket.on('disconnect', this.disconnect);
    this.socket.on('send_message', this.send);
  }
}
