import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function getSocket(): Socket | null {
  const token = localStorage.getItem('z_token');
  if (!token) {
    if (socket) {
      socket.disconnect();
      socket = null;
    }
    return null;
  }

  // Connects to your live cloud backend on Render
  const RAW_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const SOCKET_URL = RAW_URL.replace(/\/api\/?$/, '').replace(/\/$/, '');

  if (!socket || !socket.connected) {
    socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'], // Fallback to polling if mobile data blocks raw websockets
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000
    });
  }

  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
