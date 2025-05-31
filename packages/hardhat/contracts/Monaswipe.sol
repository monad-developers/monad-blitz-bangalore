// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol";

contract Monaswipe is Ownable {
    uint256 public feePercentage; // Fee percentage in basis points (e.g., 100 = 1%)
    address public feeCollectionAddress; // Address where fees are sent
    IUniswapV2Router02 public uniswapRouter;

    address private constant WMON = 0x760AfE86e5de5fa0Ee542fc7B7B713e1c5425701;

    event FeePercentageUpdated(uint256 oldFee, uint256 newFee);
    event FeeCollectionAddressUpdated(address oldAddress, address newAddress);
    event SwapMONToToken(address indexed user, uint256 monAmount, address token);
    event SwapTokenToMON(address indexed user, uint256 tokenAmount, address token);

    constructor(
        uint256 _initialFeePercentage,
        address _feeCollectionAddress,
        address _uniswapRouter
    ) Ownable(msg.sender) {
        require(_initialFeePercentage <= 10000, "Fee percentage too high");
        require(_feeCollectionAddress != address(0), "Invalid fee address");

        feePercentage = _initialFeePercentage;
        feeCollectionAddress = _feeCollectionAddress;
        uniswapRouter = IUniswapV2Router02(_uniswapRouter);
    }

    // Update the fee percentage
    function setFeePercentage(uint256 _newFeePercentage) external onlyOwner {
        require(_newFeePercentage <= 10000, "Fee percentage too high");
        emit FeePercentageUpdated(feePercentage, _newFeePercentage);
        feePercentage = _newFeePercentage;
    }

    // Update the fee collection address
    function setFeeCollectionAddress(address _newFeeCollectionAddress) external onlyOwner {
        require(_newFeeCollectionAddress != address(0), "Invalid fee address");
        emit FeeCollectionAddressUpdated(feeCollectionAddress, _newFeeCollectionAddress);
        feeCollectionAddress = _newFeeCollectionAddress;
    }

    function swapMonToToken(address _token, uint256 _monAmount, uint256 _minTokens) external {
        require(_monAmount > 0, "MON required for swap");

        uint256 fee = (_monAmount * feePercentage) / 10000;
        uint256 amountToSwap = _monAmount - fee;

        require(IERC20(WMON).balanceOf(msg.sender) >= amountToSwap, "Insufficient WMON balance");

        // Send fee to the fee collection address
        // payable(feeCollectionAddress).transfer(fee);

        IERC20 wmon = IERC20(WMON);
        wmon.transferFrom(msg.sender, address(this), _monAmount);
        wmon.approve(address(uniswapRouter), amountToSwap);

        // Perform the swap
        address[] memory path = new address[](2);
        path[0] = WMON;
        path[1] = _token;

        uniswapRouter.swapExactTokensForTokens(amountToSwap, _minTokens, path, msg.sender, block.timestamp);

        emit SwapMONToToken(msg.sender, _monAmount, _token);
    }

    // Swap token to MON and collect fees
    function swapTokenToMon(
        address _token,
        uint256 _tokenAmount,
        uint256 _minMON
    ) external {
        require(_tokenAmount > 0, "Token amount required");

        // uint256 fee = (_tokenAmount * feePercentage) / 10000;
        // uint256 amountToSwap = _tokenAmount - fee;

        // Transfer tokens to the contract
        IERC20(_token).transferFrom(msg.sender, address(this), _tokenAmount);

        // Approve Uniswap to spend tokens
        IERC20(_token).approve(address(uniswapRouter), _tokenAmount);

        // Perform the swap
        address[] memory path = new address[](2);
        path[0] = _token;
        path[1] = WMON;

        uniswapRouter.swapExactTokensForETH(
            _tokenAmount,
            _minMON,
            path,
            msg.sender,
            block.timestamp
        );

        // Send fee in MON to the fee collection address
        // IERC20(_token).transfer(feeCollectionAddress, fee);

        emit SwapTokenToMON(msg.sender, _tokenAmount, _token);
    }
}