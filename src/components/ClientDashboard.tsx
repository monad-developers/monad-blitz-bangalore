import React, { useState } from 'react';
import { Plus, Shield, Clock, AlertTriangle, CheckCircle, DollarSign, User, FileText, XCircle, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import CreateEscrowModal from './CreateEscrowModal';
import DisputeModal from './DisputeModal';
import ShareApprovalLink from './ShareApprovalLink';

interface ClientDashboardProps {
  userAddress: string;
}

const ClientDashboard: React.FC<ClientDashboardProps> = ({ userAddress }) => {
  const { toast } = useToast();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedEscrowForDispute, setSelectedEscrowForDispute] = useState<number | null>(null);

  // Mock data for client's sent escrows with additional status fields
  const clientEscrows = [
    {
      id: 1,
      recipient: '0x1234...5678',
      amount: '1000',
      token: 'MON',
      deadline: '2024-06-15',
      status: 'active',
      receiverTelegram: '@bob_designer',
      description: 'Website redesign project',
      workSubmitted: false,
      clientApproved: false,
      freelancerAccepted: true,
      daysOverdue: 0
    },
    {
      id: 2,
      recipient: '0x8765...4321',
      amount: '500',
      token: 'USDC',
      deadline: '2024-06-20',
      status: 'expired',
      receiverTelegram: '@diana_writer',
      description: 'Content writing services',
      workSubmitted: true,
      clientApproved: false,
      freelancerAccepted: false,
      daysOverdue: 3
    }
  ];

  const handleRefund = (escrowId: number) => {
    console.log('Refunding escrow:', escrowId);
    toast({
      title: "Refund Initiated",
      description: "Your refund has been processed successfully.",
    });
  };

  const handleExtendDeadline = (escrowId: number) => {
    console.log('Extending deadline for escrow:', escrowId);
    toast({
      title: "Deadline Extended",
      description: "The escrow deadline has been extended by 7 days.",
    });
  };

  const handleApproveWork = (escrowId: number) => {
    console.log('Approving work for escrow:', escrowId);
    toast({
      title: "Work Approved",
      description: "You have approved the submitted work. Freelancer can now claim payment.",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-blue-100 text-blue-800"><Clock className="w-3 h-3 mr-1" />Active</Badge>;
      case 'claimed':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Claimed</Badge>;
      case 'expired':
        return <Badge className="bg-red-100 text-red-800"><AlertTriangle className="w-3 h-3 mr-1" />Expired</Badge>;
      case 'dispute':
        return <Badge className="bg-yellow-100 text-yellow-800"><AlertTriangle className="w-3 h-3 mr-1" />In Dispute</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const getAdditionalTags = (escrow: any) => {
    const tags = [];

    // Freelancer acceptance status
    if (!escrow.freelancerAccepted) {
      tags.push(
        <Badge key="not-accepted" className="bg-orange-100 text-orange-800">
          <XCircle className="w-3 h-3 mr-1" />
          Not Accepted by Freelancer
        </Badge>
      );
    }

    // Work submission status
    if (escrow.workSubmitted && !escrow.clientApproved && escrow.status === 'active') {
      tags.push(
        <Badge key="pending-approval" className="bg-purple-100 text-purple-800">
          <FileText className="w-3 h-3 mr-1" />
          Pending Your Approval
        </Badge>
      );
    } else if (!escrow.workSubmitted && escrow.freelancerAccepted && escrow.status === 'active') {
      tags.push(
        <Badge key="work-not-submitted" className="bg-gray-100 text-gray-800">
          <Clock className="w-3 h-3 mr-1" />
          Work Not Submitted
        </Badge>
      );
    }

    // Client approval status
    if (escrow.clientApproved) {
      tags.push(
        <Badge key="approved" className="bg-green-100 text-green-800">
          <CheckCircle className="w-3 h-3 mr-1" />
          Work Approved
        </Badge>
      );
    }

    // Overdue status
    if (escrow.daysOverdue > 0) {
      tags.push(
        <Badge key="overdue" className="bg-red-100 text-red-800">
          <Calendar className="w-3 h-3 mr-1" />
          {escrow.daysOverdue} Days Overdue
        </Badge>
      );
    }

    return tags;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Shield className="w-6 h-6" />
            Client Dashboard
          </h2>
          <p className="text-gray-400">Manage your escrow payments</p>
        </div>
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create New Escrow
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300">Active Escrows</p>
                <p className="text-2xl font-bold">{clientEscrows.filter(e => e.status === 'active').length}</p>
              </div>
              <Clock className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300">Total Escrowed</p>
                <p className="text-2xl font-bold">1,500 MON</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300">Completed</p>
                <p className="text-2xl font-bold">12</p>
              </div>
              <CheckCircle className="w-8 h-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Escrows List */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-white">Your Escrows</h3>
        <div className="grid gap-4">
          {clientEscrows.map((escrow) => (
            <Card key={escrow.id} className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="font-semibold">Escrow #{escrow.id}</h4>
                    <p className="text-gray-300 text-sm">{escrow.description}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {getStatusBadge(escrow.status)}
                    {getAdditionalTags(escrow)}
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-gray-400 text-sm">Amount</p>
                    <p className="font-semibold">{escrow.amount} {escrow.token}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Recipient</p>
                    <p className="font-mono text-sm">{escrow.recipient}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Deadline</p>
                    <p className="text-sm">{new Date(escrow.deadline).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Freelancer</p>
                    <p className="text-sm">{escrow.receiverTelegram}</p>
                  </div>
                </div>

                <div className="flex gap-2 flex-wrap">
                  {escrow.status === 'expired' && (
                    <Button
                      size="sm"
                      onClick={() => handleRefund(escrow.id)}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Claim Refund
                    </Button>
                  )}
                  {escrow.status === 'active' && (
                    <>
                      {escrow.workSubmitted && !escrow.clientApproved && (
                        <Button
                          size="sm"
                          onClick={() => handleApproveWork(escrow.id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Approve Work
                        </Button>
                      )}
                      <ShareApprovalLink
                        escrowId={escrow.id}
                        freelancerTelegram={escrow.receiverTelegram}
                        description={escrow.description}
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleExtendDeadline(escrow.id)}
                        className="border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-white"
                      >
                        Extend Deadline
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedEscrowForDispute(escrow.id)}
                        className="border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-white"
                      >
                        <AlertTriangle className="w-4 h-4 mr-1" />
                        Flag Dispute
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Modals */}
      <CreateEscrowModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
      />
      
      {selectedEscrowForDispute && (
        <DisputeModal
          isOpen={true}
          onClose={() => setSelectedEscrowForDispute(null)}
          escrowId={selectedEscrowForDispute}
        />
      )}
    </div>
  );
};

export default ClientDashboard;
