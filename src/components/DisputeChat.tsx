import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { MessageCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSocket } from '@/hooks/useSocket';
import { useWallet } from '@/hooks/useWallet';
import { Message, Dispute, DisputeType, UserRole } from '@/backend/types/dispute';

export const DisputeChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [hasUnreadMessages, setHasUnreadMessages] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isDisputeCreated, setIsDisputeCreated] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [dispute, setDispute] = useState<Dispute>({
    id: '',
    disputeWith: '',
    disputeType: 'payment',
    description: '',
    createdBy: '',
    messages: []
  });

  const { address: currentUserAddress } = useWallet();
  const socket = useSocket('http://localhost:3001');

  // Register user's wallet address with socket server when connected
  useEffect(() => {
    if (!socket || !currentUserAddress) return;

    socket.emit('register', currentUserAddress);

    return () => {
      socket.off('register');
    };
  }, [socket, currentUserAddress]);

  // Handle incoming messages and disputes
  useEffect(() => {
    if (!socket || !currentUserAddress) return;

    socket.on('newMessage', (message: Message) => {
      if (message.disputeId === dispute.id) {
        setMessages(prev => [...prev, message]);
        if (!isSheetOpen) {
          setUnreadCount(prev => prev + 1);
          setHasUnreadMessages(true);
        }
      }
    });

    socket.on('disputeCreated', (createdDispute: Dispute) => {
      if (createdDispute.disputeWith === currentUserAddress) {
        setHasUnreadMessages(true);
        setUnreadCount(prev => prev + 1);
      }
    });

    return () => {
      socket.off('newMessage');
      socket.off('disputeCreated');
    };
  }, [socket, isSheetOpen, currentUserAddress, dispute.id]);

  // Reset unread count when opening the chat
  useEffect(() => {
    if (isSheetOpen) {
      setUnreadCount(0);
      setHasUnreadMessages(false);
    }
  }, [isSheetOpen]);

  const createDispute = () => {
    if (!dispute.disputeWith || !dispute.description || !socket || !currentUserAddress) return;

    const newDispute: Dispute = {
      ...dispute,
      id: Date.now().toString(),
      createdBy: currentUserAddress,
      messages: []
    };

    socket.emit('createDispute', newDispute);
    setDispute(newDispute);
    setIsDisputeCreated(true);
  };

  const sendMessage = () => {
    if (!newMessage.trim() || !socket || !dispute.id || !currentUserAddress) return;
    
    const message: Message = {
      id: Date.now().toString(),
      sender: currentUserAddress,
      content: newMessage,
      timestamp: new Date(),
      role: 'client', // This should come from your Web3Provider
      disputeId: dispute.id,
    };

    socket.emit('sendMessage', message);
    setMessages(prev => [...prev, message]);
    setNewMessage('');
  };

  return (
    <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
      <SheetTrigger asChild>
        <Button
          className="fixed bottom-4 right-4 h-12 w-12 rounded-full"
          variant="default"
        >
          <MessageCircle className="h-6 w-6" />
          {hasUnreadMessages && (
            <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 border-2 border-white flex items-center justify-center">
              <span className="text-white text-xs">{unreadCount}</span>
            </div>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[400px] sm:w-[540px] bg-black/95 border-l border-zinc-800">
        <SheetHeader>
          <SheetTitle className="text-white">Dispute Resolution</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col h-full">
          {!isDisputeCreated ? (
            <Card className="p-4 mt-4 bg-zinc-900/50 border-zinc-800">
              <form onSubmit={(e) => {
                e.preventDefault();
                createDispute();
              }}>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="disputeWith" className="text-zinc-400">Wallet Address of Disputed Party</Label>
                    <Input
                      id="disputeWith"
                      placeholder="0x..."
                      value={dispute.disputeWith}
                      onChange={(e) => setDispute({...dispute, disputeWith: e.target.value})}
                      className="bg-zinc-900 border-zinc-700"
                    />
                  </div>
                  <div>
                    <Label htmlFor="disputeType" className="text-zinc-400">Type of Dispute</Label>
                    <Select
                      value={dispute.disputeType}
                      onValueChange={(value: DisputeType) => 
                        setDispute({...dispute, disputeType: value})
                      }
                    >
                      <SelectTrigger className="bg-zinc-900 border-zinc-700">
                        <SelectValue placeholder="Select dispute type" />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-900 border-zinc-700">
                        <SelectItem value="payment">Payment Dispute</SelectItem>
                        <SelectItem value="work">Work Quality Dispute</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="description" className="text-zinc-400">Describe the Dispute</Label>
                    <Input
                      id="description"
                      placeholder="Briefly describe the issue..."
                      value={dispute.description}
                      onChange={(e) => setDispute({...dispute, description: e.target.value})}
                      className="bg-zinc-900 border-zinc-700"
                    />
                  </div>
                  <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700">
                    Start Dispute Resolution
                  </Button>
                </div>
              </form>
            </Card>
          ) : (
            <>
              <div className="bg-zinc-900/50 p-4 mb-4 rounded-lg border border-zinc-800">
                <h3 className="font-semibold text-white">Active Dispute</h3>
                <p className="text-sm text-zinc-400">With: {dispute.disputeWith}</p>
                <p className="text-sm text-zinc-400">Type: {dispute.disputeType}</p>
                <p className="text-sm text-zinc-400">Description: {dispute.description}</p>
              </div>
              <ScrollArea className="flex-1 p-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`mb-4 ${
                      message.sender === currentUserAddress
                        ? 'ml-auto text-right'
                        : 'mr-auto'
                    }`}
                  >
                    <div
                      className={`inline-block p-3 rounded-lg ${
                        message.sender === currentUserAddress
                          ? 'bg-purple-600 text-white'
                          : 'bg-zinc-800 text-zinc-200'
                      }`}
                    >
                      <p className="font-semibold text-sm opacity-80">
                        {message.sender === currentUserAddress ? 'You' : `${message.sender.slice(0, 6)}...${message.sender.slice(-4)}`}
                      </p>
                      <p>{message.content}</p>
                      <p className="text-xs opacity-50">
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
              </ScrollArea>
              <div className="p-4 border-t border-zinc-800">
                <div className="flex gap-2">
                  <Input
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        sendMessage();
                      }
                    }}
                    className="bg-zinc-900 border-zinc-700"
                  />
                  <Button onClick={sendMessage} className="bg-purple-600 hover:bg-purple-700">Send</Button>
                </div>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
