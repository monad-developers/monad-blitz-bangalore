export interface BallEvent {
  over: number;
  ball: number;
  result: BallResult;
  batsman: string;
  bowler: string;
  runs: number;
  timestamp: Date;
}

export type BallResult =
  | "DOT"
  | "ONE_RUN"
  | "TWO_RUNS"
  | "THREE_RUNS"
  | "FOUR"
  | "SIX"
  | "WICKET"
  | "WIDE"
  | "NO_BALL"
  | "BOUNDARY" | "EXTRAS";

export interface Bet {
  id: string;
  matchId: string;
  question: string;
  prediction: string;
  odds: number;
  amount: number;
  status: "pending" | "won" | "lost";
  result?: string;
  timestamp: Date;
}

export interface Match {
  id: string;
  team1: string;
  team2: string;
  tournament: string;
  startTime: Date;
  status: "upcoming" | "live" | "completed";
  odds1: number;
  odds2: number;
}

export interface LiveScore {
  matchId: string;
  team1: string;
  team2: string;
  team1Score: string;
  team2Score: string;
  currentInnings: 1 | 2;
  overs: string;
  requiredRuns?: number;
  requiredBalls?: number;
  currentRunRate: number;
  requiredRunRate?: number;
  batsmen: Batsman[];
  bowler: Bowler;
  currentOver: BallEvent[];
}

export interface Batsman {
  name: string;
  runs: number;
  balls: number;
  fours: number;
  sixes: number;
  strikeRate: number;
  onStrike: boolean;
}

export interface Bowler {
  name: string;
  overs: string;
  maidens: number;
  runs: number;
  wickets: number;
  economy: number;
}
