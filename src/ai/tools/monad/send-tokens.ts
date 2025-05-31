import { z } from 'zod';
import { tool } from 'ai';
import { ethers } from 'ethers';
import { provider } from './utils';

export const sendmod = tool({
  description:
    'Prepare an unsigned MONAD native token transfer transaction. Returns serialized transaction for frontend signing.',
  parameters: z.object({
    recipent: z.string().describe("The recipient's address"),
    amount: z.string().describe('Amount of MON to send'),
    gasLimit: z.number().optional().describe('Optional gas limit'),
    gasPrice: z.string().optional().describe('Optional gas price in wei'),
    nonce: z.number().optional().describe('Optional nonce'),
    chainId: z.number().optional().describe('Optional chain ID'),
  }),
  execute: async ({
    recipent,
    amount,
    gasLimit,
    gasPrice,
    nonce,
    chainId,
  }: {
    recipent: string;
    amount: string;
    gasLimit?: number;
    gasPrice?: string;
    nonce?: number;
    chainId?: number;
  }) => {
    try {
      if (!ethers.isAddress(recipent)) {
        throw new Error('Invalid from or to address');
      }

      // Fetch gas price using getFeeData
      const feeData = await provider.getFeeData();
      const resolvedGasPrice = gasPrice
        ? BigInt(gasPrice)
        : (feeData.gasPrice ?? BigInt(0));

      // Determine chainId if not provided
      const resolvedChainId = chainId ?? (await provider.getNetwork()).chainId;

      const tx: ethers.TransactionRequest = {
        to: recipent,
        value: ethers.parseEther(amount),
        gasLimit: gasLimit ? BigInt(gasLimit) : undefined,
        gasPrice: resolvedGasPrice,
        chainId: resolvedChainId,
        nonce: nonce,
      };

      const unsignedTx = ethers.Transaction.from(tx as any).unsignedSerialized;

      return {
        unsignedTx,
        txDetails: {
          recipent,
          amount,
          gasLimit: tx.gasLimit ? tx.gasLimit.toString() : null,
          gasPrice: tx.gasPrice ? tx.gasPrice.toString() : null,
          nonce: tx.nonce ?? null,
          chainId: tx.chainId ? Number(tx.chainId) : null,
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
