import type { Bet, LiveScore, Match } from "./types"

export const mockLiveScore: LiveScore = {
  matchId: "match-001",
  team1: "India",
  team2: "Australia",
  team1Score: "142/3",
  team2Score: "185/7",
  currentInnings: 1,
  overs: "15.2",
  requiredRuns: 44,
  requiredBalls: 28,
  currentRunRate: 9.26,
  requiredRunRate: 9.43,
  batsmen: [
    {
      name: "Virat Kohli",
      runs: 62,
      balls: 43,
      fours: 5,
      sixes: 2,
      strikeRate: 144.18,
      onStrike: true,
    },
    {
      name: "Hardik Pandya",
      runs: 24,
      balls: 18,
      fours: 2,
      sixes: 1,
      strikeRate: 133.33,
      onStrike: false,
    },
  ],
  bowler: {
    name: "Mitchell Starc",
    overs: "3.2",
    maidens: 0,
    runs: 28,
    wickets: 2,
    economy: 8.4,
  },
  currentOver: [
    {
      over: 16,
      ball: 1,
      result: "ONE_RUN",
      batsman: "Virat Kohli",
      bowler: "Mitchell Starc",
      runs: 1,
      timestamp: new Date(),
    },
    {
      over: 16,
      ball: 2,
      result: "FOUR",
      batsman: "Hardik Pandya",
      bowler: "Mitchell Starc",
      runs: 4,
      timestamp: new Date(),
    },
    {
      over: 16,
      ball: 3,
      result: "WICKET",
      batsman: "Hardik Pandya",
      bowler: "Mitchell Starc",
      runs: 0,
      timestamp: new Date(),
    },
    {
      over: 16,
      ball: 4,
      result: "DOT",
      batsman: "Virat Kohli",
      bowler: "Mitchell Starc",
      runs: 0,
      timestamp: new Date(),
    },
    {
      over: 16,
      ball: 5,
      result: "TWO_RUNS",
      batsman: "Virat Kohli",
      bowler: "Mitchell Starc",
      runs: 2,
      timestamp: new Date(),
    },
  ],
}

export const mockBets: Bet[] = [
  {
    id: "bet-001",
    matchId: "match-001",
    question: "What will happen on the 2nd ball of the 16th over?",
    prediction: "Dot Ball",
    odds: 1.85,
    amount: 100,
    status: "won",
    result: "Dot Ball",
    timestamp: new Date(),
  },
  {
    id: "bet-002",
    matchId: "match-001",
    question: "What will happen on the 5th ball of the 15th over?",
    prediction: "Boundary (4 or 6)",
    odds: 2.1,
    amount: 150,
    status: "lost",
    result: "1 Run",
    timestamp: new Date(),
  },
  {
    id: "bet-003",
    matchId: "match-001",
    question: "What will happen on the 3rd ball of the 15th over?",
    prediction: "1 Run",
    odds: 2.25,
    amount: 100,
    status: "won",
    result: "1 Run",
    timestamp: new Date(),
  },
  {
    id: "bet-004",
    matchId: "match-001",
    question: "What will happen on the 1st ball of the 15th over?",
    prediction: "Wicket",
    odds: 3.5,
    amount: 50,
    status: "pending",
    timestamp: new Date(),
  },
]

export const mockMatches: Match[] = [
  {
    id: "match-002",
    team1: "India",
    team2: "England",
    tournament: "T20 World Cup",
    startTime: new Date(Date.now() + 3600000 * 5), // 5 hours from now
    status: "upcoming",
    odds1: 1.75,
    odds2: 2.1,
  },
  {
    id: "match-003",
    team1: "Australia",
    team2: "South Africa",
    tournament: "T20 World Cup",
    startTime: new Date(Date.now() + 3600000 * 24), // 24 hours from now
    status: "upcoming",
    odds1: 1.9,
    odds2: 1.95,
  },
  {
    id: "match-004",
    team1: "Mumbai",
    team2: "Chennai",
    tournament: "IPL",
    startTime: new Date(Date.now() + 3600000 * 48), // 48 hours from now
    status: "upcoming",
    odds1: 2.05,
    odds2: 1.85,
  },
  {
    id: "match-005",
    team1: "Bangalore",
    team2: "Punjab",
    tournament: "IPL",
    startTime: new Date(Date.now() + 3600000 * 72), // 72 hours from now
    status: "upcoming",
    odds1: 1.8,
    odds2: 2.05,
  },
]

// Additional mock data for My Bets page
export const mockUserBets = [
  {
    id: "user-bet-001",
    match: "India vs Australia",
    date: "Today, 15:30",
    question: "What will happen on the 2nd ball of the 16th over?",
    prediction: "Dot Ball",
    odds: 1.85,
    amount: 100,
    status: "won",
    result: "Dot Ball",
  },
  {
    id: "user-bet-002",
    match: "India vs Australia",
    date: "Today, 15:25",
    question: "What will happen on the 5th ball of the 15th over?",
    prediction: "Boundary (4 or 6)",
    odds: 2.1,
    amount: 150,
    status: "lost",
    result: "1 Run",
  },
  {
    id: "user-bet-003",
    match: "India vs Australia",
    date: "Today, 15:20",
    question: "What will happen on the 3rd ball of the 15th over?",
    prediction: "1 Run",
    odds: 2.25,
    amount: 100,
    status: "won",
    result: "1 Run",
  },
  {
    id: "user-bet-004",
    match: "India vs Australia",
    date: "Today, 15:15",
    question: "What will happen on the 1st ball of the 15th over?",
    prediction: "Wicket",
    odds: 3.5,
    amount: 50,
    status: "pending",
  },
  {
    id: "user-bet-005",
    match: "England vs South Africa",
    date: "Yesterday, 19:45",
    question: "What will happen on the 4th ball of the 18th over?",
    prediction: "2 Runs",
    odds: 3.0,
    amount: 75,
    status: "won",
    result: "2 Runs",
  },
  {
    id: "user-bet-006",
    match: "England vs South Africa",
    date: "Yesterday, 19:30",
    question: "What will happen on the 2nd ball of the 17th over?",
    prediction: "Wicket",
    odds: 3.5,
    amount: 100,
    status: "lost",
    result: "Dot Ball",
  },
]

// Mock transactions for My Orders page
export const mockTransactions = [
  {
    id: "tx-001",
    date: "May 31, 2025 14:32",
    type: "deposit",
    amount: 1000,
    status: "completed",
  },
  {
    id: "tx-002",
    date: "May 30, 2025 18:45",
    type: "withdrawal",
    amount: 500,
    status: "completed",
  },
  {
    id: "tx-003",
    date: "May 29, 2025 12:15",
    type: "deposit",
    amount: 2000,
    status: "completed",
  },
  {
    id: "tx-004",
    date: "May 28, 2025 09:30",
    type: "withdrawal",
    amount: 1000,
    status: "completed",
  },
  {
    id: "tx-005",
    date: "May 27, 2025 16:20",
    type: "deposit",
    amount: 3000,
    status: "completed",
  },
  {
    id: "tx-006",
    date: "May 26, 2025 11:05",
    type: "withdrawal",
    amount: 1000,
    status: "pending",
  },
  {
    id: "tx-007",
    date: "May 25, 2025 14:50",
    type: "deposit",
    amount: 4000,
    status: "completed",
  },
]

// Mock leaderboard data
export const mockLeaderboard = [
  {
    id: "user-001",
    username: "CricketKing",
    memberSince: "Jan 2024",
    profit: 12580.5,
    winRate: 68,
    totalBets: 245,
    trend: "up",
  },
  {
    id: "user-002",
    username: "BettingPro",
    memberSince: "Mar 2024",
    profit: 9870.25,
    winRate: 65,
    totalBets: 198,
    trend: "up",
  },
  {
    id: "user-003",
    username: "LuckyStriker",
    memberSince: "Feb 2024",
    profit: 7650.75,
    winRate: 62,
    totalBets: 176,
    trend: "down",
  },
  {
    id: "user-004",
    username: "CricketFan",
    memberSince: "Apr 2024",
    profit: 5430.0,
    winRate: 59,
    totalBets: 145,
    trend: "up",
  },
  {
    id: "user-005",
    username: "BetMaster",
    memberSince: "Jan 2024",
    profit: 4980.5,
    winRate: 57,
    totalBets: 132,
    trend: "down",
  },
  {
    id: "user-006",
    username: "SportsBaron",
    memberSince: "Mar 2024",
    profit: 3750.25,
    winRate: 55,
    totalBets: 118,
    trend: "up",
  },
  {
    id: "user-007",
    username: "WicketWinner",
    memberSince: "Feb 2024",
    profit: 2890.75,
    winRate: 53,
    totalBets: 105,
    trend: "up",
  },
  {
    id: "user-008",
    username: "BoundaryHunter",
    memberSince: "Apr 2024",
    profit: 2340.0,
    winRate: 51,
    totalBets: 98,
    trend: "down",
  },
  {
    id: "user-009",
    username: "SixMachine",
    memberSince: "Jan 2024",
    profit: 1980.5,
    winRate: 49,
    totalBets: 87,
    trend: "up",
  },
  {
    id: "user-010",
    username: "OddsCalculator",
    memberSince: "Mar 2024",
    profit: 1650.25,
    winRate: 48,
    totalBets: 76,
    trend: "down",
  },
]

// Names for generating random bets
const usernames = [
  "CricketFan22",
  "BetMaster",
  "IPLLover",
  "WicketWizard",
  "SixHitter",
  "BoundaryKing",
  "T20Expert",
  "CricketPro",
  "BettingGuru",
  "MatchPredictor",
  "CricketNerd",
  "BetHunter",
  "GameChanger",
  "PitchMaster",
  "RunMachine",
]

const teams = [
  "India",
  "Australia",
  "England",
  "South Africa",
  "New Zealand",
  "West Indies",
  "Pakistan",
  "Sri Lanka",
  "Bangladesh",
  "Afghanistan",
]

const predictions = ["Boundary (4 or 6)", "Wicket", "Dot Ball", "1 Run", "2 Runs", "3+ Runs"]

const matches = [
  "India vs Australia",
  "England vs South Africa",
  "Pakistan vs New Zealand",
  "Sri Lanka vs West Indies",
  "Bangladesh vs Afghanistan",
]

// Function to generate a random bet for the live feed
export function generateMockBet() {
  const username = usernames[Math.floor(Math.random() * usernames.length)]
  const match = matches[Math.floor(Math.random() * matches.length)]
  const prediction = predictions[Math.floor(Math.random() * predictions.length)]
  const amount = Math.floor(Math.random() * 500) + 50
  const odds = (Math.random() * 3 + 1.5).toFixed(2)

  return {
    user: username,
    match: match,
    prediction: prediction,
    amount: amount,
    odds: Number.parseFloat(odds),
  }
}
