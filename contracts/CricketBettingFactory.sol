// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./CricketBettingGame.sol";

contract CricketBettingFactory {
    address public owner;
    address[] public activeGames;
    mapping(address => bool) public isValidGame;

    event GameCreated(
        address indexed gameAddress,
        string teamA,
        string teamB,
        uint256 matchId,
        uint256 timestamp
    );

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    // Accept MON (Monad native token)
    receive() external payable {
        // Optional: emit an event
        // emit FundsReceived(msg.sender, msg.value);
    }

    fallback() external payable {
        // fallback can also accept MON if called with data
    }

    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }

    function createGame(
        string memory _teamA,
        string memory _teamB,
        uint256 _matchId
    ) external onlyOwner returns (address) {
        CricketBettingGame newGame = new CricketBettingGame(
            _teamA,
            _teamB,
            _matchId,
            owner
        );

        address gameAddress = address(newGame);
        activeGames.push(gameAddress);
        isValidGame[gameAddress] = true;

        emit GameCreated(
            gameAddress,
            _teamA,
            _teamB,
            _matchId,
            block.timestamp
        );

        return gameAddress;
    }

    function getActiveGames() external view returns (address[] memory) {
        return activeGames;
    }

    function removeGame(address _gameAddress) external onlyOwner {
        require(isValidGame[_gameAddress], "Invalid game address");
        isValidGame[_gameAddress] = false;

        for (uint i = 0; i < activeGames.length; i++) {
            if (activeGames[i] == _gameAddress) {
                activeGames[i] = activeGames[activeGames.length - 1];
                activeGames.pop();
                break;
            }
        }
    }
}
