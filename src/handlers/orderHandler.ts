import { Server, Socket } from 'socket.io';
import ShortUniqueId from 'short-unique-id';
type Payload = any;
//  Payload types to be defined
type AttackType = 'attack' | 'radar' | 'sniper' | 'bomb' | 'strike';
export default class SocketOrder {
  io: Server;
  socket: Socket;
  room: string;
  joinerName: string;
  creatorName: string;

  constructor(io: Server, socket: Socket) {
    this.io = io;
    this.socket = socket;
    this.room = '';
    this.creatorName = '';
    this.joinerName = '';
  }
  static playersInRoom: any = {};
  // {joiner: '', creator: '', count: 0}
  joinRoom(payload: { id: string | undefined; name: string }) {
    if (payload.id) this.room = payload.id;
    if (payload.id === '') return this.socket.emit('failed_to_join');
    const roomsInNameSpace = this.io._nsps
      .get('/')
      ?.adapter.rooms.get(this.room);
    if (roomsInNameSpace && roomsInNameSpace.size < 2) {
      // only 2 players may join a room at once
      this.socket.join(this.room);
      this.io.to(this.room).emit('joined_room', this.room);
      SocketOrder.playersInRoom[this.room].joiner = payload.name;

      if (roomsInNameSpace.size >= 1) {
        this.io.to(this.room).emit('initialize_game', {
          creator: SocketOrder.playersInRoom[this.room].creator,
          joiner: SocketOrder.playersInRoom[this.room].joiner,
        });
      }
    } else {
      return this.socket.emit('failed_to_join');
    }
  }
  createRoom(name: string) {
    this.room = this.socket.id.concat('s');
    this.socket.join(this.room);
    SocketOrder.playersInRoom[this.room] = {
      joiner: '',
      creator: '',
      count: 0,
    };

    SocketOrder.playersInRoom[this.room].creator = name;
    this.io.to(this.room).emit('joined_room', this.room);
  }
  receiveAttack(payload: { type: AttackType; coordinates: [string, string] }) {
    this.socket.broadcast.to(this.room).emit('receive_attack', payload);
  }
  sendRadar(payload: { grid: HTMLDivElement; count: number }) {
    this.socket.broadcast.to(this.room).emit('receive_radar', payload);
  }
  send = (payload: Payload) => {
    this.io.in(payload.room).emit('recieve_message', payload);
  };
  disconnect = () => {
    delete SocketOrder.playersInRoom[this.room];
    console.log(`User disconnected from ${(this, this.socket.id)}`);
  };
  shipsPlaced(shipCoords: any) {
    this.socket.broadcast.to(this.room).emit('send_board', shipCoords);
    // the board sent here is the board needed to fill the opponents board details
  }

  readyCheck() {
    SocketOrder.playersInRoom[this.room].count
      ? SocketOrder.playersInRoom[this.room].count++
      : (SocketOrder.playersInRoom[this.room].count = 1);
    if (SocketOrder.playersInRoom[this.room].count >= 2) {
      this.io.to(this.room).emit('begin_full_game');
    }
  }

  invokeListeners() {
    this.socket.on('send_radar', (payload) => this.sendRadar(payload));
    this.socket.on('send_attack', (payload) => this.receiveAttack(payload));
    this.socket.on('increment_ready_check', () => this.readyCheck());
    this.socket.on('ships_placed', (board) => this.shipsPlaced(board));
    this.socket.on('create_room', (name) => this.createRoom(name));
    this.socket.on('join_room', (payload) => this.joinRoom(payload));
    this.socket.on('disconnect', () => this.disconnect());
    this.socket.on('send_message', (payload) => this.send(payload));
  }
}
