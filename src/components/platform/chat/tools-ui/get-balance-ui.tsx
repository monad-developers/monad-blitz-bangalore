'use client';

import { motion } from 'framer-motion';
import { Card, CardContent } from '@/src/components/ui/card';
import { CoinsIcon } from 'lucide-react';

type MonadBalanceResult = {
  error?: string;
  // If no error, it's just a string balance
  [key: string]: any;
};

export function BalanceCheck({
  RecievedResult,
}: {
  RecievedResult?: MonadBalanceResult | string;
}) {
  // Handle error format
  if (
    typeof RecievedResult === 'object' &&
    RecievedResult !== null &&
    'error' in RecievedResult
  ) {
    return (
      <div className="text-sm text-red-400">
        ⚠️ Error fetching balance: {RecievedResult.error}
      </div>
    );
  }

  // Handle empty or unexpected result
  if (!RecievedResult || RecievedResult === '') {
    return (
      <div className="text-sm text-zinc-400">
        No balance found or invalid address.
      </div>
    );
  }

  // At this point, it's a valid balance string
  const balance = RecievedResult as string;

  return (
    <motion.div
      className="flex w-full flex-col gap-4 pt-2"
      initial={{ y: 5, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
    >
      <Card className="border border-zinc-700 bg-zinc-900 text-zinc-200">
        <CardContent className="flex flex-col gap-2 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-lg font-semibold">
              <CoinsIcon className="h-4 w-4 text-fuchsia-500" />
              Monad (TEST)
            </div>
            <div className="text-sm text-zinc-400">monad-testnet</div>
          </div>
          <div className="text-base">
            Balance:{' '}
            <span className="text-fuchsia-400">
              {parseFloat(balance).toFixed(6)} MON
            </span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
