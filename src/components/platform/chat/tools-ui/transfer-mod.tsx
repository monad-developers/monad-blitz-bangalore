'use client';
import { useWalletClient, useChainId, useSwitchChain } from 'wagmi';
import { useState } from 'react';
import { monadTestnet } from 'wagmi/chains';

interface TransferModProps {
  RecievedResult?: {
    unsignedTx?: string;
    txDetails?: {
      recipent: string;
      amount: string;
      gasLimit: string | null;
      gasPrice: string | null;
      nonce: number | null;
      chainId: number | null;
    };
    message?: string;
    error?: string;
  };
}

export function TransferMod({ RecievedResult }: TransferModProps) {
  const { data: walletClient } = useWalletClient();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const [status, setStatus] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { txDetails, message, error } = RecievedResult || {};

  const isOnMonadTestnet = chainId === monadTestnet.id;

  const handleNetworkSwitch = async () => {
    if (!switchChain) {
      setStatus('\u274c Network switching not supported by this wallet');
      return;
    }
    try {
      setStatus('\U0001f504 Switching to Monad Testnet...');
      await switchChain({ chainId: monadTestnet.id });
      setStatus('\u2705 Switched to Monad Testnet');
    } catch (err: any) {
      setStatus(`\u274c Failed to switch network: ${err.message}`);
    }
  };

  const handleSendTransaction = async () => {
    if (!walletClient) {
      setStatus('\u274c Wallet not connected');
      return;
    }

    if (!isOnMonadTestnet) {
      await handleNetworkSwitch();
      return;
    }

    if (!txDetails) {
      setStatus('\u274c Transaction details missing');
      return;
    }

    try {
      setIsLoading(true);
      setStatus('\U0001f680 Sending transaction...');

      const toBigInt = (value: string | null): bigint | undefined => {
        if (!value || value === '0' || value === '') return undefined;
        try {
          const cleanValue = value.replace(/[^0-9]/g, '');
          return cleanValue ? BigInt(cleanValue) : undefined;
        } catch {
          return undefined;
        }
      };

      const transactionRequest = {
        to: txDetails.recipent as `0x${string}`,
        value: toBigInt(txDetails.amount) || BigInt(0),
        gas: toBigInt(txDetails.gasLimit),
        gasPrice: toBigInt(txDetails.gasPrice),
        nonce: txDetails.nonce || undefined,
      };

      const txHash = await walletClient.sendTransaction(transactionRequest);
      setStatus(`\u2705 Transaction sent! Hash: ${txHash.slice(0, 20)}...`);
    } catch (err: any) {
      setStatus(`\u274c Transaction failed: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 rounded-xl border border-zinc-700 bg-zinc-900 p-6 text-zinc-300 shadow-xl">
      {error && (
        <div className="rounded-lg border border-red-600 bg-red-950 p-4 text-red-300">
          \u274c {error}
        </div>
      )}

      {!isOnMonadTestnet && (
        <div className="rounded-lg border border-yellow-600 bg-yellow-950 p-3 text-sm text-yellow-300">
          \u26a0\ufe0f You are connected to the wrong network. Click the button
          below to switch.
        </div>
      )}

      {message && (
        <div className="rounded border border-green-700 bg-green-950 p-3 text-sm text-green-400">
          {message}
        </div>
      )}

      {txDetails && (
        <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
          <span className="font-medium text-zinc-400">Recipient:</span>
          <span className="text-white">{txDetails.recipent}</span>
          <span className="font-medium text-zinc-400">Amount (MON):</span>
          <span>{txDetails.amount}</span>
          <span className="font-medium text-zinc-400">Gas Limit:</span>
          <span>{txDetails.gasLimit ?? 'Auto'}</span>
          <span className="font-medium text-zinc-400">Gas Price:</span>
          <span>{txDetails.gasPrice ?? 'Auto'}</span>
          <span className="font-medium text-zinc-400">Nonce:</span>
          <span>{txDetails.nonce ?? 'Auto'}</span>
          <span className="font-medium text-zinc-400">Network:</span>
          <span className="font-semibold text-fuchsia-400">Monad Testnet</span>
        </div>
      )}

      <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
        <button
          onClick={handleSendTransaction}
          disabled={!walletClient || isLoading}
          className={`w-full rounded-lg px-5 py-2 font-semibold transition-all sm:w-auto ${
            !walletClient
              ? 'cursor-not-allowed bg-gray-600'
              : 'bg-fuchsia-600 hover:bg-fuchsia-700'
          } ${isLoading ? 'cursor-wait opacity-70' : ''}`}
        >
          {isLoading
            ? 'Sending...'
            : !isOnMonadTestnet
              ? 'Switch & Send'
              : 'Send Transaction'}
        </button>

        <div className="flex items-center gap-2 text-xs">
          <span
            className={`h-2 w-2 rounded-full ${
              isOnMonadTestnet ? 'bg-green-500' : 'bg-red-500'
            }`}
          />
          <span
            className={isOnMonadTestnet ? 'text-green-400' : 'text-red-400'}
          >
            {isOnMonadTestnet ? 'Connected to Monad Testnet' : 'Wrong Network'}
          </span>
        </div>
      </div>

      {status && (
        <div className="animate-fade-in rounded border border-blue-700 bg-blue-950 p-3 text-sm text-blue-400">
          {status}
        </div>
      )}
    </div>
  );
}
