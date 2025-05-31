"use client";

import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useGlobalContext } from "@/context/GlobalContext";
import { BallEvent } from "@/lib/types";
import { BirdIcon as Cricket } from "lucide-react";

export function LiveScoreCard() {
  const { liveScore } = useGlobalContext();

  if (!liveScore)
    return (
      <div className="bg-[#0d1924] border border-[#1a2c3a] rounded-lg overflow-hidden">
        <div className="bg-[#162736] px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">No live matches</div>
        </div>
      </div>
    );

  return (
    <div className="bg-[#0d1924] border border-[#1a2c3a] rounded-lg overflow-hidden">
      <div className="bg-[#162736] px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Cricket className="h-5 w-5 text-emerald-400" />
          <h2 className="font-semibold">
            LIVE: {liveScore.team1} vs {liveScore.team2}
          </h2>
          <Badge
            variant="outline"
            className="bg-red-900/30 text-red-400 border-red-800"
          >
            LIVE
          </Badge>
        </div>
        <div className="text-sm text-gray-400">T20 World Cup • Super 8</div>
      </div>

      <div className="p-4">
        <div className="flex justify-between mb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-xl">India 142/3</span>
              <span className="text-gray-400">(15.2 overs)</span>
            </div>
            <div className="text-sm text-gray-400">Target: 186</div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-400">Required</div>
            <div className="font-bold text-xl">44 runs from 28 balls</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-400">BATSMEN</h3>
            <div className="flex justify-between items-center">
              <div>
                <div className="font-medium">
                  {liveScore.batsmen[0].name}
                  {liveScore.batsmen[0].onStrike ? "*" : ""}
                </div>
                <div className="text-sm text-emerald-400">
                  {liveScore.batsmen[0].runs} ({liveScore.batsmen[0].balls})
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-400">S/R</div>
                <div>{liveScore.batsmen[1].strikeRate}</div>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <div>
                <div className="font-medium">
                  {liveScore.batsmen[1].name}
                  {liveScore.batsmen[1].onStrike ? "*" : ""}
                </div>
                <div className="text-sm text-emerald-400">
                  {liveScore.batsmen[1].runs} ({liveScore.batsmen[1].balls})
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-400">S/R</div>
                <div>{liveScore.batsmen[1].strikeRate}</div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-400">BOWLER</h3>
            <div>
              <div className="font-medium">{liveScore.bowler.name}</div>
              <div className="text-sm text-emerald-400">
                {liveScore.bowler.wickets}/{liveScore.bowler.runs} (
                {liveScore.bowler.overs} overs)
              </div>
            </div>

            <h3 className="text-sm font-medium text-gray-400 mt-4">
              CURRENT OVER
            </h3>
            <div className="flex gap-1">
              {liveScore.currentOver.map((ball) => (
                <BallResult event={ball} />
              ))}
              {Array.from({ length: 6 - liveScore.currentOver.length }).map(
                (i) => (
                  <div className="w-8 h-8 flex items-center justify-center rounded bg-gray-800/30 text-gray-500">
                    •
                  </div>
                )
              )}
            </div>
          </div>
        </div>

        <div className="mt-4">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>India</span>
            <span>CRR: {liveScore.currentRunRate}</span>
            <span>REQ: {liveScore.requiredRunRate}</span>
          </div>
          <Progress
            value={(liveScore.currentOver.length / 6) * 100}
            className="h-1.5 bg-gray-800"
          >
            <div className="h-full bg-emerald-500 rounded-full" />
          </Progress>
        </div>
      </div>
    </div>
  );
}

const BallResult = ({ event }: { event: BallEvent }) => {
  return (
    <div
      className={`w-8 h-8 flex items-center justify-center rounded bg-[#162736] ${
        event.result === "WICKET" ? "text-emerald-400" : "text-white"
      }`}
    >
      {event.result === "WICKET" ? "W" : event.runs}
    </div>
  );
};
