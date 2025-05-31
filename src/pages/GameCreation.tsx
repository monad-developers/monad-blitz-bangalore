import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGameContract } from "../context/WalletContext";
import { ethers } from "ethers";
import "./GameCreation.css";

const GameCreation = () => {
  const [textToType, setTextToType] = useState("");
  const [stakeAmount, setStakeAmount] = useState("0.1");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const gameContract = useGameContract();

  const handleCreateGame = async () => {
    if (!gameContract) {
      alert("Wallet not connected or contract not available.");
      return;
    }
    if (!textToType.trim()) {
      alert("Please enter text to type.");
      return;
    }
    if (parseFloat(stakeAmount) <= 0) {
      alert("Stake amount must be greater than zero.");
      return;
    }

    setIsLoading(true);
    try {
      const amountInWei = ethers.parseEther(stakeAmount);
      console.log(
        `Creating game with stake: ${stakeAmount} MON and text: "${textToType.substring(
          0,
          50
        )}..."`
      );

      const tx = await gameContract.createGame(textToType, {
        value: amountInWei,
      });
      console.log("Transaction sent, waiting for confirmation...");
      const receipt = await tx.wait();
      console.log("Transaction confirmed:", receipt);

      const gameCreatedEvent = receipt?.logs?.find(
        (log: { topics: ReadonlyArray<string>; data: string }) =>
          gameContract.interface.parseLog(log)?.name === "GameCreated"
      );

      if (gameCreatedEvent) {
        const parsedLog = gameContract.interface.parseLog(gameCreatedEvent);
        if (parsedLog) {
          const newGameId = parsedLog.args[0];
          console.log(
            `New game created successfully with ID: ${newGameId.toString()}`
          );
          alert(`Game created successfully! Game ID: ${newGameId.toString()}`);
          navigate(`/game/${newGameId.toString()}`);
        }
      } else {
        console.error("GameCreated event not found in transaction receipt.");
        alert("Game created, but could not retrieve game ID from event.");
        navigate("/lobby");
      }
    } catch (error) {
      console.error("Error creating game:", error);
      alert(`Failed to create game: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="game-creation-container">
      <div className="stars-bg"></div>

      <header className="game-header">
        <h1 className="game-title">CREATE NEW GAME</h1>
        <p className="game-subtitle">
          🎮 Ready to challenge someone? Create a new game and dominate the
          battlefield!
        </p>
      </header>

      <div className="game-cards-container">
        {/* Typing Text Card */}
        <div className="game-card text-card">
          <div className="card-header">
            <div className="card-icon">⚡</div>
            <h2 className="card-title">Typing Challenge</h2>
          </div>
          <div className="card-content">
            <textarea
              className="text-input"
              rows={8}
              placeholder="Enter your custom typing text here... Make it challenging! 🔥"
              value={textToType}
              onChange={(e) => setTextToType(e.target.value)}
            />
            <div className="input-stats">
              <span className="char-count">{textToType.length} characters</span>
              <span className="word-count">
                {
                  textToType
                    .trim()
                    .split(/\s+/)
                    .filter((word) => word.length > 0).length
                }{" "}
                words
              </span>
            </div>
          </div>
        </div>

        {/* Stake Amount Card */}
        <div className="game-card stake-card">
          <div className="card-header">
            <div className="card-icon">💰</div>
            <h2 className="card-title">Stake Amount</h2>
          </div>
          <div className="card-content">
            <div className="stake-input-container">
              <input
                type="number"
                step="0.01"
                className="stake-input"
                placeholder="0.1"
                value={stakeAmount}
                onChange={(e) => setStakeAmount(e.target.value)}
              />
              <span className="currency-label">MON</span>
            </div>

            <div className="stake-presets">
              <button
                className="preset-btn"
                onClick={() => setStakeAmount("0.1")}
              >
                0.1 MON
              </button>
              <button
                className="preset-btn"
                onClick={() => setStakeAmount("0.5")}
              >
                0.5 MON
              </button>
              <button
                className="preset-btn"
                onClick={() => setStakeAmount("1")}
              >
                1 MON
              </button>
              <button
                className="preset-btn"
                onClick={() => setStakeAmount("5")}
              >
                5 MON
              </button>
            </div>
          </div>
        </div>

        {/* Game Preview Card */}
        <div className="game-card preview-card">
          <div className="card-header">
            <div className="card-icon">🎯</div>
            <h2 className="card-title">Game Preview</h2>
          </div>
          <div className="card-content">
            <div className="preview-section">
              <label className="preview-label">Text Preview:</label>
              <div className="text-preview">
                {textToType.substring(0, 150) || "No text entered yet..."}
                {textToType.length > 150 && "..."}
              </div>
            </div>

            <div className="preview-section">
              <label className="preview-label">Stake Amount:</label>
              <div className="stake-preview">
                <span className="stake-amount">{stakeAmount}</span>
                <span className="stake-currency">MON</span>
              </div>
            </div>

            <div className="game-stats">
              <div className="stat-item">
                <span className="stat-label">Difficulty:</span>
                <span className="stat-value">
                  {textToType.length < 100
                    ? "Easy 🟢"
                    : textToType.length < 300
                    ? "Medium 🟡"
                    : "Hard 🔴"}
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Estimated Time:</span>
                <span className="stat-value">
                  {Math.max(1, Math.ceil(textToType.length / 50))} min
                </span>
              </div>
            </div>

            <button
              className={`create-game-btn ${isLoading ? "loading" : ""}`}
              onClick={handleCreateGame}
              disabled={isLoading}
            >
              <span className="btn-icon">🎮</span>
              <span className="btn-text">
                {isLoading ? "Creating Game..." : "CREATE GAME"}
              </span>
              <span className="btn-glow"></span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameCreation;
