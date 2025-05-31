'use client';
import {
  useAccount,
  useConnect,
  useDisconnect,
  useSwitchChain,
  useChainId,
} from 'wagmi';
import { injected } from 'wagmi/connectors';
import { monadTestnet } from 'wagmi/chains';
import { useState } from 'react';
import { Button } from '../../ui/button';
import { ChevronDown, Wallet, LogOut, Network } from 'lucide-react';

export function CustomWalletButton() {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain, isPending: isSwitching } = useSwitchChain();
  const chainId = useChainId();
  const [isOpen, setIsOpen] = useState(false);

  const isOnMonadTestnet = chainId === monadTestnet.id;

  const handleConnect = () => {
    connect({
      connector: injected(),
      chainId: monadTestnet.id,
    });
  };

  const handleSwitchNetwork = async () => {
    if (switchChain) {
      try {
        await switchChain({ chainId: monadTestnet.id });
      } catch (error) {
        console.error('Failed to switch network:', error);
      }
    }
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  if (!isConnected) {
    return (
      <Button
        onClick={handleConnect}
        className="bg-fuchsia-600 font-medium text-white hover:bg-fuchsia-700"
      >
        <Wallet className="mr-2 h-4 w-4" />
        Connect Wallet
      </Button>
    );
  }

  return (
    <div className="relative">
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-fuchsia-600 font-medium text-white hover:bg-fuchsia-700"
      >
        <div
          className={`h-2 w-2 rounded-full ${isOnMonadTestnet ? 'bg-green-400' : 'bg-red-400'}`}
        />
        {formatAddress(address!)}
        <ChevronDown className="h-4 w-4" />
      </Button>

      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 w-64 rounded-lg border border-zinc-200 bg-white shadow-lg dark:border-zinc-700 dark:bg-zinc-800">
          <div className="border-b border-zinc-200 p-4 dark:border-zinc-700">
            <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
              {formatAddress(address!)}
            </div>
            <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              Connected to{' '}
              {isOnMonadTestnet ? 'Monad Testnet' : 'Wrong Network'}
            </div>
          </div>

          <div className="p-2">
            {!isOnMonadTestnet && (
              <Button
                onClick={handleSwitchNetwork}
                disabled={isSwitching}
                className="w-full justify-start text-orange-600 hover:bg-orange-50 hover:text-orange-700 dark:hover:bg-orange-950"
                variant="ghost"
              >
                <Network className="mr-2 h-4 w-4" />
                {isSwitching ? 'Switching...' : 'Switch to Monad Testnet'}
              </Button>
            )}

            <Button
              onClick={() => {
                disconnect();
                setIsOpen(false);
              }}
              className="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950"
              variant="ghost"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Disconnect
            </Button>
          </div>
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
      )}
    </div>
  );
}
