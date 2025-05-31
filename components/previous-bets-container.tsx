"use client";

import { Badge } from "@/components/ui/badge";
import { useGlobalContext } from "@/context/GlobalContext";
import { CheckCircle2, Clock, XCircle } from "lucide-react";

export function PreviousBetsContainer() {
  const { prevBets } = useGlobalContext();

  if (!prevBets.length)
    return (
      <div className="bg-[#0d1924] border border-[#1a2c3a] rounded-lg overflow-hidden">
        <div className="bg-[#162736] px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">No previous bets</div>
        </div>
      </div>
    );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Previous Bets</h2>
        <Badge
          variant="outline"
          className="bg-[#162736] text-gray-400 border-[#1a2c3a]"
        >
          View All
        </Badge>
      </div>

      <div className="space-y-3">
        {prevBets.map((bet) => (
          <BetCard
            question={bet.question}
            prediction={bet.prediction}
            odds={bet.odds}
            amount={bet.amount}
            status={
              bet.result
                ? bet.prediction === bet.result
                  ? "won"
                  : "lost"
                : "pending"
            }
            result={bet.result}
          />
        ))}
      </div>
    </div>
  );
}

interface BetCardProps {
  question: string;
  prediction: string;
  odds: number;
  amount: number;
  status: "won" | "lost" | "pending";
  result?: string;
}

function BetCard({
  question,
  prediction,
  odds,
  amount,
  status,
  result,
}: BetCardProps) {
  return (
    <div className="bg-[#0d1924] border border-[#1a2c3a] rounded-lg overflow-hidden">
      <div className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="font-medium">{question}</h3>
            <p className="text-sm text-gray-400">
              Your prediction: <span className="text-white">{prediction}</span>
            </p>
          </div>

          {status === "won" && (
            <Badge className="bg-emerald-900/30 text-emerald-400 border-emerald-800 flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" />
              WON
            </Badge>
          )}

          {status === "lost" && (
            <Badge className="bg-red-900/30 text-red-400 border-red-800 flex items-center gap-1">
              <XCircle className="h-3 w-3" />
              LOST
            </Badge>
          )}

          {status === "pending" && (
            <Badge className="bg-amber-900/30 text-amber-400 border-amber-800 flex items-center gap-1">
              <Clock className="h-3 w-3" />
              PENDING
            </Badge>
          )}
        </div>

        <div className="flex justify-between text-sm">
          <div>
            <div className="text-gray-400">Bet Amount</div>
            <div className="font-medium">{amount} coins</div>
          </div>

          <div>
            <div className="text-gray-400">Odds</div>
            <div className="font-medium">{odds.toFixed(2)}x</div>
          </div>

          <div>
            <div className="text-gray-400">
              {status === "pending" ? "Potential Win" : "Result"}
            </div>
            {status === "pending" ? (
              <div className="font-medium text-emerald-400">
                {(amount * odds).toFixed(2)}
              </div>
            ) : (
              <div className="font-medium">{result}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
