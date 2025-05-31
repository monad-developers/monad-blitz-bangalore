
import React, { useState } from 'react';
import { X, Calendar, DollarSign, User, MessageCircle, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

interface CreateEscrowModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateEscrowModal: React.FC<CreateEscrowModalProps> = ({ isOpen, onClose }) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    recipient: '',
    amount: '',
    token: 'MON',
    deadline: '7',
    senderTelegram: '',
    receiverTelegram: '',
    description: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.recipient || !formData.amount || !formData.senderTelegram || !formData.receiverTelegram) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    // Mock escrow creation
    console.log('Creating escrow with data:', formData);
    
    toast({
      title: "Escrow Created Successfully!",
      description: `Escrow for ${formData.amount} ${formData.token} has been created.`,
    });

    // Reset form and close modal
    setFormData({
      recipient: '',
      amount: '',
      token: 'MON',
      deadline: '7',
      senderTelegram: '',
      receiverTelegram: '',
      description: ''
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-slate-900 border-slate-700 text-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-blue-400" />
            Create New Escrow
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Recipient Address */}
          <div className="space-y-2">
            <Label htmlFor="recipient" className="text-sm font-medium text-gray-300">
              <User className="w-4 h-4 inline mr-2" />
              Recipient Wallet Address *
            </Label>
            <Input
              id="recipient"
              placeholder="0x..."
              value={formData.recipient}
              onChange={(e) => handleInputChange('recipient', e.target.value)}
              className="bg-slate-800 border-slate-600 text-white placeholder-gray-400"
            />
          </div>

          {/* Amount and Token */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount" className="text-sm font-medium text-gray-300">
                Amount *
              </Label>
              <Input
                id="amount"
                type="number"
                placeholder="1000"
                value={formData.amount}
                onChange={(e) => handleInputChange('amount', e.target.value)}
                className="bg-slate-800 border-slate-600 text-white placeholder-gray-400"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="token" className="text-sm font-medium text-gray-300">
                Token
              </Label>
              <Select value={formData.token} onValueChange={(value) => handleInputChange('token', value)}>
                <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-600">
                  <SelectItem value="MON">MON</SelectItem>
                  <SelectItem value="USDC">USDC</SelectItem>
                  <SelectItem value="USDT">USDT</SelectItem>
                  <SelectItem value="ETH">ETH</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Deadline */}
          <div className="space-y-2">
            <Label htmlFor="deadline" className="text-sm font-medium text-gray-300">
              <Calendar className="w-4 h-4 inline mr-2" />
              Deadline
            </Label>
            <Select value={formData.deadline} onValueChange={(value) => handleInputChange('deadline', value)}>
              <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-600">
                <SelectItem value="1">1 Day</SelectItem>
                <SelectItem value="3">3 Days</SelectItem>
                <SelectItem value="7">7 Days</SelectItem>
                <SelectItem value="14">14 Days</SelectItem>
                <SelectItem value="30">30 Days</SelectItem>
                <SelectItem value="60">60 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Telegram Usernames */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="senderTelegram" className="text-sm font-medium text-gray-300">
                <MessageCircle className="w-4 h-4 inline mr-2" />
                Your Telegram *
              </Label>
              <Input
                id="senderTelegram"
                placeholder="@your_username"
                value={formData.senderTelegram}
                onChange={(e) => handleInputChange('senderTelegram', e.target.value)}
                className="bg-slate-800 border-slate-600 text-white placeholder-gray-400"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="receiverTelegram" className="text-sm font-medium text-gray-300">
                <MessageCircle className="w-4 h-4 inline mr-2" />
                Recipient Telegram *
              </Label>
              <Input
                id="receiverTelegram"
                placeholder="@recipient_username"
                value={formData.receiverTelegram}
                onChange={(e) => handleInputChange('receiverTelegram', e.target.value)}
                className="bg-slate-800 border-slate-600 text-white placeholder-gray-400"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium text-gray-300">
              <FileText className="w-4 h-4 inline mr-2" />
              Description (Optional)
            </Label>
            <Textarea
              id="description"
              placeholder="Brief description of the work or service..."
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="bg-slate-800 border-slate-600 text-white placeholder-gray-400 min-h-[80px]"
            />
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 border-slate-600 text-gray-300 hover:bg-slate-800"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
            >
              Create Escrow
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateEscrowModal;
