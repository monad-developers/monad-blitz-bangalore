import { z } from 'zod';
import { tool } from 'ai';
import { ethers } from 'ethers';
import { provider } from './utils';

export const sendMod = tool({
  description:
    'Prepare an unsigned MONAD native token transfer transaction. Returns serialized transaction for frontend signing.',
  parameters: z.object({
    from: z.string().describe("The sender's address"),
    to: z.string().describe("The recipient's address"),
    amount: z.string().describe('Amount of MON to send '),
    gasLimit: z.number().optional().describe('Optional gas limit'),
    gasPrice: z.string().optional().describe('Optional gas price in wei'),
    nonce: z.number().optional().describe('Optional nonce'),
    chainId: z.number().optional().describe('Optional chain ID'),
  }),
  execute: async ({
    from,
    to,
    amount,
    gasLimit,
    gasPrice,
    nonce,
    chainId,
  }: {
    from: string;
    to: string;
    amount: string;
    gasLimit?: number;
    gasPrice?: string;
    nonce?: number;
    chainId?: number;
  }) => {
    try {
      if (!ethers.isAddress(to) || !ethers.isAddress(from)) {
        throw new Error('Invalid from or to address');
      }

      // Fetch gas price using getFeeData
      const feeData = await provider.getFeeData();
      const resolvedGasPrice = gasPrice
        ? BigInt(gasPrice)
        : (feeData.gasPrice ?? BigInt(0));

      // Determine nonce and chainId if not provided
      const resolvedNonce = nonce ?? (await provider.getTransactionCount(from));
      const resolvedChainId = chainId ?? (await provider.getNetwork()).chainId;

      const tx: ethers.TransactionRequest = {
        from: from,
        to: to,
        value: ethers.parseEther(amount),
        gasLimit: gasLimit ? BigInt(gasLimit) : undefined,
        gasPrice: resolvedGasPrice,
        nonce: resolvedNonce,
        chainId: resolvedChainId,
      };

      const unsignedTx = ethers.Transaction.from(tx as any).serialized;

      return {
        unsignedTx,
        txDetails: {
          from,
          to,
          amount,
          gasLimit: tx.gasLimit?.toString() ?? null,
          gasPrice: tx.gasPrice?.toString() ?? null,
          nonce: tx.nonce,
          chainId: tx.chainId,
        },
        message:
          'Transaction prepared. Please sign this transaction using your wallet.',
      };
    } catch (error: any) {
      return {
        error: `Failed to prepare MONAD transaction: ${error.message}`,
      };
    }
  },
});
