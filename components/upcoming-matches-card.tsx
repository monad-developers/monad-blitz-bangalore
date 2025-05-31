import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export function UpcomingMatchesCard() {
  return (
    <div className="bg-[#0d1924] border border-[#1a2c3a] rounded-lg overflow-hidden">
      <div className="bg-[#162736] px-4 py-2 flex items-center justify-between">
        <h2 className="font-semibold">UPCOMING MATCHES</h2>
        <Badge variant="outline" className="bg-transparent text-gray-400 border-[#1a2c3a]">
          View All
        </Badge>
      </div>

      <div className="p-2">
        <MatchItem
          team1="India"
          team2="England"
          time="Today, 19:00"
          tournament="T20 World Cup"
          odds1={1.75}
          odds2={2.1}
        />

        <MatchItem
          team1="Australia"
          team2="South Africa"
          time="Tomorrow, 15:30"
          tournament="T20 World Cup"
          odds1={1.9}
          odds2={1.95}
        />

        <MatchItem team1="Mumbai" team2="Chennai" time="Jun 2, 19:30" tournament="IPL" odds1={2.05} odds2={1.85} />

        <MatchItem team1="Bangalore" team2="Punjab" time="Jun 3, 15:30" tournament="IPL" odds1={1.8} odds2={2.05} />

        <div className="pt-2 px-2">
          <Button variant="outline" className="w-full border-[#1a2c3a] hover:bg-[#162736] text-gray-400">
            Show More
          </Button>
        </div>
      </div>
    </div>
  )
}

interface MatchItemProps {
  team1: string
  team2: string
  time: string
  tournament: string
  odds1: number
  odds2: number
}

function MatchItem({ team1, team2, time, tournament, odds1, odds2 }: MatchItemProps) {
  return (
    <div className="p-2 border-b border-[#1a2c3a] last:border-0">
      <div className="flex justify-between items-center mb-1">
        <div className="text-sm text-gray-400">{time}</div>
        <div className="text-xs text-gray-500">{tournament}</div>
      </div>

      <div className="flex justify-between items-center">
        <div className="font-medium">
          {team1} vs {team2}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-7 border-[#1a2c3a] hover:bg-[#162736] hover:text-emerald-400"
          >
            {odds1}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-7 border-[#1a2c3a] hover:bg-[#162736] hover:text-emerald-400"
          >
            {odds2}
          </Button>
        </div>
      </div>
    </div>
  )
}
