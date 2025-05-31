
import React, { useState } from 'react';
import { Scale, AlertTriangle, CheckCircle, Clock, MessageCircle, FileText, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

interface ArbitratorDashboardProps {
  userAddress: string;
}

const ArbitratorDashboard: React.FC<ArbitratorDashboardProps> = ({ userAddress }) => {
  const { toast } = useToast();
  const [selectedDispute, setSelectedDispute] = useState<number | null>(null);
  const [resolution, setResolution] = useState('');

  // Mock data for disputes
  const disputes = [
    {
      id: 1,
      escrowId: 5,
      client: '0x1234...5678',
      freelancer: '0x8765...4321',
      amount: '1000',
      token: 'MON',
      description: 'Website redesign project',
      reason: 'Work not delivered as agreed',
      evidence: 'https://example.com/evidence',
      status: 'pending',
      createdAt: '2024-05-30',
      clientTelegram: '@alice_dev',
      freelancerTelegram: '@bob_designer'
    },
    {
      id: 2,
      escrowId: 7,
      client: '0x9876...1234',
      freelancer: '0x5432...8765',
      amount: '750',
      token: 'USDC',
      description: 'Logo design project',
      reason: 'Quality issues with delivered work',
      evidence: 'https://example.com/evidence2',
      status: 'in_review',
      createdAt: '2024-05-29',
      clientTelegram: '@charlie_startup',
      freelancerTelegram: '@diana_designer'
    }
  ];

  const handleResolveDispute = (disputeId: number, resolution: 'client' | 'freelancer') => {
    console.log('Resolving dispute:', disputeId, 'in favor of:', resolution);
    toast({
      title: "Dispute Resolved",
      description: `Dispute #${disputeId} has been resolved in favor of the ${resolution}.`,
    });
  };

  const handleCreateMediationGroup = (disputeId: number) => {
    console.log('Creating mediation group for dispute:', disputeId);
    toast({
      title: "Mediation Group Created",
      description: "A private Telegram group has been created for all parties.",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Pending Review</Badge>;
      case 'in_review':
        return <Badge className="bg-blue-100 text-blue-800"><MessageCircle className="w-3 h-3 mr-1" />In Review</Badge>;
      case 'resolved':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Resolved</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Scale className="w-6 h-6" />
            Arbitrator Dashboard
          </h2>
          <p className="text-gray-400">Manage disputes and provide fair resolutions</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300">Pending Disputes</p>
                <p className="text-2xl font-bold">{disputes.filter(d => d.status === 'pending').length}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300">In Review</p>
                <p className="text-2xl font-bold">{disputes.filter(d => d.status === 'in_review').length}</p>
              </div>
              <MessageCircle className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300">Resolved</p>
                <p className="text-2xl font-bold">15</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300">Success Rate</p>
                <p className="text-2xl font-bold">94%</p>
              </div>
              <Scale className="w-8 h-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Disputes Management */}
      <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
        <CardHeader>
          <CardTitle>Active Disputes</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-slate-800">
              <TabsTrigger value="all" className="text-white">All Disputes</TabsTrigger>
              <TabsTrigger value="pending" className="text-white">Pending</TabsTrigger>
              <TabsTrigger value="in_review" className="text-white">In Review</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              {disputes.map((dispute) => (
                <Card key={dispute.id} className="bg-slate-800/50 border-slate-600">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="font-semibold text-white">Dispute #{dispute.id} - Escrow #{dispute.escrowId}</h4>
                        <p className="text-gray-300 text-sm">{dispute.description}</p>
                      </div>
                      {getStatusBadge(dispute.status)}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <p className="text-gray-400 text-sm">Amount</p>
                        <p className="font-semibold text-white">{dispute.amount} {dispute.token}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Client</p>
                        <p className="font-mono text-sm text-white">{dispute.client}</p>
                        <p className="text-xs text-gray-400">{dispute.clientTelegram}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Freelancer</p>
                        <p className="font-mono text-sm text-white">{dispute.freelancer}</p>
                        <p className="text-xs text-gray-400">{dispute.freelancerTelegram}</p>
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-gray-400 text-sm mb-1">Dispute Reason:</p>
                      <p className="text-white text-sm">{dispute.reason}</p>
                      {dispute.evidence && (
                        <div className="mt-2">
                          <p className="text-gray-400 text-sm">Evidence:</p>
                          <a href={dispute.evidence} className="text-blue-400 text-sm hover:underline" target="_blank" rel="noopener noreferrer">
                            View Evidence
                          </a>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      {dispute.status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleCreateMediationGroup(dispute.id)}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            <MessageCircle className="w-4 h-4 mr-1" />
                            Start Mediation
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedDispute(dispute.id)}
                            className="border-gray-400 text-gray-300 hover:bg-gray-700"
                          >
                            <FileText className="w-4 h-4 mr-1" />
                            Review Details
                          </Button>
                        </>
                      )}
                      {dispute.status === 'in_review' && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleResolveDispute(dispute.id, 'client')}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            Resolve for Client
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleResolveDispute(dispute.id, 'freelancer')}
                            className="bg-purple-600 hover:bg-purple-700"
                          >
                            Resolve for Freelancer
                          </Button>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="pending">
              {disputes.filter(d => d.status === 'pending').map((dispute) => (
                <div key={dispute.id} className="p-4 bg-slate-800/50 rounded border border-slate-600">
                  <p className="text-white">Dispute #{dispute.id} - {dispute.description}</p>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="in_review">
              {disputes.filter(d => d.status === 'in_review').map((dispute) => (
                <div key={dispute.id} className="p-4 bg-slate-800/50 rounded border border-slate-600">
                  <p className="text-white">Dispute #{dispute.id} - {dispute.description}</p>
                </div>
              ))}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default ArbitratorDashboard;
