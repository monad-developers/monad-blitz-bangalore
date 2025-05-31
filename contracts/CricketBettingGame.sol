// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

// Individual Cricket Match Betting Contract
contract CricketBettingGame {
    address public owner;
    address public factory;

    string public teamA;
    string public teamB;
    uint256 public matchId;

    uint256 public constant TOTAL_BALLS = 120; // 20 overs * 6 balls
    uint256 public currentBall = 0;

    enum BallOutcome {
        PENDING, // 0 - Default state
        BOUNDARY, // 1 - 4 or 6 runs
        WICKET, // 2 - Batsman out
        DOT_BALL, // 3 - 0 runs
        ONE_RUN, // 4 - 1 run
        TWO_RUNS, // 5 - 2 runs
        EXTRAS // 6 - Wide or No ball
    }

    enum BallState {
        CLOSED,
        OPEN,
        RESOLVED
    }

    struct Ball {
        uint256 ballNumber;
        BallState state;
        BallOutcome result;
        mapping(BallOutcome => uint256) totalBets; // outcome => total amount
        mapping(BallOutcome => address[]) bettors; // outcome => list of bettors
        mapping(address => mapping(BallOutcome => uint256)) userBets; // user => outcome => amount
        mapping(address => bool) hasBet; // Track if user has bet on this ball
        uint256 totalPool;
        uint256 uniqueBettorCount;
        bool distributed;
        bool refunded;
    }

    mapping(uint256 => Ball) public balls;
    mapping(address => uint256) public userBalances;

    // Events for frontend consumption
    event BallOpened(uint256 indexed ballNumber, uint256 timestamp);
    event BallClosed(uint256 indexed ballNumber, uint256 timestamp);
    event BetPlaced(
        uint256 indexed ballNumber,
        address indexed bettor,
        BallOutcome outcome,
        uint256 amount,
        uint256 timestamp
    );
    event BallResult(
        uint256 indexed ballNumber,
        BallOutcome result,
        uint256 timestamp
    );
    event WinningsDistributed(
        uint256 indexed ballNumber,
        BallOutcome winningOutcome,
        uint256 totalPool,
        uint256 winnersCount,
        uint256 timestamp
    );
    event BetsRefunded(
        uint256 indexed ballNumber,
        uint256 totalRefunded,
        uint256 bettorsCount,
        uint256 timestamp
    );
    event MatchCompleted(uint256 matchId, uint256 timestamp);
    event BallCancelled(
        uint256 indexed ballNumber,
        string reason,
        uint256 timestamp
    );

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    modifier ballExists(uint256 _ballNumber) {
        require(
            _ballNumber > 0 && _ballNumber <= TOTAL_BALLS,
            "Invalid ball number"
        );
        _;
    }

    constructor(
        string memory _teamA,
        string memory _teamB,
        uint256 _matchId,
        address _owner
    ) {
        teamA = _teamA;
        teamB = _teamB;
        matchId = _matchId;
        owner = _owner;
        factory = msg.sender;
    }

    // Owner opens betting for a specific ball
    function openBall(
        uint256 _ballNumber
    ) external onlyOwner ballExists(_ballNumber) {
        require(
            balls[_ballNumber].state == BallState.CLOSED,
            "Ball already opened or resolved"
        );
        require(_ballNumber == currentBall + 1, "Must open balls in sequence");

        balls[_ballNumber].ballNumber = _ballNumber;
        balls[_ballNumber].state = BallState.OPEN;
        balls[_ballNumber].result = BallOutcome.PENDING;
        currentBall = _ballNumber;

        emit BallOpened(_ballNumber, block.timestamp);
    }

    // Owner closes betting for a specific ball
    function closeBall(
        uint256 _ballNumber
    ) external onlyOwner ballExists(_ballNumber) {
        require(
            balls[_ballNumber].state == BallState.OPEN,
            "Ball not open for betting"
        );

        balls[_ballNumber].state = BallState.CLOSED;

        emit BallClosed(_ballNumber, block.timestamp);
    }

    // Users place bets on a ball outcome (can bet multiple times on different outcomes)
    function placeBet(
        uint256 _ballNumber,
        BallOutcome _outcome
    ) external payable ballExists(_ballNumber) {
        require(msg.value > 0, "Bet amount must be greater than 0");
        require(
            balls[_ballNumber].state == BallState.OPEN,
            "Betting not open for this ball"
        );
        require(
            _outcome != BallOutcome.PENDING,
            "Cannot bet on PENDING outcome"
        );

        Ball storage ball = balls[_ballNumber];

        // Track unique bettors
        if (!ball.hasBet[msg.sender]) {
            ball.hasBet[msg.sender] = true;
            ball.uniqueBettorCount++;
        }

        // Add to user's bet for this outcome (allows multiple bets on same outcome)
        if (ball.userBets[msg.sender][_outcome] == 0) {
            ball.bettors[_outcome].push(msg.sender);
        }
        ball.userBets[msg.sender][_outcome] += msg.value;
        ball.totalBets[_outcome] += msg.value;
        ball.totalPool += msg.value;

        emit BetPlaced(
            _ballNumber,
            msg.sender,
            _outcome,
            msg.value,
            block.timestamp
        );
    }

    // Users can place multiple bets on different outcomes in a single transaction
    function placeBets(
        uint256 _ballNumber,
        BallOutcome[] memory _outcomes,
        uint256[] memory _amounts
    ) external payable ballExists(_ballNumber) {
        require(_outcomes.length == _amounts.length, "Arrays length mismatch");
        require(_outcomes.length > 0, "No bets specified");
        require(
            balls[_ballNumber].state == BallState.OPEN,
            "Betting not open for this ball"
        );

        uint256 totalAmount = 0;
        for (uint256 i = 0; i < _amounts.length; i++) {
            require(_amounts[i] > 0, "All bet amounts must be greater than 0");
            require(
                _outcomes[i] != BallOutcome.PENDING,
                "Cannot bet on PENDING outcome"
            );
            totalAmount += _amounts[i];
        }
        require(
            msg.value == totalAmount,
            "Sent value doesn't match total bet amounts"
        );

        Ball storage ball = balls[_ballNumber];

        // Track unique bettors
        if (!ball.hasBet[msg.sender]) {
            ball.hasBet[msg.sender] = true;
            ball.uniqueBettorCount++;
        }

        // Process each bet
        for (uint256 i = 0; i < _outcomes.length; i++) {
            BallOutcome outcome = _outcomes[i];
            uint256 amount = _amounts[i];

            // Add to user's bet for this outcome
            if (ball.userBets[msg.sender][outcome] == 0) {
                ball.bettors[outcome].push(msg.sender);
            }
            ball.userBets[msg.sender][outcome] += amount;
            ball.totalBets[outcome] += amount;
            ball.totalPool += amount;

            emit BetPlaced(
                _ballNumber,
                msg.sender,
                outcome,
                amount,
                block.timestamp
            );
        }
    }

    // Owner reports the result of a ball
    function reportBallResult(
        uint256 _ballNumber,
        BallOutcome _result
    ) external onlyOwner ballExists(_ballNumber) {
        require(
            balls[_ballNumber].state == BallState.CLOSED,
            "Ball must be closed first"
        );
        require(_result != BallOutcome.PENDING, "Result cannot be PENDING");
        require(
            !balls[_ballNumber].distributed && !balls[_ballNumber].refunded,
            "Already processed"
        );

        balls[_ballNumber].result = _result;
        balls[_ballNumber].state = BallState.RESOLVED;

        emit BallResult(_ballNumber, _result, block.timestamp);

        // Automatically distribute winnings or refund
        _processBallResult(_ballNumber);
    }

    // Owner can cancel a ball and refund all bets (for situations like rain delay, technical issues)
    function cancelBall(
        uint256 _ballNumber,
        string memory _reason
    ) external onlyOwner ballExists(_ballNumber) {
        require(
            balls[_ballNumber].state == BallState.CLOSED,
            "Ball must be closed first"
        );
        require(
            !balls[_ballNumber].distributed && !balls[_ballNumber].refunded,
            "Already processed"
        );

        emit BallCancelled(_ballNumber, _reason, block.timestamp);
        _refundAllBets(_ballNumber);
    }

    // Internal function to process ball result (distribute or refund)
    function _processBallResult(uint256 _ballNumber) internal {
        Ball storage ball = balls[_ballNumber];
        BallOutcome winningOutcome = ball.result;

        // Check if there are any winning bets
        if (ball.totalBets[winningOutcome] == 0) {
            // No winners - refund all bets
            _refundAllBets(_ballNumber);
            return;
        }

        // Distribute winnings
        _distributeWinnings(_ballNumber);
    }

    // Internal function to distribute winnings
    function _distributeWinnings(uint256 _ballNumber) internal {
        Ball storage ball = balls[_ballNumber];
        BallOutcome winningOutcome = ball.result;

        address[] memory winners = ball.bettors[winningOutcome];
        uint256 totalWinningBets = ball.totalBets[winningOutcome];
        uint256 totalPool = ball.totalPool;

        // Distribute proportionally based on bet amounts
        for (uint256 i = 0; i < winners.length; i++) {
            address winner = winners[i];
            uint256 userBet = ball.userBets[winner][winningOutcome];
            uint256 userWinnings = (userBet * totalPool) / totalWinningBets;

            userBalances[winner] += userWinnings;
        }

        ball.distributed = true;

        emit WinningsDistributed(
            _ballNumber,
            winningOutcome,
            totalPool,
            winners.length,
            block.timestamp
        );

        // Check if match is completed
        if (_ballNumber == TOTAL_BALLS) {
            emit MatchCompleted(matchId, block.timestamp);
        }
    }

    // Internal function to refund all bets for a ball
    function _refundAllBets(uint256 _ballNumber) internal {
        Ball storage ball = balls[_ballNumber];
        uint256 totalRefunded = 0;
        uint256 totalBettors = 0;

        // Refund all outcomes
        BallOutcome[6] memory outcomes = [
            BallOutcome.BOUNDARY,
            BallOutcome.WICKET,
            BallOutcome.DOT_BALL,
            BallOutcome.ONE_RUN,
            BallOutcome.TWO_RUNS,
            BallOutcome.EXTRAS
        ];

        for (uint256 i = 0; i < outcomes.length; i++) {
            BallOutcome outcome = outcomes[i];
            address[] memory bettors = ball.bettors[outcome];

            for (uint256 j = 0; j < bettors.length; j++) {
                address bettor = bettors[j];
                uint256 refundAmount = ball.userBets[bettor][outcome];

                if (refundAmount > 0) {
                    userBalances[bettor] += refundAmount;
                    totalRefunded += refundAmount;
                    totalBettors++;
                }
            }
        }

        ball.refunded = true;

        emit BetsRefunded(
            _ballNumber,
            totalRefunded,
            totalBettors,
            block.timestamp
        );
    }

    // Users withdraw their winnings/refunds
    function withdraw() external {
        uint256 amount = userBalances[msg.sender];
        require(amount > 0, "No balance to withdraw");

        userBalances[msg.sender] = 0;
        payable(msg.sender).transfer(amount);
    }

    // View functions for frontend
    function getBallInfo(
        uint256 _ballNumber
    )
        external
        view
        ballExists(_ballNumber)
        returns (
            BallState state,
            BallOutcome result,
            uint256 totalPool,
            uint256[6] memory outcomeBets, // [BOUNDARY, WICKET, DOT_BALL, ONE_RUN, TWO_RUNS, EXTRAS]
            uint256 uniqueBettorCount,
            bool distributed,
            bool refunded
        )
    {
        Ball storage ball = balls[_ballNumber];
        uint256[6] memory bets = [
            ball.totalBets[BallOutcome.BOUNDARY],
            ball.totalBets[BallOutcome.WICKET],
            ball.totalBets[BallOutcome.DOT_BALL],
            ball.totalBets[BallOutcome.ONE_RUN],
            ball.totalBets[BallOutcome.TWO_RUNS],
            ball.totalBets[BallOutcome.EXTRAS]
        ];

        return (
            ball.state,
            ball.result,
            ball.totalPool,
            bets,
            ball.uniqueBettorCount,
            ball.distributed,
            ball.refunded
        );
    }

    function getUserBetForBall(
        uint256 _ballNumber,
        address _user,
        BallOutcome _outcome
    ) external view ballExists(_ballNumber) returns (uint256) {
        return balls[_ballNumber].userBets[_user][_outcome];
    }

    function getUserTotalBetForBall(
        uint256 _ballNumber,
        address _user
    ) external view ballExists(_ballNumber) returns (uint256 totalBet) {
        Ball storage ball = balls[_ballNumber];

        totalBet += ball.userBets[_user][BallOutcome.BOUNDARY];
        totalBet += ball.userBets[_user][BallOutcome.WICKET];
        totalBet += ball.userBets[_user][BallOutcome.DOT_BALL];
        totalBet += ball.userBets[_user][BallOutcome.ONE_RUN];
        totalBet += ball.userBets[_user][BallOutcome.TWO_RUNS];
        totalBet += ball.userBets[_user][BallOutcome.EXTRAS];

        return totalBet;
    }

    function getMatchInfo()
        external
        view
        returns (string memory, string memory, uint256, uint256, uint256)
    {
        return (teamA, teamB, matchId, currentBall, TOTAL_BALLS);
    }

    function getUserBalance(address _user) external view returns (uint256) {
        return userBalances[_user];
    }

    function getBallOutcomeString(
        BallOutcome _outcome
    ) external pure returns (string memory) {
        if (_outcome == BallOutcome.BOUNDARY) return "Boundary (4/6)";
        if (_outcome == BallOutcome.WICKET) return "Wicket";
        if (_outcome == BallOutcome.DOT_BALL) return "Dot Ball";
        if (_outcome == BallOutcome.ONE_RUN) return "1 Run";
        if (_outcome == BallOutcome.TWO_RUNS) return "2 Runs";
        if (_outcome == BallOutcome.EXTRAS) return "Extras (Wide/No Ball)";
        return "Pending";
    }

    // Get detailed betting info for a ball
    function getBallBettingDetails(
        uint256 _ballNumber
    )
        external
        view
        ballExists(_ballNumber)
        returns (
            uint256 boundaryBets,
            uint256 wicketBets,
            uint256 dotBallBets,
            uint256 oneRunBets,
            uint256 twoRunsBets,
            uint256 extrasBets,
            uint256 totalPool,
            uint256 totalBettors
        )
    {
        Ball storage ball = balls[_ballNumber];

        boundaryBets = ball.totalBets[BallOutcome.BOUNDARY];
        wicketBets = ball.totalBets[BallOutcome.WICKET];
        dotBallBets = ball.totalBets[BallOutcome.DOT_BALL];
        oneRunBets = ball.totalBets[BallOutcome.ONE_RUN];
        twoRunsBets = ball.totalBets[BallOutcome.TWO_RUNS];
        extrasBets = ball.totalBets[BallOutcome.EXTRAS];
        totalPool = ball.totalPool;

        // Count total bettors (now returns accurate unique count)
        totalBettors = ball.uniqueBettorCount;

        return (
            boundaryBets,
            wicketBets,
            dotBallBets,
            oneRunBets,
            twoRunsBets,
            extrasBets,
            totalPool,
            totalBettors
        );
    }

    // Emergency functions
    function emergencyPause() external onlyOwner {
        // Implementation for emergency pause functionality
        // Could add a paused state and modifier
    }

    // Get contract balance (for owner monitoring)
    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }

    // Batch function to get multiple balls info (for frontend efficiency)
    function getMultipleBallsInfo(
        uint256 _startBall,
        uint256 _endBall
    )
        external
        view
        returns (
            BallState[] memory states,
            BallOutcome[] memory results,
            uint256[] memory totalPools
        )
    {
        require(
            _startBall <= _endBall && _endBall <= TOTAL_BALLS,
            "Invalid range"
        );

        uint256 length = _endBall - _startBall + 1;
        states = new BallState[](length);
        results = new BallOutcome[](length);
        totalPools = new uint256[](length);

        for (uint256 i = 0; i < length; i++) {
            uint256 ballNumber = _startBall + i;
            states[i] = balls[ballNumber].state;
            results[i] = balls[ballNumber].result;
            totalPools[i] = balls[ballNumber].totalPool;
        }

        return (states, results, totalPools);
    }
}
