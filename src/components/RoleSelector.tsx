
import React from 'react';
import { Shield, Users, Scale } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useWallet } from '@/hooks/useWallet';

type UserRole = 'client' | 'freelancer' | 'arbitrator';

interface RoleSelectorProps {
  onRoleSelect: (role: UserRole) => void;
}

// Product owner's wallet address (only this address can access arbitrator dashboard)
const PRODUCT_OWNER_ADDRESS = '0x742d35Cc6634C0532925a3b8D404C8C8885d8a80'; // Replace with actual product owner address

const RoleSelector: React.FC<RoleSelectorProps> = ({ onRoleSelect }) => {
  const { address } = useWallet();
  
  const isProductOwner = address?.toLowerCase() === PRODUCT_OWNER_ADDRESS.toLowerCase();

  const roles = [
    {
      id: 'client' as UserRole,
      title: 'Client',
      description: 'Create and manage escrow payments',
      icon: Shield,
      color: 'from-blue-500 to-blue-600'
    },
    {
      id: 'freelancer' as UserRole,
      title: 'Freelancer',
      description: 'Receive payments and manage work delivery',
      icon: Users,
      color: 'from-purple-500 to-purple-600'
    },
    {
      id: 'arbitrator' as UserRole,
      title: 'Arbitrator',
      description: 'Resolve disputes and provide mediation',
      icon: Scale,
      color: 'from-green-500 to-green-600',
      restricted: !isProductOwner
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Choose Your Role</h1>
          <p className="text-gray-300 text-lg">Select how you want to use GriffinLock.mon</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {roles.map((role) => (
            <Card
              key={role.id}
              className={`bg-white/10 backdrop-blur-sm border-white/20 text-white cursor-pointer transition-all duration-200 hover:bg-white/15 ${
                role.restricted ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <CardHeader className="text-center">
                <div className={`w-16 h-16 bg-gradient-to-r ${role.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                  <role.icon className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-xl">{role.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-300 mb-6">{role.description}</p>
                {role.restricted ? (
                  <div className="text-red-400 text-sm mb-4">
                    Access restricted to product owner
                  </div>
                ) : null}
                <Button
                  onClick={() => !role.restricted && onRoleSelect(role.id)}
                  className={`w-full bg-gradient-to-r ${role.color} hover:opacity-90 transition-opacity ${
                    role.restricted ? 'cursor-not-allowed opacity-50' : ''
                  }`}
                  disabled={role.restricted}
                >
                  Select {role.title}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {!isProductOwner && (
          <div className="mt-8 text-center">
            <p className="text-gray-400 text-sm">
              Connected as: {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Unknown'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoleSelector;
