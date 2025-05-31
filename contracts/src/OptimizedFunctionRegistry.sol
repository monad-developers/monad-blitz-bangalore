// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title OptimizedFunctionRegistry
 * @dev Gas-optimized Monad FaaS Function Registry
 * @author MonadBot
 */
contract OptimizedFunctionRegistry is AccessControl, ReentrancyGuard {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant DEVELOPER_ROLE = keccak256("DEVELOPER_ROLE");

    enum TriggerType {
        HTTP_WEBHOOK,
        ON_CHAIN_EVENT,
        PRICE_THRESHOLD,
        TIME_BASED,
        CUSTOM
    }

    // Packed struct for gas optimization
    struct FunctionMetadata {
        bytes32 wasmHash;           // IPFS hash of WASM bytecode
        address owner;              // Function owner (20 bytes)
        uint96 gasLimit;            // Max gas limit (12 bytes) - packed with owner
        uint64 createdAt;           // Creation timestamp (8 bytes)
        uint64 executionCount;      // Number of times executed (8 bytes)
        bool active;                // Whether function is active (1 byte)
        string name;                // Function name
        string description;         // Function description
        string runtime;             // Runtime type
    }

    // Packed struct for gas optimization
    struct TriggerRule {
        uint256 functionId;         // Associated function ID
        uint64 lastTriggered;       // Last trigger timestamp (8 bytes)
        uint64 triggerCount;        // Number of times triggered (8 bytes)
        TriggerType triggerType;    // Type of trigger (1 byte)
        bool active;                // Whether trigger is active (1 byte)
        bytes triggerData;          // Encoded trigger parameters
    }

    // Minimal execution result for gas efficiency
    struct ExecutionResult {
        uint64 timestamp;           // Execution timestamp (8 bytes)
        uint32 gasUsed;             // Gas consumed (4 bytes) - max 4.2B gas
        bool success;               // Execution success status (1 byte)
    }

    // Storage - using packed mappings
    mapping(uint256 => FunctionMetadata) public functions;
    mapping(uint256 => TriggerRule) public triggers;
    mapping(uint256 => ExecutionResult[]) public executionHistory;
    
    uint256 public nextFunctionId = 1;
    uint256 public nextTriggerId = 1;
    uint256 public constant MAX_GAS_LIMIT = 5_000_000; // Constant to save gas
    
    // Events - optimized with fewer indexed parameters
    event FunctionRegistered(
        uint256 indexed functionId,
        address indexed owner,
        bytes32 wasmHash
    );
    
    event TriggerAdded(
        uint256 indexed triggerId,
        uint256 indexed functionId
    );
    
    event TriggerFired(
        uint256 indexed triggerId,
        uint256 indexed functionId
    );
    
    event FunctionExecuted(
        uint256 indexed functionId,
        uint256 indexed triggerId,
        bool success
    );

    // Custom errors for gas efficiency
    error FunctionNotFound();
    error TriggerNotFound();
    error UnauthorizedAccess();
    error FunctionInactive();
    error TriggerInactive();
    error GasLimitExceeded();
    error InvalidWasmHash();

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(DEVELOPER_ROLE, msg.sender);
    }

    /**
     * @dev Register a new serverless function (gas optimized)
     */
    function registerFunction(
        string calldata name,
        string calldata description,
        bytes32 wasmHash,
        uint96 gasLimit,
        string calldata runtime
    ) external returns (uint256 functionId) {
        if (wasmHash == bytes32(0)) revert InvalidWasmHash();
        if (gasLimit > MAX_GAS_LIMIT) revert GasLimitExceeded();

        functionId = nextFunctionId++;
        
        // Direct storage assignment for gas efficiency
        FunctionMetadata storage func = functions[functionId];
        func.wasmHash = wasmHash;
        func.name = name;
        func.description = description;
        func.owner = msg.sender;
        func.gasLimit = gasLimit;
        func.active = true;
        func.createdAt = uint64(block.timestamp);
        func.executionCount = 0;
        func.runtime = runtime;

        emit FunctionRegistered(functionId, msg.sender, wasmHash);
    }

    /**
     * @dev Add a trigger rule (gas optimized)
     */
    function addTrigger(
        uint256 functionId,
        TriggerType triggerType,
        bytes calldata triggerData
    ) external returns (uint256 triggerId) {
        FunctionMetadata storage func = functions[functionId];
        if (func.owner == address(0)) revert FunctionNotFound();
        if (func.owner != msg.sender && !hasRole(ADMIN_ROLE, msg.sender)) {
            revert UnauthorizedAccess();
        }

        triggerId = nextTriggerId++;
        
        // Direct storage assignment
        TriggerRule storage trigger = triggers[triggerId];
        trigger.functionId = functionId;
        trigger.triggerType = triggerType;
        trigger.triggerData = triggerData;
        trigger.active = true;
        trigger.lastTriggered = 0;
        trigger.triggerCount = 0;

        emit TriggerAdded(triggerId, functionId);
    }

    /**
     * @dev Fire a trigger (gas optimized)
     */
    function fireTrigger(
        uint256 triggerId,
        bytes calldata /* contextData */
    ) external onlyRole(ADMIN_ROLE) {
        TriggerRule storage trigger = triggers[triggerId];
        if (trigger.functionId == 0) revert TriggerNotFound();
        if (!trigger.active) revert TriggerInactive();

        FunctionMetadata storage func = functions[trigger.functionId];
        if (!func.active) revert FunctionInactive();

        // Unchecked for gas optimization (overflow extremely unlikely)
        unchecked {
            trigger.lastTriggered = uint64(block.timestamp);
            trigger.triggerCount++;
        }

        emit TriggerFired(triggerId, trigger.functionId);
    }

    /**
     * @dev Report function execution (gas optimized)
     */
    function reportExecution(
        uint256 functionId,
        uint256 triggerId,
        bool success,
        bytes calldata /* returnData */,
        uint32 gasUsed,
        string calldata /* errorMessage */
    ) external onlyRole(ADMIN_ROLE) {
        FunctionMetadata storage func = functions[functionId];
        if (func.owner == address(0)) revert FunctionNotFound();

        // Unchecked for gas optimization
        unchecked {
            func.executionCount++;
        }

        // Store minimal execution data
        executionHistory[functionId].push(ExecutionResult({
            timestamp: uint64(block.timestamp),
            gasUsed: gasUsed,
            success: success
        }));

        emit FunctionExecuted(functionId, triggerId, success);
    }

    /**
     * @dev Batch register functions for gas efficiency
     */
    function batchRegisterFunctions(
        string[] calldata names,
        string[] calldata descriptions,
        bytes32[] calldata wasmHashes,
        uint96[] calldata gasLimits,
        string[] calldata runtimes
    ) external returns (uint256[] memory functionIds) {
        uint256 length = names.length;
        require(length == descriptions.length && length == wasmHashes.length &&
                length == gasLimits.length && length == runtimes.length, "Array length mismatch");

        functionIds = new uint256[](length);

        for (uint256 i = 0; i < length;) {
            // Inline function registration for gas efficiency
            if (wasmHashes[i] == bytes32(0)) revert InvalidWasmHash();
            if (gasLimits[i] > MAX_GAS_LIMIT) revert GasLimitExceeded();

            uint256 functionId = nextFunctionId++;
            functionIds[i] = functionId;

            // Direct storage assignment for gas efficiency
            FunctionMetadata storage func = functions[functionId];
            func.wasmHash = wasmHashes[i];
            func.name = names[i];
            func.description = descriptions[i];
            func.owner = msg.sender;
            func.gasLimit = gasLimits[i];
            func.active = true;
            func.createdAt = uint64(block.timestamp);
            func.executionCount = 0;
            func.runtime = runtimes[i];

            emit FunctionRegistered(functionId, msg.sender, wasmHashes[i]);

            unchecked { ++i; }
        }
    }

    /**
     * @dev Get function metadata (view function)
     */
    function getFunction(uint256 functionId) 
        external 
        view 
        returns (FunctionMetadata memory) 
    {
        return functions[functionId];
    }

    /**
     * @dev Get trigger rule (view function)
     */
    function getTrigger(uint256 triggerId) 
        external 
        view 
        returns (TriggerRule memory) 
    {
        return triggers[triggerId];
    }

    /**
     * @dev Get execution count only (gas efficient)
     */
    function getExecutionCount(uint256 functionId) 
        external 
        view 
        returns (uint64) 
    {
        return functions[functionId].executionCount;
    }

    /**
     * @dev Check if function is active (gas efficient)
     */
    function isActive(uint256 functionId) 
        external 
        view 
        returns (bool) 
    {
        return functions[functionId].active;
    }
}
