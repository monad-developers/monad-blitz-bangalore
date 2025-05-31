"use client";

import { mockBets, mockLiveScore } from "@/lib/mock-data";
import { Bet, LiveScore } from "@/lib/types";
import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useRef,
} from "react";
import { ethers } from "ethers";
import CricketBettingFactoryABI from "../constants/CricketBettingFactory.json";
import CricketBettingGameABI from "../constants/CricketBettingGame.json";
const factoryAddress = "0x847a4b1A928Ad60a6be4d2A4Db107dEA669cbacF";
const RPC_URL = "https://testnet-rpc.monad.xyz"
interface PriceData {
  [address: string]: number;
}

interface GlobalContextProps {
  loading: boolean;
  setLoading: (value: boolean) => void;

  liveScore: LiveScore | null;
  setLiveScore: React.Dispatch<React.SetStateAction<LiveScore | null>>;

  currentBet: Bet | null;
  setCurrentBet: React.Dispatch<React.SetStateAction<Bet | null>>;

  prevBets: Bet[];
  setPrevBets: React.Dispatch<React.SetStateAction<Bet[]>>;

  //   getFordefiWallets: () => Promise<void>;
  //   getBots: () => Promise<void>;
  //   getPollers: () => Promise<void>;
}

const GlobalContext = createContext<GlobalContextProps | undefined>(undefined);

interface GlobalProviderProps {
  children: ReactNode;
}

export const GlobalProvider: React.FC<GlobalProviderProps> = ({ children }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [liveScore, setLiveScore] = useState<LiveScore | null>(null);
  const [currentBet, setCurrentBet] = useState<Bet | null>(null);
  const [prevBets, setPrevBets] = useState<Bet[]>([]);
  const [events, setEvents] = useState<any[]>([]);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const factoryContract = new ethers.Contract(
      factoryAddress,
      CricketBettingFactoryABI.abi,
      provider
    );

    const onGameCreated = (
      gameAddress: any,
      teamA: any,
      teamB: any,
      matchId: any,
      timestamp: any
    ) => {
      console.log(
        "Game Created:",
        gameAddress,
        teamA,
        teamB,
        matchId,
        timestamp
      );
      setEvents((prev) => [
        ...prev,
        { type: "GameCreated", gameAddress, teamA, teamB, matchId, timestamp },
      ]);
      // Optional: Automatically add listener to the new game
      setupGameListeners(gameAddress);
    };
    factoryContract.on("GameCreated", onGameCreated);
    // Setup listeners for CricketBettingGame contract
    const setupGameListeners = (gameAddress: any) => {
      const gameContract = new ethers.Contract(
        gameAddress,
        CricketBettingGameABI.abi,
        provider
      );
      gameContract.on("BallOpened", (ballNumber, timestamp) => {
        console.log("Ball Opened:", ballNumber);
        setEvents((prev) => [
          ...prev,
          { type: "BallOpened", gameAddress, ballNumber, timestamp },
        ]);
      });
      gameContract.on(
        "WinningsDistributed",
        (ballNumber, outcome, totalPool, winnersCount, timestamp) => {
          console.log("Winnings Distributed:", ballNumber);
          setEvents((prev) => [
            ...prev,
            {
              type: "WinningsDistributed",
              gameAddress,
              ballNumber,
              outcome,
              totalPool,
              winnersCount,
              timestamp,
            },
          ]);
        }
      );
      gameContract.on("MatchCompleted", (matchId, timestamp) => {
        console.log("Match Completed:", matchId);
        setEvents((prev) => [
          ...prev,
          { type: "MatchCompleted", gameAddress, matchId, timestamp },
        ]);
      });
    };
    // Optional: Load existing active games from the factory and add listeners
    const loadActiveGames = async () => {
      console.log("getting games");
      try{
      const activeGames = await factoryContract.getActiveGames();
      console.log(activeGames);
      activeGames.forEach(setupGameListeners);
      }catch(e){
        console.log(e)
      }
    };
    loadActiveGames();
    // Cleanup listeners on unmount
    return () => {
      factoryContract.off("GameCreated", onGameCreated);
      // Note: You would also need to keep track of gameContract instances to remove their listeners
    };
  }, []);

  useEffect(() => {
    setLiveScore(mockLiveScore);
    setCurrentBet({
      id: "1234456",
      matchId: "match-001",
      question: "What will happen on the 3rd ball of the 16th over?",
      prediction: "",
      odds: 5,
      amount: 5,
      status: "pending",
      timestamp: new Date(),
    });
    setPrevBets(mockBets);
  }, []);

  return (
    <GlobalContext.Provider
      value={{
        loading,
        setLoading,
        liveScore,
        setLiveScore,
        currentBet,
        setCurrentBet,
        prevBets,
        setPrevBets,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

export const useGlobalContext = () => {
  const context = useContext(GlobalContext);
  if (!context) {
    throw new Error("useGlobalContext must be used within a GlobalProvider");
  }
  return context;
};
