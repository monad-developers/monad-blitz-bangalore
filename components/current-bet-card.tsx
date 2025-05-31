"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Clock, TrendingUp } from "lucide-react";
import { BallResult } from "@/lib/types";
import { useGlobalContext } from "@/context/GlobalContext";

export function CurrentBetCard() {
  const { currentBet, liveScore } = useGlobalContext();
  const [betAmount, setBetAmount] = useState("100");
  const [prediction, setPrediction] = useState<BallResult | null>(null);

  if (!currentBet || !liveScore)
    return (
      <div className="bg-[#0d1924] border border-[#1a2c3a] rounded-lg overflow-hidden">
        <div className="bg-[#162736] px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">No live bet</div>
        </div>
      </div>
    );

  return (
    <div className="bg-[#0d1924] border border-[#1a2c3a] rounded-lg overflow-hidden">
      <div className="bg-[#162736] px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-emerald-400" />
          <h2 className="font-semibold">LIVE BET</h2>
          <Badge
            variant="outline"
            className="bg-emerald-900/30 text-emerald-400 border-emerald-800"
          >
            OPEN
          </Badge>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Clock className="h-4 w-4 text-amber-400" />
          <span className="text-amber-400 font-medium">00:15</span>
          <span className="text-gray-400">remaining</span>
        </div>
      </div>

      <div className="p-4">
        <div className="mb-4">
          <h3 className="text-lg font-medium">{currentBet.question}</h3>
          <p className="text-sm text-gray-400">
            {liveScore.bowler.name} to {liveScore.batsmen[0].name} /{" "}
            {liveScore.batsmen[1].name} • Betting closes in 15 seconds
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
          <BetOption
            prediction={prediction}
            setPrediction={setPrediction}
            option="BOUNDARY"
            odds={5}
            text="Boundary (4 or 6)"
          />
          <BetOption
            prediction={prediction}
            setPrediction={setPrediction}
            option="WICKET"
            odds={5}
            text="Wicket"
          />
          <BetOption
            prediction={prediction}
            setPrediction={setPrediction}
            option="DOT"
            odds={5}
            text="Dot Ball"
          />
          <BetOption
            prediction={prediction}
            setPrediction={setPrediction}
            option="ONE_RUN"
            odds={5}
            text="1 Run"
          />
          <BetOption
            prediction={prediction}
            setPrediction={setPrediction}
            option="TWO_RUNS"
            odds={5}
            text="2 Runs"
          />
          <BetOption
            prediction={prediction}
            setPrediction={setPrediction}
            option="EXTRAS"
            odds={5}
            text="Wide or No Ball"
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 space-y-2">
            <label className="text-xs text-gray-400">Bet Amount</label>
            <div className="flex">
              <Input
                type="number"
                value={betAmount}
                onChange={(e) => setBetAmount(e.target.value)}
                className="rounded-r-none border-[#1a2c3a] bg-[#0a1218] focus-visible:ring-emerald-500"
              />
              <Button
                variant="outline"
                className="rounded-l-none border-[#1a2c3a] bg-[#162736]"
              >
                MAX
              </Button>
            </div>
          </div>

          <div className="flex-1 space-y-2">
            <label className="text-xs text-gray-400">Potential Winnings</label>
            <div className="h-10 flex items-center px-3 border border-[#1a2c3a] rounded-md bg-[#0a1218]">
              <span className="font-medium text-emerald-400">
                {(Number(betAmount) * 3.5).toFixed(2)}
              </span>
            </div>
          </div>

          <Button className="bg-emerald-600 hover:bg-emerald-700 text-white h-10 mt-auto">
            Place Bet
          </Button>
        </div>
      </div>
    </div>
  );
}

const BetOption = ({
  prediction,
  setPrediction,
  odds,
  option,
  text,
}: {
  prediction: BallResult | null;
  setPrediction: React.Dispatch<React.SetStateAction<BallResult | null>>;
  odds: number;
  option: BallResult;
  text: string;
}) => {
  return (
    <Button
      variant="outline"
      className={`border-[#1a2c3a] ${
        prediction === option ? "bg-[#162736]" : ""
      } hover:bg-[#162736] hover:text-emerald-400 h-auto py-3 flex flex-col items-center`}
      onClick={() => {
        setPrediction(option);
      }}
    >
      <div className="text-lg font-bold">{odds}</div>
      <div className="text-xs text-gray-400">{text}</div>
    </Button>
  );
};
