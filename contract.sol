// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract TypingGame {
    struct Game {
        address player1;
        address player2;
        uint256 stakeAmount;
        string textToType;
        uint256 startTime;
        uint256 endTime;
        bool gameActive;
        bool gameFinished;
        address winner;
        mapping(address => uint256) wordsTyped;
        mapping(address => bool) hasSubmitted;
    }

    mapping(uint256 => Game) public games;
    uint256 public gameCounter;
    uint256 public constant GAME_DURATION = 60; // 60 seconds

    event GameCreated(
        uint256 indexed gameId,
        address indexed creator,
        uint256 stakeAmount,
        string textToType
    );
    event PlayerJoined(uint256 indexed gameId, address indexed player);
    event GameStarted(uint256 indexed gameId, uint256 startTime);
    event ScoreSubmitted(
        uint256 indexed gameId,
        address indexed player,
        uint256 wordsTyped
    );
    event GameFinished(
        uint256 indexed gameId,
        address indexed winner,
        uint256 prizeAmount
    );
    event StakeRefunded(
        uint256 indexed gameId,
        address indexed player,
        uint256 amount
    );

    modifier onlyGamePlayers(uint256 gameId) {
        require(
            msg.sender == games[gameId].player1 ||
                msg.sender == games[gameId].player2,
            "Not a player in this game"
        );
        _;
    }

    modifier gameExists(uint256 gameId) {
        require(gameId < gameCounter, "Game does not exist");
        _;
    }

    // Create a new typing game
    function createGame(
        string memory _textToType
    ) external payable returns (uint256) {
        require(msg.value > 0, "Stake amount must be greater than 0");
        require(bytes(_textToType).length > 0, "Text to type cannot be empty");

        uint256 gameId = gameCounter++;
        Game storage newGame = games[gameId];

        newGame.player1 = msg.sender;
        newGame.stakeAmount = msg.value;
        newGame.textToType = _textToType;
        newGame.gameActive = false;
        newGame.gameFinished = false;

        emit GameCreated(gameId, msg.sender, msg.value, _textToType);
        return gameId;
    }

    // Join an existing game
    function joinGame(uint256 gameId) external payable gameExists(gameId) {
        Game storage game = games[gameId];

        require(game.player2 == address(0), "Game is already full");
        require(msg.sender != game.player1, "Cannot play against yourself");
        require(
            msg.value == game.stakeAmount,
            "Must stake the same amount as player 1"
        );
        require(
            !game.gameActive && !game.gameFinished,
            "Game is not available to join"
        );

        game.player2 = msg.sender;
        game.gameActive = true;
        game.startTime = block.timestamp;
        game.endTime = block.timestamp + GAME_DURATION;

        emit PlayerJoined(gameId, msg.sender);
        emit GameStarted(gameId, game.startTime);
    }

    // Submit typing results
    function submitScore(
        uint256 gameId,
        uint256 _wordsTyped
    ) external gameExists(gameId) onlyGamePlayers(gameId) {
        Game storage game = games[gameId];

        require(game.gameActive, "Game is not active");
        require(!game.hasSubmitted[msg.sender], "Score already submitted");
        require(block.timestamp <= game.endTime, "Game time has expired");
        require(_wordsTyped > 0, "Words typed must be greater than 0");

        game.wordsTyped[msg.sender] = _wordsTyped;
        game.hasSubmitted[msg.sender] = true;

        emit ScoreSubmitted(gameId, msg.sender, _wordsTyped);

        // Check if both players have submitted
        if (
            game.hasSubmitted[game.player1] && game.hasSubmitted[game.player2]
        ) {
            _finishGame(gameId);
        }
    }

    // Finish the game and determine winner (can be called by anyone after time expires)
    function finishGame(uint256 gameId) external gameExists(gameId) {
        Game storage game = games[gameId];

        require(game.gameActive, "Game is not active");
        require(block.timestamp > game.endTime, "Game is still ongoing");

        _finishGame(gameId);
    }

    // Internal function to finish the game
    function _finishGame(uint256 gameId) internal {
        Game storage game = games[gameId];

        game.gameActive = false;
        game.gameFinished = true;

        uint256 player1Score = game.wordsTyped[game.player1];
        uint256 player2Score = game.wordsTyped[game.player2];
        uint256 totalPrize = game.stakeAmount * 2;

        // Determine winner
        if (player1Score > player2Score) {
            game.winner = game.player1;
            payable(game.player1).transfer(totalPrize);
            emit GameFinished(gameId, game.player1, totalPrize);
        } else if (player2Score > player1Score) {
            game.winner = game.player2;
            payable(game.player2).transfer(totalPrize);
            emit GameFinished(gameId, game.player2, totalPrize);
        } else {
            // It's a tie - refund both players
            payable(game.player1).transfer(game.stakeAmount);
            payable(game.player2).transfer(game.stakeAmount);
            emit StakeRefunded(gameId, game.player1, game.stakeAmount);
            emit StakeRefunded(gameId, game.player2, game.stakeAmount);
        }
    }

    // Cancel game if no second player joins (only creator can call within reasonable time)
    function cancelGame(uint256 gameId) external gameExists(gameId) {
        Game storage game = games[gameId];

        require(msg.sender == game.player1, "Only game creator can cancel");
        require(
            game.player2 == address(0),
            "Cannot cancel game with two players"
        );
        require(!game.gameFinished, "Game is already finished");

        game.gameFinished = true;
        payable(game.player1).transfer(game.stakeAmount);

        emit StakeRefunded(gameId, game.player1, game.stakeAmount);
    }

    // View functions
    function getGameInfo(
        uint256 gameId
    )
        external
        view
        gameExists(gameId)
        returns (
            address player1,
            address player2,
            uint256 stakeAmount,
            string memory textToType,
            uint256 startTime,
            uint256 endTime,
            bool gameActive,
            bool gameFinished,
            address winner
        )
    {
        Game storage game = games[gameId];
        return (
            game.player1,
            game.player2,
            game.stakeAmount,
            game.textToType,
            game.startTime,
            game.endTime,
            game.gameActive,
            game.gameFinished,
            game.winner
        );
    }

    function getPlayerScore(
        uint256 gameId,
        address player
    ) external view gameExists(gameId) returns (uint256) {
        return games[gameId].wordsTyped[player];
    }

    function hasPlayerSubmitted(
        uint256 gameId,
        address player
    ) external view gameExists(gameId) returns (bool) {
        return games[gameId].hasSubmitted[player];
    }

    function getTimeRemaining(
        uint256 gameId
    ) external view gameExists(gameId) returns (uint256) {
        Game storage game = games[gameId];
        if (!game.gameActive || block.timestamp >= game.endTime) {
            return 0;
        }
        return game.endTime - block.timestamp;
    }

    function getTotalGames() external view returns (uint256) {
        return gameCounter;
    }
}
