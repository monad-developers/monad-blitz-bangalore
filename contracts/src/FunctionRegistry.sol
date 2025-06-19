// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title FunctionRegistry
 * @dev Monad FaaS Function Registry - stores serverless function metadata and triggers
 * @author MonadBot
 */
contract FunctionRegistry is AccessControl, ReentrancyGuard {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant DEVELOPER_ROLE = keccak256("DEVELOPER_ROLE");

    enum TriggerType {
        HTTP_WEBHOOK,
        ON_CHAIN_EVENT,
        PRICE_THRESHOLD,
        TIME_BASED,
        CUSTOM
    }

    struct FunctionMetadata {
        bytes32 wasmHash;           // IPFS hash of WASM bytecode
        string name;                // Function name
        string description;         // Function description
        address owner;              // Function owner
        uint256 gasLimit;           // Max gas limit for execution
        bool active;                // Whether function is active
        uint256 createdAt;          // Creation timestamp
        uint256 executionCount;     // Number of times executed
        string runtime;             // Runtime type (js, python, solidity)
    }

    struct TriggerRule {
        uint256 functionId;         // Associated function ID
        TriggerType triggerType;    // Type of trigger
        bytes triggerData;          // Encoded trigger parameters
        bool active;                // Whether trigger is active
        uint256 lastTriggered;      // Last trigger timestamp
        uint256 triggerCount;       // Number of times triggered
    }

    struct ExecutionResult {
        uint256 functionId;         // Function that was executed
        uint256 triggerId;          // Trigger that fired
        bool success;               // Execution success status
        bytes returnData;           // Function return data
        uint256 gasUsed;            // Gas consumed
        uint256 timestamp;          // Execution timestamp
        string errorMessage;        // Error message if failed
    }

    // Storage
    mapping(uint256 => FunctionMetadata) public functions;
    mapping(uint256 => TriggerRule) public triggers;
    mapping(uint256 => ExecutionResult[]) public executionHistory;
    
    uint256 public nextFunctionId = 1;
    uint256 public nextTriggerId = 1;
    uint256 public maxGasLimit = 5_000_000; // 5M gas limit
    
    // Events
    event FunctionRegistered(
        uint256 indexed functionId,
        address indexed owner,
        string name,
        bytes32 wasmHash
    );
    
    event TriggerAdded(
        uint256 indexed triggerId,
        uint256 indexed functionId,
        TriggerType triggerType
    );
    
    event TriggerFired(
        uint256 indexed triggerId,
        uint256 indexed functionId,
        bytes triggerData
    );
    
    event FunctionExecuted(
        uint256 indexed functionId,
        uint256 indexed triggerId,
        bool success,
        uint256 gasUsed
    );
    
    event FunctionUpdated(
        uint256 indexed functionId,
        bytes32 newWasmHash
    );
    
    event FunctionDeactivated(
        uint256 indexed functionId,
        address indexed owner
    );

    // Custom errors
    error FunctionNotFound(uint256 functionId);
    error TriggerNotFound(uint256 triggerId);
    error UnauthorizedAccess(address caller, uint256 functionId);
    error FunctionInactive(uint256 functionId);
    error TriggerInactive(uint256 triggerId);
    error GasLimitExceeded(uint256 requested, uint256 maximum);
    error InvalidWasmHash(bytes32 hash);

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(DEVELOPER_ROLE, msg.sender);
    }

    /**
     * @dev Register a new serverless function
     * @param name Function name
     * @param description Function description  
     * @param wasmHash IPFS hash of WASM bytecode
     * @param gasLimit Maximum gas limit for execution
     * @param runtime Runtime type (js, python, solidity)
     * @return functionId The unique ID of the registered function
     */
    function registerFunction(
        string calldata name,
        string calldata description,
        bytes32 wasmHash,
        uint256 gasLimit,
        string calldata runtime
    ) external returns (uint256 functionId) {
        if (wasmHash == bytes32(0)) revert InvalidWasmHash(wasmHash);
        if (gasLimit > maxGasLimit) revert GasLimitExceeded(gasLimit, maxGasLimit);

        functionId = nextFunctionId++;
        
        functions[functionId] = FunctionMetadata({
            wasmHash: wasmHash,
            name: name,
            description: description,
            owner: msg.sender,
            gasLimit: gasLimit,
            active: true,
            createdAt: block.timestamp,
            executionCount: 0,
            runtime: runtime
        });

        emit FunctionRegistered(functionId, msg.sender, name, wasmHash);
    }

    /**
     * @dev Add a trigger rule for a function
     * @param functionId Function to trigger
     * @param triggerType Type of trigger
     * @param triggerData Encoded trigger parameters
     * @return triggerId The unique ID of the trigger
     */
    function addTrigger(
        uint256 functionId,
        TriggerType triggerType,
        bytes calldata triggerData
    ) external returns (uint256 triggerId) {
        FunctionMetadata storage func = functions[functionId];
        if (func.owner == address(0)) revert FunctionNotFound(functionId);
        if (func.owner != msg.sender && !hasRole(ADMIN_ROLE, msg.sender)) {
            revert UnauthorizedAccess(msg.sender, functionId);
        }

        triggerId = nextTriggerId++;
        
        triggers[triggerId] = TriggerRule({
            functionId: functionId,
            triggerType: triggerType,
            triggerData: triggerData,
            active: true,
            lastTriggered: 0,
            triggerCount: 0
        });

        emit TriggerAdded(triggerId, functionId, triggerType);
    }

    /**
     * @dev Fire a trigger (callable by orchestrator)
     * @param triggerId Trigger to fire
     * @param contextData Additional context data
     */
    function fireTrigger(
        uint256 triggerId,
        bytes calldata contextData
    ) external onlyRole(ADMIN_ROLE) {
        TriggerRule storage trigger = triggers[triggerId];
        if (trigger.functionId == 0) revert TriggerNotFound(triggerId);
        if (!trigger.active) revert TriggerInactive(triggerId);

        FunctionMetadata storage func = functions[trigger.functionId];
        if (!func.active) revert FunctionInactive(trigger.functionId);

        trigger.lastTriggered = block.timestamp;
        trigger.triggerCount++;

        emit TriggerFired(triggerId, trigger.functionId, contextData);
    }

    /**
     * @dev Report function execution result (callable by orchestrator)
     * @param functionId Function that was executed
     * @param triggerId Trigger that fired
     * @param success Whether execution succeeded
     * @param returnData Function return data
     * @param gasUsed Gas consumed during execution
     * @param errorMessage Error message if failed
     */
    function reportExecution(
        uint256 functionId,
        uint256 triggerId,
        bool success,
        bytes calldata returnData,
        uint256 gasUsed,
        string calldata errorMessage
    ) external onlyRole(ADMIN_ROLE) {
        FunctionMetadata storage func = functions[functionId];
        if (func.owner == address(0)) revert FunctionNotFound(functionId);

        func.executionCount++;

        ExecutionResult memory result = ExecutionResult({
            functionId: functionId,
            triggerId: triggerId,
            success: success,
            returnData: returnData,
            gasUsed: gasUsed,
            timestamp: block.timestamp,
            errorMessage: errorMessage
        });

        executionHistory[functionId].push(result);

        emit FunctionExecuted(functionId, triggerId, success, gasUsed);
    }

    /**
     * @dev Update function WASM hash
     * @param functionId Function to update
     * @param newWasmHash New IPFS hash
     */
    function updateFunction(
        uint256 functionId,
        bytes32 newWasmHash
    ) external {
        FunctionMetadata storage func = functions[functionId];
        if (func.owner == address(0)) revert FunctionNotFound(functionId);
        if (func.owner != msg.sender && !hasRole(ADMIN_ROLE, msg.sender)) {
            revert UnauthorizedAccess(msg.sender, functionId);
        }
        if (newWasmHash == bytes32(0)) revert InvalidWasmHash(newWasmHash);

        func.wasmHash = newWasmHash;
        
        emit FunctionUpdated(functionId, newWasmHash);
    }

    /**
     * @dev Deactivate a function
     * @param functionId Function to deactivate
     */
    function deactivateFunction(uint256 functionId) external {
        FunctionMetadata storage func = functions[functionId];
        if (func.owner == address(0)) revert FunctionNotFound(functionId);
        if (func.owner != msg.sender && !hasRole(ADMIN_ROLE, msg.sender)) {
            revert UnauthorizedAccess(msg.sender, functionId);
        }

        func.active = false;
        
        emit FunctionDeactivated(functionId, func.owner);
    }

    /**
     * @dev Get function execution history
     * @param functionId Function ID
     * @return Array of execution results
     */
    function getExecutionHistory(uint256 functionId) 
        external 
        view 
        returns (ExecutionResult[] memory) 
    {
        return executionHistory[functionId];
    }

    /**
     * @dev Get function metadata
     * @param functionId Function ID
     * @return Function metadata
     */
    function getFunction(uint256 functionId) 
        external 
        view 
        returns (FunctionMetadata memory) 
    {
        return functions[functionId];
    }

    /**
     * @dev Get trigger rule
     * @param triggerId Trigger ID
     * @return Trigger rule
     */
    function getTrigger(uint256 triggerId) 
        external 
        view 
        returns (TriggerRule memory) 
    {
        return triggers[triggerId];
    }

    /**
     * @dev Set maximum gas limit (admin only)
     * @param newLimit New gas limit
     */
    function setMaxGasLimit(uint256 newLimit) external onlyRole(ADMIN_ROLE) {
        maxGasLimit = newLimit;
    }

    /**
     * @dev Grant developer role to address
     * @param developer Address to grant role to
     */
    function grantDeveloperRole(address developer) external onlyRole(ADMIN_ROLE) {
        _grantRole(DEVELOPER_ROLE, developer);
    }

    /**
     * @dev Revoke developer role from address
     * @param developer Address to revoke role from
     */
    function revokeDeveloperRole(address developer) external onlyRole(ADMIN_ROLE) {
        _revokeRole(DEVELOPER_ROLE, developer);
    }
}
