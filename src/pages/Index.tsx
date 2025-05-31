import React, { useState } from 'react';
import { Plus, Shield, Clock, Users, ArrowRight, CheckCircle, AlertCircle, Timer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { WalletButton } from '@/components/WalletButton';
import { useWallet } from '@/hooks/useWallet';
import CreateEscrowModal from '@/components/CreateEscrowModal';
import EscrowCard from '@/components/EscrowCard';

const Index = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { isConnected, address } = useWallet();

  // Mock data for demonstration
  const mockEscrows = [
    {
      id: 1,
      recipient: '0x1234...5678',
      amount: '1000',
      token: 'MON',
      deadline: '2024-06-15',
      status: 'active',
      senderTelegram: '@alice_dev',
      receiverTelegram: '@bob_designer',
      description: 'Website redesign project'
    },
    {
      id: 2,
      recipient: '0x8765...4321',
      amount: '500',
      token: 'USDC',
      deadline: '2024-06-20',
      status: 'expired',
      senderTelegram: '@charlie_founder',
      receiverTelegram: '@diana_writer',
      description: 'Content writing services'
    },
    {
      id: 3,
      recipient: '0x9876...1234',
      amount: '2000',
      token: 'MON',
      deadline: '2024-06-25',
      status: 'claimed',
      senderTelegram: '@eve_startup',
      receiverTelegram: '@frank_dev',
      description: 'Smart contract audit'
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200"><Timer className="w-3 h-3 mr-1" />Active</Badge>;
      case 'claimed':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200"><CheckCircle className="w-3 h-3 mr-1" />Claimed</Badge>;
      case 'expired':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200"><AlertCircle className="w-3 h-3 mr-1" />Expired</Badge>;
      case 'dispute':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200"><Users className="w-3 h-3 mr-1" />In Dispute</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="border-b border-white/10 backdrop-blur-sm bg-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white">GriffinLock.mon</h1>
            </div>
            
            <div className="flex items-center gap-4">
              <WalletButton />
              {isConnected && (
                <Button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Escrow
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="mb-8">
            <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Trustless Escrow
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                On Monad
              </span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
              Secure, time-bound payments with built-in dispute resolution. 
              Create escrows with automatic timeouts and 2-of-3 multisig arbitration.
            </p>
            
            {isConnected ? (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  onClick={() => setIsCreateModalOpen(true)}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                >
                  Start Your First Escrow
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10">
                  Learn More
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4">
                <p className="text-gray-400 mb-4">Connect your wallet to get started</p>
                <WalletButton />
              </div>
            )}
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-8 mt-16">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
              <CardHeader>
                <Clock className="w-8 h-8 text-blue-400 mb-2" />
                <CardTitle>Time-Locked Security</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300">Funds automatically unlock based on configurable deadlines with built-in timeout protection.</p>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
              <CardHeader>
                <Users className="w-8 h-8 text-purple-400 mb-2" />
                <CardTitle>Dispute Resolution</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300">Automated Telegram mediation with neutral arbitrators for fair conflict resolution.</p>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
              <CardHeader>
                <Shield className="w-8 h-8 text-green-400 mb-2" />
                <CardTitle>Multisig Protection</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300">2-of-3 multisig logic ensures no single party can control the escrow funds.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Dashboard Section - Only show if wallet is connected */}
      {isConnected && (
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-3xl font-bold text-white">Your Escrows</h3>
                <p className="text-gray-400 mt-1">Connected: {address?.slice(0, 6)}...{address?.slice(-4)}</p>
              </div>
              <div className="flex gap-2">
                <Badge variant="outline" className="border-blue-400 text-blue-400">
                  {mockEscrows.filter(e => e.status === 'active').length} Active
                </Badge>
                <Badge variant="outline" className="border-green-400 text-green-400">
                  {mockEscrows.filter(e => e.status === 'claimed').length} Completed
                </Badge>
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockEscrows.map((escrow) => (
                <EscrowCard
                  key={escrow.id}
                  escrow={escrow}
                  statusBadge={getStatusBadge(escrow.status)}
                />
              ))}
            </div>

            {mockEscrows.length === 0 && (
              <Card className="bg-white/5 backdrop-blur-sm border-white/20 text-center py-12">
                <CardContent>
                  <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-xl font-semibold text-white mb-2">No escrows yet</h4>
                  <p className="text-gray-400 mb-6">Create your first escrow to get started with secure payments.</p>
                  <Button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create First Escrow
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </section>
      )}

      {/* Create Escrow Modal */}
      <CreateEscrowModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
      />
    </div>
  );
};

export default Index;
