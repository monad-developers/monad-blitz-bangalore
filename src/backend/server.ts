import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { disputeService } from './services/disputeService';
import { Dispute, Message } from './types/dispute';

const app = express();
app.use(cors());
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Store user socket connections
const userSockets = new Map<string, string>(); // walletAddress -> socketId

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Handle user registration with wallet address
  socket.on('register', (walletAddress: string) => {
    userSockets.set(walletAddress, socket.id);
    console.log(`User ${walletAddress} registered with socket ${socket.id}`);
  });

  // Handle dispute creation
  socket.on('createDispute', (dispute: Dispute) => {
    const newDispute = disputeService.createDispute(dispute);
    
    // Notify the disputed party if they're online
    const disputedPartySocket = userSockets.get(dispute.disputeWith);
    if (disputedPartySocket) {
      io.to(disputedPartySocket).emit('disputeCreated', newDispute);
    }
  });

  // Handle new messages
  socket.on('sendMessage', (message: Message) => {
    if (!message.disputeId) return;

    const savedMessage = disputeService.addMessage(message.disputeId, message);
    if (!savedMessage) return;

    const dispute = disputeService.getDispute(message.disputeId);
    if (!dispute) return;

    // Send message to both parties
    const recipientAddress = dispute.createdBy === message.sender 
      ? dispute.disputeWith 
      : dispute.createdBy;

    const recipientSocket = userSockets.get(recipientAddress);
    if (recipientSocket) {
      io.to(recipientSocket).emit('newMessage', savedMessage);
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    // Remove user from userSockets
    for (const [address, socketId] of userSockets.entries()) {
      if (socketId === socket.id) {
        userSockets.delete(address);
        break;
      }
    }
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`WebSocket server running on port ${PORT}`);
});
