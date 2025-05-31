import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

export const useSocket = (url: string) => {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Initialize socket connection
    const socket = io(url, {
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    // Handle connection events
    socket.on('connect', () => {
      console.log('Connected to WebSocket server');
    });

    socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
    });

    socketRef.current = socket;

    // Cleanup on unmount
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [url]);

  return socketRef.current;
};
