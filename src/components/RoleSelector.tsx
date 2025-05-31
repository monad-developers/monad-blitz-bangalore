
import React from 'react';
import { Shield, User, Scale } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface RoleSelectorProps {
  onRoleSelect: (role: 'client' | 'freelancer' | 'arbitrator') => void;
}

const RoleSelector: React.FC<RoleSelectorProps> = ({ onRoleSelect }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Choose Your Role
          </h1>
          <p className="text-xl text-gray-300">
            Select how you want to use GriffinLock.mon
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Client Role */}
          <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/15 transition-all duration-200 cursor-pointer group">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-xl">Client</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-gray-300">
                Create escrows, hire freelancers, and manage your projects securely.
              </p>
              <ul className="text-sm text-gray-400 space-y-2">
                <li>• Create escrow payments</li>
                <li>• Manage project deadlines</li>
                <li>• Request refunds if needed</li>
                <li>• Flag disputes when necessary</li>
              </ul>
              <Button
                onClick={() => onRoleSelect('client')}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                Continue as Client
              </Button>
            </CardContent>
          </Card>

          {/* Freelancer Role */}
          <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/15 transition-all duration-200 cursor-pointer group">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <User className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-xl">Freelancer</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-gray-300">
                Receive secure payments, track projects, and claim your earnings.
              </p>
              <ul className="text-sm text-gray-400 space-y-2">
                <li>• View incoming projects</li>
                <li>• Submit work deliverables</li>
                <li>• Claim payments safely</li>
                <li>• Flag disputes if needed</li>
              </ul>
              <Button
                onClick={() => onRoleSelect('freelancer')}
                className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
              >
                Continue as Freelancer
              </Button>
            </CardContent>
          </Card>

          {/* Arbitrator Role */}
          <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/15 transition-all duration-200 cursor-pointer group">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Scale className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-xl">Arbitrator</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-gray-300">
                Provide neutral mediation and resolve disputes fairly.
              </p>
              <ul className="text-sm text-gray-400 space-y-2">
                <li>• Review dispute cases</li>
                <li>• Mediate between parties</li>
                <li>• Make fair resolutions</li>
                <li>• Manage Telegram groups</li>
              </ul>
              <Button
                onClick={() => onRoleSelect('arbitrator')}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                Continue as Arbitrator
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default RoleSelector;
