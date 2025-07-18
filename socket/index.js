import { Server } from 'socket.io';
import SocketService from '../services/socketService.js';

export default function initSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  const socketService = new SocketService(io);
  socketService.initialize();
  
  return io;
}