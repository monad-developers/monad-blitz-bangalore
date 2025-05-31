import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./GameLobby.css";

import { useGameContract, useWallet } from "../context/WalletContext";
import { ethers } from "ethers";

// Define a type for game data based on your contract's getGameInfo output
interface Game {
  gameId: number;
  player1: string;
  player2: string;
  stakeAmount: string; // Use string to handle large numbers
  textToType: string;
  startTime: number;
  endTime: number;
  gameActive: boolean;
  gameFinished: boolean;
  winner: string;
}

const GameLobby: React.FC = () => {
  const gameContract = useGameContract();
  const { address } = useWallet(); // Get user's address
  const [availableGames, setAvailableGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isJoining, setIsJoining] = useState<number | null>(null); // Track which game is being joined
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Function to fetch games from the contract
  const fetchGames = async () => {
    if (!gameContract) {
      setIsLoading(false);
      setError("Wallet not connected or contract not available.");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const totalGamesBigInt = await gameContract.getTotalGames();
      // Convert BigInt to number for comparison and iteration
      const totalGames = Number(totalGamesBigInt); // Correct conversion for native BigInt

      const games: Game[] = [];
      console.log("Number of games (gameCounter): " + totalGames);
      // Fetch details for a reasonable number of recent games, e.g., last 20
      // We need to iterate from the most recently created game ID downwards
      const gamesToFetch = Math.min(totalGames, 20);
      console.log("Games to attempt fetching: " + gamesToFetch);

      // Iterate backwards from the highest possible game ID (totalGames - 1) down to 0
      // Limit the iteration to the number of games we want to fetch
      for (let i = 0; i < gamesToFetch; i++) {
        const gameId = totalGames - 1 - i; // Calculate the game ID correctly

        console.log(`Attempting to fetch game ID: ${gameId}`); // Log the game ID being fetched

        // Check if gameId is valid (>= 0) - contract uses 0-based or 1-based, but counter is total
        // The gameExists check in contract should handle 0 if applicable
        if (gameId >= 0) {
          // Ensure we don't go below 0
          try {
            const gameInfo = await gameContract.getGameInfo(gameId);
            // Convert BigInt stakeAmount to string for display
            const stakeAmountFormatted = ethers.formatEther(
              gameInfo.stakeAmount
            );

            // Only add games that are not finished and are waiting for a second player
            // Also exclude games where the current user is player1 (they are in GameRoom)
            if (
              !gameInfo.gameFinished &&
              gameInfo.player2 === ethers.ZeroAddress &&
              gameInfo.player1.toLowerCase() !== address?.toLowerCase()
            ) {
              games.push({
                gameId: gameId,
                player1: gameInfo.player1, // Assuming addresses are strings
                player2: gameInfo.player2, // Assuming addresses are strings
                stakeAmount: stakeAmountFormatted,
                textToType: gameInfo.textToType, // Consider truncating for lobby display
                startTime: Number(gameInfo.startTime), // Convert BigInt to number
                endTime: Number(gameInfo.endTime), // Convert BigInt to number
                gameActive: gameInfo.gameActive,
                gameFinished: gameInfo.gameFinished,
                winner: gameInfo.winner, // Assuming winner address is a string
              });
            }
          } catch (innerError: any) {
            console.error(
              `Error fetching game ${gameId}: ${
                innerError.reason || innerError.message
              }`,
              innerError
            );
            // Continue fetching other games even if one fails
          }
        }
      }
      // Sort games by ID in ascending order before setting state to show oldest first
      games.sort((a, b) => a.gameId - b.gameId);
      setAvailableGames(games);
    } catch (err: any) {
      console.error("Error fetching games overall:", err);
      setError(`Failed to fetch games: ${err.reason || err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch when component mounts or gameContract is available
  useEffect(() => {
    fetchGames();
  }, [gameContract, address]); // Also refetch if address changes (user connects/disconnects)

  // Polling effect to refresh game list periodically
  useEffect(() => {
    let pollingInterval: NodeJS.Timeout | null = null;

    if (gameContract) {
      // Only poll if contract is available
      pollingInterval = setInterval(() => {
        console.log("Polling for new games...");
        fetchGames();
      }, 15000); // Poll every 15 seconds
    }

    // Cleanup function to clear the interval
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [gameContract, address]); // Re-establish polling if contract or address changes

  const handleJoinGame = async (gameId: number, stakeAmount: string) => {
    if (!gameContract) {
      alert("Wallet not connected or contract not available.");
      return;
    }
    if (!address) {
      alert("Please connect your wallet.");
      return;
    }

    setIsJoining(gameId);
    try {
      const amountInWei = ethers.parseEther(stakeAmount);
      const tx = await gameContract.joinGame(gameId, { value: amountInWei });
      await tx.wait();

      alert(`Successfully joined game ${gameId}!`);
      navigate(`/game/${gameId}`);
    } catch (error: any) {
      console.error("Error joining game:", error);
      alert(`Failed to join game: ${error.reason || error.message}`);
    } finally {
      setIsJoining(null);
    }
  };

  return (
    <div className="game-lobby">
      <div className="stars"></div>
      <div className="floating-orbs">
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
        <div className="orb orb-3"></div>
      </div>

      <h1 className="main-title">
        <span className="title-text">GAME LOBBY</span>
        <div className="title-glow"></div>
      </h1>

      {/* Create New Game Section */}
      <section className="section create-section">
        <div className="section-header">
          <h2 className="section-title">⚡ Create New Game</h2>
          <div className="pulse-ring"></div>
        </div>
        <p className="section-desc">
          Ready to challenge someone? Create a new game and dominate the
          battlefield!
        </p>
        <Link to="/create" className="btn btn-primary">
          <span className="btn-text">🎮 Create Game</span>
          <div className="btn-shine"></div>
        </Link>
      </section>

      {/* Available Games Section */}
      <section className="section games-section">
        <div className="section-header">
          <h2 className="section-title">🎯 Available Games</h2>
          <div className="section-counter">{availableGames.length} Games</div>
        </div>
        {isLoading && (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading epic battles...</p>
          </div>
        )}
        {error && <p className="error">⚠️ {error}</p>}
        {!isLoading && availableGames.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">🎮</div>
            <p>No battles available. Be the first to create one!</p>
          </div>
        )}

        {!isLoading && availableGames.length > 0 && (
          <div className="games-grid">
            {availableGames.map((game, index) => (
              <div
                key={game.gameId}
                className="game-card"
                style={{ "--delay": `${index * 100}ms` } as React.CSSProperties}
              >
                <div className="card-glow"></div>
                <div className="card-header">
                  <h3 className="game-title">
                    <span className="game-id">#{game.gameId}</span>
                    <span className="battle-text">BATTLE</span>
                  </h3>
                  <div className="status-indicator active"></div>
                </div>

                <div className="stake-display">
                  <div className="stake-icon">💰</div>
                  <div className="stake-info">
                    <span className="stake-label">Prize Pool</span>
                    <span className="stake-amount">{game.stakeAmount} MON</span>
                  </div>
                </div>

                <div className="game-preview">
                  <span className="preview-label">Challenge:</span>
                  <p className="game-text">
                    {game.textToType.substring(0, 50)}...
                  </p>
                </div>

                <div className="players-info">
                  <div className="player-slot filled">
                    <div className="player-avatar"></div>
                    <span>{game.player1.slice(0, 6)}...</span>
                  </div>
                  <div className="vs-indicator">VS</div>
                  <div
                    className={`player-slot ${
                      game.player2 !== ethers.ZeroAddress ? "filled" : "waiting"
                    }`}
                  >
                    <div className="player-avatar"></div>
                    <span>
                      {game.player2 !== ethers.ZeroAddress
                        ? game.player2.slice(0, 6) + "..."
                        : "YOU?"}
                    </span>
                  </div>
                </div>

                <div className="card-actions">
                  {game.player2 === ethers.ZeroAddress &&
                    address?.toLowerCase() !== game.player1.toLowerCase() && (
                      <button
                        onClick={() =>
                          handleJoinGame(game.gameId, game.stakeAmount)
                        }
                        className={`btn ${
                          isJoining === game.gameId
                            ? "btn-disabled"
                            : "btn-success"
                        }`}
                        disabled={isJoining === game.gameId}
                      >
                        <span className="btn-text">
                          {isJoining === game.gameId
                            ? "🔄 Joining..."
                            : "⚔️ Join Battle"}
                        </span>
                        <div className="btn-shine"></div>
                      </button>
                    )}
                  {(game.player2 !== ethers.ZeroAddress ||
                    (game.player1.toLowerCase() === address?.toLowerCase() &&
                      game.player2 === ethers.ZeroAddress)) && (
                    <Link
                      to={`/game/${game.gameId}`}
                      className="btn btn-secondary"
                    >
                      <span className="btn-text">👁️ View Battle</span>
                      <div className="btn-shine"></div>
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* My Active Games Section */}
      <section className="section active-games-section">
        <div className="section-header">
          <h2 className="section-title">🏆 My Active Games</h2>
          <div className="coming-soon-badge">Coming Soon</div>
        </div>
        <div className="placeholder-content">
          <div className="placeholder-icon">⚡</div>
          <p>Your epic battles will appear here once implemented.</p>
          <p className="sub-text">
            Track your victories and claim your rewards!
          </p>
        </div>
      </section>
    </div>
  );
};

export default GameLobby;
