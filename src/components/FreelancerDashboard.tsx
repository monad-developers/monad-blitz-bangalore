
import React, { useState } from 'react';
import { Clock, CheckCircle, AlertTriangle, DollarSign, User, FileText, XCircle, Calendar, ThumbsUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import DisputeModal from './DisputeModal';

interface FreelancerDashboardProps {
  userAddress: string;
}

const FreelancerDashboard: React.FC<FreelancerDashboardProps> = ({ userAddress }) => {
  const { toast } = useToast();
  const [selectedEscrowForDispute, setSelectedEscrowForDispute] = useState<number | null>(null);

  // Mock data for freelancer's received escrows with additional status fields
  const receivedEscrows = [
    {
      id: 3,
      sender: '0x9876...1234',
      amount: '2000',
      token: 'MON',
      deadline: '2024-06-25',
      status: 'active',
      senderTelegram: '@eve_startup',
      description: 'Smart contract audit',
      workSubmitted: false,
      clientApproved: false,
      freelancerAccepted: true,
      daysUntilDeadline: 7,
      clientWaitingForWork: true
    },
    {
      id: 4,
      sender: '0x5432...8765',
      amount: '750',
      token: 'USDC',
      deadline: '2024-06-18',
      status: 'active',
      senderTelegram: '@alice_ceo',
      description: 'Logo design project',
      workSubmitted: true,
      clientApproved: false,
      freelancerAccepted: true,
      daysUntilDeadline: 2,
      clientWaitingForWork: false
    }
  ];

  const handleClaimFunds = (escrowId: number) => {
    console.log('Claiming funds for escrow:', escrowId);
    toast({
      title: "Funds Claimed Successfully!",
      description: "The escrow funds have been transferred to your wallet.",
    });
  };

  const handleSubmitWork = (escrowId: number) => {
    console.log('Submitting work for escrow:', escrowId);
    toast({
      title: "Work Submitted",
      description: "Your work has been submitted for client review.",
    });
  };

  const handleAcceptProject = (escrowId: number) => {
    console.log('Accepting project for escrow:', escrowId);
    toast({
      title: "Project Accepted",
      description: "You have accepted this project. You can now start working on it.",
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

    // Project acceptance status
    if (!escrow.freelancerAccepted) {
      tags.push(
        <Badge key="pending-acceptance" className="bg-orange-100 text-orange-800">
          <Clock className="w-3 h-3 mr-1" />
          Pending Your Acceptance
        </Badge>
      );
    }

    // Work submission status
    if (escrow.workSubmitted && !escrow.clientApproved) {
      tags.push(
        <Badge key="pending-client-approval" className="bg-purple-100 text-purple-800">
          <FileText className="w-3 h-3 mr-1" />
          Awaiting Client Approval
        </Badge>
      );
    } else if (!escrow.workSubmitted && escrow.freelancerAccepted) {
      tags.push(
        <Badge key="work-pending" className="bg-gray-100 text-gray-800">
          <FileText className="w-3 h-3 mr-1" />
          Work Not Submitted
        </Badge>
      );
    }

    // Client approval status
    if (escrow.clientApproved) {
      tags.push(
        <Badge key="approved-ready-claim" className="bg-green-100 text-green-800">
          <ThumbsUp className="w-3 h-3 mr-1" />
          Approved - Ready to Claim
        </Badge>
      );
    }

    // Deadline urgency
    if (escrow.daysUntilDeadline <= 1 && escrow.daysUntilDeadline > 0) {
      tags.push(
        <Badge key="urgent" className="bg-red-100 text-red-800">
          <AlertTriangle className="w-3 h-3 mr-1" />
          Due Tomorrow
        </Badge>
      );
    } else if (escrow.daysUntilDeadline <= 3 && escrow.daysUntilDeadline > 1) {
      tags.push(
        <Badge key="soon" className="bg-yellow-100 text-yellow-800">
          <Calendar className="w-3 h-3 mr-1" />
          Due Soon ({escrow.daysUntilDeadline} days)
        </Badge>
      );
    }

    // Client waiting status
    if (escrow.clientWaitingForWork && escrow.freelancerAccepted && !escrow.workSubmitted) {
      tags.push(
        <Badge key="client-waiting" className="bg-blue-100 text-blue-800">
          <User className="w-3 h-3 mr-1" />
          Client Waiting for Deliverable
        </Badge>
      );
    }

    return tags;
  };

  const getDaysUntilDeadline = (deadline: string) => {
    const days = Math.ceil((new Date(deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <User className="w-6 h-6" />
            Freelancer Dashboard
          </h2>
          <p className="text-gray-400">Track your projects and claim payments</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300">Active Projects</p>
                <p className="text-2xl font-bold">{receivedEscrows.filter(e => e.status === 'active').length}</p>
              </div>
              <FileText className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300">Pending Earnings</p>
                <p className="text-2xl font-bold">2,750 MON</p>
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
                <p className="text-2xl font-bold">8</p>
              </div>
              <CheckCircle className="w-8 h-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Projects List */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-white">Your Projects</h3>
        <div className="grid gap-4">
          {receivedEscrows.map((escrow) => (
            <Card key={escrow.id} className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="font-semibold">Project #{escrow.id}</h4>
                    <p className="text-gray-300 text-sm">{escrow.description}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {getStatusBadge(escrow.status)}
                    {getAdditionalTags(escrow)}
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-gray-400 text-sm">Payment</p>
                    <p className="font-semibold">{escrow.amount} {escrow.token}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Client</p>
                    <p className="font-mono text-sm">{escrow.sender}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Deadline</p>
                    <p className="text-sm">{new Date(escrow.deadline).toLocaleDateString()}</p>
                    <p className="text-xs text-gray-400">{getDaysUntilDeadline(escrow.deadline)} days left</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Client Contact</p>
                    <p className="text-sm">{escrow.senderTelegram}</p>
                  </div>
                </div>

                <div className="flex gap-2 flex-wrap">
                  {escrow.status === 'active' && (
                    <>
                      {!escrow.freelancerAccepted ? (
                        <Button
                          size="sm"
                          onClick={() => handleAcceptProject(escrow.id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Accept Project
                        </Button>
                      ) : !escrow.workSubmitted ? (
                        <Button
                          size="sm"
                          onClick={() => handleSubmitWork(escrow.id)}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <FileText className="w-4 h-4 mr-1" />
                          Submit Work
                        </Button>
                      ) : escrow.clientApproved ? (
                        <Button
                          size="sm"
                          onClick={() => handleClaimFunds(escrow.id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Claim Payment
                        </Button>
                      ) : null}
                      
                      {escrow.freelancerAccepted && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedEscrowForDispute(escrow.id)}
                          className="border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-white"
                        >
                          <AlertTriangle className="w-4 h-4 mr-1" />
                          Flag Dispute
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Dispute Modal */}
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

export default FreelancerDashboard;
