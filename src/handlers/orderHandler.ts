import { Server, Socket } from 'socket.io';
import ShortUniqueId from 'short-unique-id';
type Payload = any;
//  Payload types tpo be defined

export default class SocketOrder {
  io: Server;
  socket: Socket;
  room: string;
  constructor(io: Server, socket: Socket) {
    this.io = io;
    this.socket = socket;
    this.room = this.socket.id;
  }

  joinRoom(roomID: string | undefined) {
    if (roomID) this.room = roomID;
    const roomsInNameSpace = this.io._nsps
      .get('/')
      ?.adapter.rooms.get(this.room);
    console.log(roomsInNameSpace);
    if (!roomsInNameSpace || roomsInNameSpace.size < 2) {
      // only 2 players may join a room at once
      console.log('User joined room#:', this.room);
      this.socket.join(this.room);
      this.io.to(this.room).emit('joined_room', this.room);
    } else {
      console.log('failed to join');
      this.socket.emit('failed_to_join');
    }
  }
  receiveAttack(payload: Payload) {
    console.log('ouch', payload);
  }
  send = (payload: Payload) => {
    this.io.in(payload.room).emit('recieve_message', payload);
  };
  disconnect = () => {
    console.log(`User disconnected from ${(this, this.socket.id)}`);
  };
  invokeListeners() {
    this.socket.on('join_room', (roomID) => this.joinRoom(roomID));
    this.socket.on('receive_attack', (payload) => this.receiveAttack(payload));
    this.socket.on('disconnect', () => this.disconnect());
    this.socket.on('send_message', (payload) => this.send(payload));
  }
}
