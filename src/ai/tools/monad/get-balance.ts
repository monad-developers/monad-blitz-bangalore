import { z } from 'zod';
import { tool } from 'ai';
import { ethers } from 'ethers';
import { provider } from './utils';

export const getmonadbalance = tool({
  description:
    'Get the native token balances for a given wallet address on Monad testnet.',
  parameters: z.object({
    address: z.string().describe('The wallet address to fetch balances for'),
  }),
  execute: async ({ address }: { address: string }) => {
    try {
      const balance = await provider.getBalance(address);
      return ethers.formatEther(balance);
    } catch (err) {
      console.log(`Unable to fetch balance ${err}`);
      return {
        error: `Failed to fetch balance ${err}`,
      };
    }
  },
});
