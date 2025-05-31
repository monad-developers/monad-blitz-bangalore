
import React, { useState } from 'react';
import { Calendar, DollarSign, MessageCircle, AlertTriangle, CheckCircle, RefreshCw, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import DisputeModal from './DisputeModal';

interface EscrowData {
  id: number;
  recipient: string;
  amount: string;
  token: string;
  deadline: string;
  status: string;
  senderTelegram: string;
  receiverTelegram: string;
  description: string;
}

interface EscrowCardProps {
  escrow: EscrowData;
  statusBadge: React.ReactNode;
}

const EscrowCard: React.FC<EscrowCardProps> = ({ escrow, statusBadge }) => {
  const { toast } = useToast();
  const [isDisputeModalOpen, setIsDisputeModalOpen] = useState(false);

  const handleClaim = () => {
    toast({
      title: "Funds Claimed",
      description: `Successfully claimed ${escrow.amount} ${escrow.token}`,
    });
  };

  const handleRefund = () => {
    toast({
      title: "Refund Processed",
      description: `${escrow.amount} ${escrow.token} has been refunded`,
    });
  };

  const getActionButtons = () => {
    switch (escrow.status) {
      case 'active':
        return (
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={handleClaim}
              className="bg-green-600 hover:bg-green-700 text-white flex-1"
            >
              <CheckCircle className="w-4 h-4 mr-1" />
              Claim
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsDisputeModalOpen(true)}
              className="border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-white"
            >
              <AlertTriangle className="w-4 h-4 mr-1" />
              Dispute
            </Button>
          </div>
        );
      case 'expired':
        return (
          <Button
            size="sm"
            onClick={handleRefund}
            className="w-full bg-red-600 hover:bg-red-700 text-white"
          >
            <RefreshCw className="w-4 h-4 mr-1" />
            Refund
          </Button>
        );
      case 'claimed':
        return (
          <Badge className="w-full justify-center bg-green-100 text-green-800">
            <CheckCircle className="w-4 h-4 mr-1" />
            Completed
          </Badge>
        );
      case 'dispute':
        return (
          <Badge className="w-full justify-center bg-yellow-100 text-yellow-800">
            <MessageCircle className="w-4 h-4 mr-1" />
            In Mediation
          </Badge>
        );
      default:
        return null;
    }
  };

  const formatDeadline = (deadline: string) => {
    const date = new Date(deadline);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const isExpired = new Date(escrow.deadline) < new Date();
  const daysUntilDeadline = Math.ceil((new Date(escrow.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

  return (
    <>
      <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/15 transition-all duration-200">
        <CardHeader className="pb-4">
          <div className="flex justify-between items-start">
            <CardTitle className="text-lg font-semibold">
              Escrow #{escrow.id}
            </CardTitle>
            {statusBadge}
          </div>
          {escrow.description && (
            <p className="text-sm text-gray-300 mt-2">{escrow.description}</p>
          )}
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Amount */}
          <div className="flex items-center justify-between">
            <span className="text-gray-300 flex items-center">
              <DollarSign className="w-4 h-4 mr-2" />
              Amount
            </span>
            <span className="font-semibold text-lg">
              {escrow.amount} {escrow.token}
            </span>
          </div>

          {/* Recipient */}
          <div className="flex items-center justify-between">
            <span className="text-gray-300 flex items-center">
              <User className="w-4 h-4 mr-2" />
              Recipient
            </span>
            <span className="font-mono text-sm">
              {escrow.recipient.slice(0, 6)}...{escrow.recipient.slice(-4)}
            </span>
          </div>

          {/* Deadline */}
          <div className="flex items-center justify-between">
            <span className="text-gray-300 flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              Deadline
            </span>
            <div className="text-right">
              <div className="font-semibold">{formatDeadline(escrow.deadline)}</div>
              {!isExpired && escrow.status === 'active' && (
                <div className="text-xs text-gray-400">
                  {daysUntilDeadline > 0 ? `${daysUntilDeadline} days left` : 'Expires today'}
                </div>
              )}
            </div>
          </div>

          {/* Telegram Usernames */}
          <div className="flex items-center justify-between">
            <span className="text-gray-300 flex items-center">
              <MessageCircle className="w-4 h-4 mr-2" />
              Telegram
            </span>
            <div className="text-right text-sm">
              <div>{escrow.senderTelegram}</div>
              <div className="text-gray-400">{escrow.receiverTelegram}</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2">
            {getActionButtons()}
          </div>
        </CardContent>
      </Card>

      <DisputeModal
        isOpen={isDisputeModalOpen}
        onClose={() => setIsDisputeModalOpen(false)}
        escrowId={escrow.id}
      />
    </>
  );
};

export default EscrowCard;
