import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';

let io: Server;

export const initSocket = (httpServer: HttpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket: Socket) => {
    console.log(`[Socket.io] Client connected: ${socket.id}`);

    socket.on('joinProject', (projectId: string) => {
      socket.join(projectId);
      console.log(`[Socket.io] Client ${socket.id} joined project room: ${projectId}`);
    });

    socket.on('leaveProject', (projectId: string) => {
        socket.leave(projectId);
        console.log(`[Socket.io] Client ${socket.id} left project room: ${projectId}`);
    });

    socket.on('disconnect', () => {
      console.log(`[Socket.io] Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

// This function allows us to get the io instance in other files
export const getIO = (): Server => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
};
