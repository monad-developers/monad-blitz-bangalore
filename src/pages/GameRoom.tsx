import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useGameContract, useWallet } from "../context/WalletContext";
import { ethers } from "ethers";
import "./GameRoom.css";

type GameState = "waiting" | "active" | "finished";

interface GameInfo {
  player1: string;
  player2: string;
  stakeAmount: bigint;
  textToType: string;
  startTime: bigint;
  endTime: bigint;
  gameActive: boolean;
  gameFinished: boolean;
  winner: string; // This will be address(0) for a draw, or winner's address
  player1Ready: boolean; // Not used in contract, but in your frontend initial state
  player2Ready: boolean; // Not used in contract, but in your frontend initial state
}

const GameRoom: React.FC = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const gameContract = useGameContract();
  const { address } = useWallet();
  const navigate = useNavigate();

  const [gameState, setGameState] = useState<GameState>("waiting");
  const [gameInfo, setGameInfo] = useState<GameInfo | null>(null);
  const [gameText, setGameText] = useState<string>("");
  const [userText, setUserText] = useState<string>("");
  const [currentWordIndex, setCurrentWordIndex] = useState<number>(0);
  const [words, setWords] = useState<string[]>([]);
  const [timer, setTimer] = useState<number>(60);
  const [isActive, setIsActive] = useState<boolean>(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // State for WPM and accuracy calculation and results
  const [startTime, setStartTime] = useState<number | null>(null);
  const [correctCharacters, setCorrectCharacters] = useState<number>(0);
  const [totalCharacters, setTotalCharacters] = useState<number>(0);
  const [wpm, setWpm] = useState<number>(0);
  const [accuracy, setAccuracy] = useState<number>(100);
  const [scoreSubmitted, setScoreSubmitted] = useState<boolean>(false);
  const [gameResults, setGameResults] = useState<{
    winner: string;
    prize: string;
    player1Score: number;
    player2Score: number;
  } | null>(null);
  const [isFetchingResults, setIsFetchingResults] = useState<boolean>(false);
  const [isCancelling, setIsCancelling] = useState<boolean>(false);
  const [opponentScore, setOpponentScore] = useState<number>(0);

  // New gamified states
  const [combo, setCombo] = useState<number>(0);
  const [maxCombo, setMaxCombo] = useState<number>(0);
  // const [streak, setStreak] = useState<number>(0); // Streak not currently used in rendering
  // const [powerUpActive, setPowerUpActive] = useState<boolean>(false); // Not used

  // Memoize handleSubmitScore to prevent unnecessary re-renders
  const handleSubmitScore = useCallback(async () => {
    if (!gameContract || !gameId || !address || scoreSubmitted) return;

    setIsActive(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    try {
      const id = parseInt(gameId);
      if (isNaN(id)) {
        console.error("Invalid game ID for score submission");
        alert("Failed to submit score: Invalid game ID.");
        return;
      }

      const score = currentWordIndex;
      console.log(`Submitting score ${score} for game ${id}...`);

      // It's possible the game finished just before submission, check
      const currentContractGameInfo = await gameContract.getGameInfo(id);
      if (currentContractGameInfo.gameFinished) {
        console.log("Game already finished on contract. Not submitting score.");
        setScoreSubmitted(true);
        setGameState("finished");
        return;
      }

      const tx = await gameContract.submitScore(id, score);
      await tx.wait();

      console.log("Score submitted successfully!");
      setScoreSubmitted(true);
      // Do NOT set game state to finished here, let the timer/finishGame handle it
    } catch (error: any) {
      console.error("Error submitting score:", error);
      alert(`Failed to submit score: ${error.reason || error.message}`);
      // Even on error, we should probably still try to move to finished state
      // to let finishGame handle it.
    }
  }, [gameContract, gameId, address, scoreSubmitted, currentWordIndex]);

  const handleCancelGame = async () => {
    if (
      !gameContract ||
      !gameId ||
      !address ||
      gameState !== "waiting" ||
      !gameInfo
    )
      return;

    if (gameInfo.player1.toLowerCase() !== address.toLowerCase()) {
      alert("Only the game creator can cancel the game.");
      return;
    }

    setIsCancelling(true);
    try {
      const id = parseInt(gameId);
      if (isNaN(id)) {
        console.error("Invalid game ID for cancellation");
        alert("Failed to cancel game: Invalid game ID.");
        return;
      }

      console.log(`Cancelling game ${id}...`);
      const tx = await gameContract.cancelGame(id);
      await tx.wait();

      console.log("Game cancelled successfully!");
      alert("Game cancelled.");
      navigate("/lobby");
    } catch (error: any) {
      console.error("Error cancelling game:", error);
      alert(`Failed to cancel game: ${error.reason || error.message}`);
    } finally {
      setIsCancelling(false);
    }
  };

  // Fetch game details when component mounts or gameContract is available
  useEffect(() => {
    const fetchGameDetails = async () => {
      if (!gameContract || !gameId) return;

      try {
        const id = parseInt(gameId);
        if (isNaN(id)) {
          console.error("Invalid game ID");
          return;
        }

        const fetchedGameInfo: GameInfo = await gameContract.getGameInfo(id);
        setGameInfo(fetchedGameInfo);
        setGameText(fetchedGameInfo.textToType);
        setWords(fetchedGameInfo.textToType.split(" "));

        if (fetchedGameInfo.gameFinished) {
          setGameState("finished");
        } else if (fetchedGameInfo.gameActive) {
          const now = Math.floor(Date.now() / 1000);
          const GAME_DURATION_CONTRACT = 60; // Hardcoded from contract, ensure consistency
          let remaining = GAME_DURATION_CONTRACT;

          if (Number(fetchedGameInfo.startTime) > 0) {
            const elapsed = now - Number(fetchedGameInfo.startTime);
            remaining = GAME_DURATION_CONTRACT - elapsed;
          }

          // Set timer, but cap it at 0 to avoid negative
          setTimer(Math.max(0, remaining));

          // If remaining is <= 0, game should be considered active for a moment, then finish
          if (remaining <= 0) {
            setGameState("finished");
            setIsActive(false); // Game time is effectively over
          } else {
            setGameState("active");
            setIsActive(true);
            setStartTime(Number(fetchedGameInfo.startTime)); // Start WPM calc from actual game start
          }
        } else if (fetchedGameInfo.player2 === ethers.ZeroAddress) {
          setGameState("waiting");
        } else {
          // This state should only be briefly seen if player2 joins and gameActive is not true yet
          setGameState("waiting"); // Could also be "readying" state if contract had playerReady flags
        }
      } catch (error) {
        console.error("Error fetching game details:", error);
      }
    };

    fetchGameDetails();
  }, [gameId, gameContract]);

  // Polling for game state updates when waiting
  useEffect(() => {
    let pollingInterval: NodeJS.Timeout | null = null;

    if (gameState === "waiting" && gameContract && gameId) {
      pollingInterval = setInterval(async () => {
        try {
          const id = parseInt(gameId);
          const fetchedGameInfo: GameInfo = await gameContract.getGameInfo(id);
          setGameInfo(fetchedGameInfo);

          if (fetchedGameInfo.gameActive) {
            setGameState("active");
            setIsActive(true);
            setStartTime(
              Number(fetchedGameInfo.startTime) > 0
                ? Number(fetchedGameInfo.startTime)
                : Date.now() / 1000 // Fallback, but contract should set this
            );
            if (pollingInterval) clearInterval(pollingInterval);
          } else if (fetchedGameInfo.gameFinished) {
            setGameState("finished");
            if (pollingInterval) clearInterval(pollingInterval);
          }
        } catch (error) {
          console.error("Error polling for game updates:", error);
        }
      }, 5000);
    }

    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [gameState, gameContract, gameId]);

  // Polling for opponent's score during active game
  useEffect(() => {
    let scorePollingInterval: NodeJS.Timeout | null = null;

    if (
      gameState === "active" &&
      gameContract &&
      gameId &&
      address &&
      gameInfo?.gameActive // Only poll if game is actually active on chain
    ) {
      const opponentAddress =
        gameInfo.player1.toLowerCase() === address.toLowerCase()
          ? gameInfo.player2
          : gameInfo.player1;

      if (opponentAddress && opponentAddress !== ethers.ZeroAddress) {
        const currentContract = gameContract;
        const currentId = parseInt(gameId);
        const currentOpponentAddress = opponentAddress;

        scorePollingInterval = setInterval(async () => {
          try {
            if (gameState !== "active") {
              return; // Stop polling if game state changes
            }

            // Check if game is finished before polling score, to avoid unnecessary calls
            const info = await currentContract.getGameInfo(currentId);
            if (info.gameFinished) {
              setGameState("finished");
              if (scorePollingInterval) clearInterval(scorePollingInterval);

              return;
            }

            const opponentScore = await currentContract.getPlayerScore(
              BigInt(currentId),
              currentOpponentAddress
            );
            setOpponentScore(Number(opponentScore));
          } catch (error) {
            console.error("Error polling for opponent score:", error);
          }
        }, 2000);
      }
    }

    return () => {
      if (scorePollingInterval) {
        clearInterval(scorePollingInterval);
      }
    };
  }, [gameState, gameContract, gameId, address, gameInfo?.gameActive]);

  // FIXED: Timer logic with proper score submission order
  useEffect(() => {
    if (isActive && !scoreSubmitted) {
      intervalRef.current = setInterval(() => {
        setTimer((prevTimer) => {
          if (prevTimer <= 1) {
            setIsActive(false);
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
            }

            // Ensure score submission happens first
            if (!scoreSubmitted) {
              handleSubmitScore();
            } else {
              setGameState("finished");
            }

            return 0;
          }
          return prevTimer - 1;
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, scoreSubmitted, handleSubmitScore]);

  // WPM and accuracy calculation
  useEffect(() => {
    if (isActive && startTime !== null) {
      const calculationInterval = setInterval(() => {
        const elapsedSeconds = Date.now() / 1000 - startTime;
        if (elapsedSeconds > 0) {
          const calculatedWpm = (correctCharacters / 5 / elapsedSeconds) * 60;
          setWpm(Math.round(calculatedWpm));
          const calculatedAccuracy =
            totalCharacters > 0
              ? (correctCharacters / totalCharacters) * 100
              : 100;
          setAccuracy(Math.round(calculatedAccuracy));
        }
      }, 1000);

      return () => clearInterval(calculationInterval);
    }
  }, [isActive, startTime, correctCharacters, totalCharacters]);

  // FIXED: Fetch game results with proper debugging and address case handling
  useEffect(() => {
    const fetchGameResults = async () => {
      if (gameState === "finished" && gameContract && gameId) {
        setIsFetchingResults(true);
        try {
          const id = parseInt(gameId);
          const fetchedGameInfo = await gameContract.getGameInfo(id);

          if (!fetchedGameInfo) {
            console.error("Game info not found for results fetching.");
            setGameResults({
              winner: "Unknown",
              prize: "Unknown",
              player1Score: 0,
              player2Score: 0,
            });
            setIsFetchingResults(false);
            return;
          }

          const player1Score = await gameContract.getPlayerScore(
            BigInt(id),
            fetchedGameInfo.player1
          );
          const player2Score = await gameContract.getPlayerScore(
            BigInt(id),
            fetchedGameInfo.player2
          );
          const prizeAmount = ethers.formatEther(
            fetchedGameInfo.stakeAmount * BigInt(2)
          ); // Total prize pool

          // DEBUG: Log all the values
          let localWinnerAddress = ethers.ZeroAddress;
          if (Number(player1Score) > Number(player2Score)) {
            localWinnerAddress = fetchedGameInfo.player1;
          } else if (Number(player2Score) > Number(player1Score)) {
            localWinnerAddress = fetchedGameInfo.player2;
          } else {
            localWinnerAddress = ethers.ZeroAddress; // It's a draw
          }

          setGameResults({
            winner: localWinnerAddress.toLowerCase(), // Use locally determined winner
            prize: prizeAmount,
            player1Score: Number(player1Score),
            player2Score: Number(player2Score),
          });
        } catch (error: any) {
          console.error("Error fetching game results:", error);
          setGameResults({
            winner: "Unknown",
            prize: "Unknown",
            player1Score: 0,
            player2Score: 0,
          });
        } finally {
          setIsFetchingResults(false);
        }
      }
    };

    fetchGameResults();
  }, [gameState, gameContract, gameId, address]);

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isActive || scoreSubmitted) return;

    const value = e.target.value;
    const currentWord = words[currentWordIndex];
    const typedCharacter = value[value.length - 1];

    if (totalCharacters === 0 && startTime === null && isActive) {
      setStartTime(Date.now() / 1000); // Start timer on first valid character
    }

    let currentTotalCharacters = 0;
    let currentCorrectCharacters = 0;

    const previouslyTypedCorrect =
      words.slice(0, currentWordIndex).join(" ") +
      (currentWordIndex > 0 ? " " : "");
    const currentInput = value;
    const combinedTyped = previouslyTypedCorrect + currentInput;

    currentTotalCharacters = combinedTyped.length;

    for (let i = 0; i < currentTotalCharacters; i++) {
      if (i < gameText.length) {
        if (combinedTyped[i] === gameText[i]) {
          currentCorrectCharacters++;
        } else {
          break; // Stop counting correct characters at the first mistake
        }
      } else {
        break; // Typed beyond the game text
      }
    }

    // Update combo and streak
    // Combo increases only if the *current* character typed is correct and extends the correct sequence
    if (
      typedCharacter &&
      currentTotalCharacters > totalCharacters &&
      currentCorrectCharacters > correctCharacters
    ) {
      setCombo((prev) => prev + 1);
      // setStreak((prev) => prev + 1); // Streak implies consecutive words, not characters
      if (combo + 1 > maxCombo) {
        // Check against new combo value
        setMaxCombo(combo + 1);
      }
    } else if (
      typedCharacter &&
      currentTotalCharacters > totalCharacters &&
      currentCorrectCharacters === correctCharacters
    ) {
      // If a new character is typed, but correct characters didn't increase, it's a mistake
      setCombo(0);
    }

    setTotalCharacters(currentTotalCharacters);
    setCorrectCharacters(currentCorrectCharacters);
    setUserText(value);

    // Word completion logic
    if (typedCharacter === " ") {
      const typedWord = value.trim();
      if (typedWord === currentWord) {
        setCurrentWordIndex((prevIndex) => prevIndex + 1);
        setUserText(""); // Clear input for next word
        setCombo(0); // Reset combo after successful word
        // No need to call handleSubmitScore here, timer handles it.
        // if (currentWordIndex + 1 >= words.length) {
        //   // If all words typed
        //   setIsActive(false);
        //   if (intervalRef.current) {
        //     clearInterval(intervalRef.current);
        //   }
        //   if (!scoreSubmitted) {
        //     handleSubmitScore();
        //   }
        //   setGameState("finished");
        // }
      }
    }
  };

  // Helper to render game text with highlighting
  const renderGameText = useMemo(() => {
    // ... (your existing renderGameText logic, it's good)
    return words.map((word, wordIndex) => {
      const wordSpan = word.split("").map((char, charIndex) => {
        const absoluteCharIndex =
          words.slice(0, wordIndex).join(" ").length +
          (wordIndex > 0 ? 1 : 0) +
          charIndex;

        const isCurrent =
          absoluteCharIndex === totalCharacters && gameState === "active";
        const isTyped = absoluteCharIndex < totalCharacters;
        const isCorrectlyTyped =
          isTyped && gameText[absoluteCharIndex] === char;
        const isIncorrectlyTyped =
          isTyped && gameText[absoluteCharIndex] !== char;

        let className = "game-char";
        if (isCurrent) className += " current";
        if (isCorrectlyTyped) className += " correct";
        if (isIncorrectlyTyped) className += " incorrect";

        return (
          <span key={absoluteCharIndex} className={className}>
            {char}
          </span>
        );
      });

      // Handle space highlighting
      if (wordIndex < words.length - 1) {
        const spaceAbsoluteIndex =
          words.slice(0, wordIndex + 1).join(" ").length - 1;
        const isSpaceCurrent =
          spaceAbsoluteIndex === totalCharacters && gameState === "active";
        const isSpaceTyped = spaceAbsoluteIndex < totalCharacters;
        const isSpaceCorrectlyTyped =
          isSpaceTyped && gameText[spaceAbsoluteIndex] === " ";
        const isSpaceIncorrectlyTyped =
          isSpaceTyped && gameText[spaceAbsoluteIndex] !== " ";

        let spaceClassName = "game-char";
        if (isSpaceCurrent) spaceClassName += " current";
        if (isSpaceCorrectlyTyped) spaceClassName += " correct";
        if (isSpaceIncorrectlyTyped) spaceClassName += " incorrect";

        wordSpan.push(
          <span key={`space-${wordIndex}`} className={spaceClassName}>
            {" "}
          </span>
        );
      }

      return <span key={wordIndex}>{wordSpan}</span>;
    });
  }, [gameText, words, totalCharacters, gameState]);

  const getProgressPercentage = () => {
    if (words.length === 0) return 0;
    return (currentWordIndex / words.length) * 100;
  };

  const getTimerColor = () => {
    if (timer > 30) return "#00ff88";
    if (timer > 15) return "#ffaa00";
    return "#ff4444";
  };

  // Render based on game state
  const renderGameContent = () => {
    switch (gameState) {
      case "waiting":
        return (
          <div className="game-container waiting-state">
            <div className="waiting-room">
              <div className="waiting-header">
                <div className="pulse-animation">
                  <div className="waiting-icon">⚡</div>
                </div>
                <h2>BATTLE ARENA</h2>
                <div className="game-id-display">ROOM #{gameId}</div>
              </div>

              <div className="game-stakes">
                <div className="stakes-info">
                  <span className="stakes-label">PRIZE POOL</span>
                  <span className="stakes-amount">
                    {gameInfo
                      ? ethers.formatEther(gameInfo.stakeAmount * BigInt(2))
                      : "0"}{" "}
                    MON
                  </span>
                </div>
              </div>

              {address &&
                gameInfo?.player1.toLowerCase() === address?.toLowerCase() && (
                  <button
                    className="cancel-button"
                    onClick={handleCancelGame}
                    disabled={isCancelling}
                  >
                    {isCancelling ? "CANCELLING..." : "CANCEL GAME"}
                  </button>
                )}
            </div>
          </div>
        );

      case "active":
        return (
          <div className="game-container active-state">
            <div className="game-hud">
              <div className="hud-section">
                <div className="timer-display">
                  <div
                    className="timer-circle"
                    style={{
                      background: `conic-gradient(${getTimerColor()} ${
                        (timer / 60) * 360
                      }deg, rgba(255,255,255,0.1) 0deg)`,
                    }}
                  >
                    <div className="timer-inner">
                      <span className="timer-number">{timer}</span>
                      <span className="timer-label">SEC</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="hud-section">
                <div className="progress-container">
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: `${getProgressPercentage()}%` }}
                    ></div>
                  </div>
                  <div className="progress-text">
                    {currentWordIndex} / {words.length} WORDS
                  </div>
                </div>
              </div>

              <div className="hud-section">
                <div className="stats-grid">
                  <div className="stat-item">
                    <div className="stat-value">{wpm}</div>
                    <div className="stat-label">WPM</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-value">{accuracy}%</div>
                    <div className="stat-label">ACC</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-value">{combo}</div>
                    <div className="stat-label">COMBO</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="battle-arena">
              <div className="text-display">
                <div className="text-content">{renderGameText}</div>
              </div>

              <div className="input-section">
                <input
                  type="text"
                  className="typing-input"
                  value={userText}
                  onChange={handleTyping}
                  disabled={!isActive}
                  autoFocus
                  placeholder="Start typing to begin battle..."
                />
                <div className="input-glow"></div>
              </div>
            </div>

            <div className="opponent-section">
              <div className="opponent-progress">
                <div className="opponent-info">
                  <span className="opponent-label">OPPONENT</span>
                  <span className="opponent-score">{opponentScore} WORDS</span>
                </div>
                <div className="opponent-bar">
                  <div
                    className="opponent-fill"
                    style={{
                      width: `${(opponentScore / words.length) * 100}%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>

            {combo > 5 && (
              <div className="combo-display">
                <div className="combo-text">
                  <span className="combo-number">{combo}</span>
                  <span className="combo-label">COMBO!</span>
                </div>
              </div>
            )}
          </div>
        );

      case "finished":
        return (
          <div className="game-container finished-state">
            <div className="results-screen">
              <div className="results-header">
                <h2>BATTLE COMPLETE!</h2>
                {gameResults && gameInfo && (
                  <div className="winner-announcement">
                    {gameResults.winner.toLowerCase() ===
                    address?.toLowerCase() ? (
                      <div className="victory">
                        <div className="victory-icon">🏆</div>
                        <div className="victory-text">VICTORY!</div>
                        <div className="prize-text">
                          +{gameResults.prize} MON
                        </div>
                      </div>
                    ) : gameResults.winner.toLowerCase() ===
                      ethers.ZeroAddress.toLowerCase() ? (
                      <div className="draw">
                        <div className="draw-icon">🤝</div>
                        <div className="draw-text">DRAW!</div>
                        <div className="refund-text">Stakes Refunded</div>
                      </div>
                    ) : (
                      <div className="defeat">
                        <div className="defeat-icon">💀</div>
                        <div className="defeat-text">DEFEAT</div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {isFetchingResults ? (
                <div className="loading-results">
                  <div className="loading-spinner"></div>
                  <div>Calculating results...</div>
                </div>
              ) : gameResults && gameInfo ? (
                <div className="results-content">
                  <div className="final-stats">
                    <div className="stat-card">
                      <div className="stat-title">YOUR PERFORMANCE</div>
                      <div className="stat-grid">
                        <div className="stat">
                          <span className="stat-label">Words</span>
                          <span className="stat-value">
                            {address?.toLowerCase() ===
                            gameInfo.player1.toLowerCase()
                              ? gameResults.player1Score
                              : gameResults.player2Score}
                          </span>
                        </div>
                        <div className="stat">
                          <span className="stat-label">WPM</span>
                          <span className="stat-value">{wpm}</span>
                        </div>
                        <div className="stat">
                          <span className="stat-label">Accuracy</span>
                          <span className="stat-value">{accuracy}%</span>
                        </div>
                        <div className="stat">
                          <span className="stat-label">Max Combo</span>
                          <span className="stat-value">{maxCombo}</span>
                        </div>
                      </div>
                    </div>

                    <div className="stat-card">
                      <div className="stat-title">OPPONENT</div>
                      <div className="stat-grid">
                        <div className="stat">
                          <span className="stat-label">Words</span>
                          <span className="stat-value">
                            {address?.toLowerCase() ===
                            gameInfo.player1.toLowerCase()
                              ? gameResults.player2Score
                              : gameResults.player1Score}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="error-message">Error fetching results.</div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return <div className="game-container">{renderGameContent()}</div>;
};

export default GameRoom;
