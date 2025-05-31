'use client';

import { useState } from 'react';
import { useWalletClient } from 'wagmi';
import { parseEther } from 'viem';

export function TransferMod() {
  const { data: walletClient } = useWalletClient();

  const [toAddress, setToAddress] = useState('');
  const [amount, setAmount] = useState(''); // In ETH
  const [gas, setGas] = useState('');
  const [gasPrice, setGasPrice] = useState('');
  const [data, setData] = useState('');

  const ensureHex = (val: string): `0x${string}` => {
    return val.startsWith('0x')
      ? (val as `0x${string}`)
      : (`0x${val}` as `0x${string}`);
  };

  const handleTransfer = async () => {
    if (!walletClient || !toAddress || !amount) {
      console.error('Missing required fields');
      return;
    }

    try {
      await walletClient.signTransaction({
        to: ensureHex(toAddress),
        value: parseEther(amount), // Convert ETH to wei (bigint)
        gas: gas ? BigInt(gas) : undefined,
        gasPrice: gasPrice ? BigInt(gasPrice) : undefined,
        data: data ? ensureHex(data) : undefined,
      });
    } catch (error) {
      console.error('Transaction failed:', error);
    }
  };

  return (
    <div className="space-y-4">
      <input
        type="text"
        placeholder="To Address"
        value={toAddress}
        onChange={(e) => setToAddress(e.target.value)}
        className="w-full rounded border p-2"
      />
      <input
        type="text"
        placeholder="Amount in ETH"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="w-full rounded border p-2"
      />
      <input
        type="text"
        placeholder="Gas"
        value={gas}
        onChange={(e) => setGas(e.target.value)}
        className="w-full rounded border p-2"
      />
      <input
        type="text"
        placeholder="Gas Price"
        value={gasPrice}
        onChange={(e) => setGasPrice(e.target.value)}
        className="w-full rounded border p-2"
      />
      <input
        type="text"
        placeholder="Data (optional)"
        value={data}
        onChange={(e) => setData(e.target.value)}
        className="w-full rounded border p-2"
      />
      <button
        onClick={handleTransfer}
        className="rounded bg-blue-600 px-4 py-2 text-white"
      >
        Sign Transaction
      </button>
    </div>
  );
}
