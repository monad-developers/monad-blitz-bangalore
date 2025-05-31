// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/FunctionRegistry.sol";

contract FunctionRegistryTest is Test {
    FunctionRegistry public registry;
    address public admin = address(0x1);
    address public developer = address(0x2);
    address public user = address(0x3);
    
    bytes32 constant WASM_HASH = keccak256("test_wasm_hash");
    string constant FUNCTION_NAME = "hello_world";
    string constant FUNCTION_DESC = "A simple hello world function";
    uint256 constant GAS_LIMIT = 1_000_000;
    string constant RUNTIME = "javascript";

    event FunctionRegistered(
        uint256 indexed functionId,
        address indexed owner,
        string name,
        bytes32 wasmHash
    );
    
    event TriggerAdded(
        uint256 indexed triggerId,
        uint256 indexed functionId,
        FunctionRegistry.TriggerType triggerType
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

    function setUp() public {
        registry = new FunctionRegistry();
        
        // Grant roles
        registry.grantRole(registry.ADMIN_ROLE(), admin);
        registry.grantRole(registry.DEVELOPER_ROLE(), developer);
        
        // Label addresses for better trace output
        vm.label(admin, "Admin");
        vm.label(developer, "Developer");
        vm.label(user, "User");
    }

    function testRegisterFunction() public {
        vm.startPrank(developer);
        
        // Expect event emission
        vm.expectEmit(true, true, false, true);
        emit FunctionRegistered(1, developer, FUNCTION_NAME, WASM_HASH);
        
        uint256 functionId = registry.registerFunction(
            FUNCTION_NAME,
            FUNCTION_DESC,
            WASM_HASH,
            GAS_LIMIT,
            RUNTIME
        );
        
        assertEq(functionId, 1);
        
        // Verify function data
        FunctionRegistry.FunctionMetadata memory func = registry.getFunction(functionId);
        assertEq(func.wasmHash, WASM_HASH);
        assertEq(func.name, FUNCTION_NAME);
        assertEq(func.description, FUNCTION_DESC);
        assertEq(func.owner, developer);
        assertEq(func.gasLimit, GAS_LIMIT);
        assertTrue(func.active);
        assertEq(func.runtime, RUNTIME);
        assertEq(func.executionCount, 0);
        
        vm.stopPrank();
    }

    function testRegisterFunctionWithInvalidWasmHash() public {
        vm.prank(developer);
        
        vm.expectRevert(abi.encodeWithSelector(
            FunctionRegistry.InvalidWasmHash.selector,
            bytes32(0)
        ));
        
        registry.registerFunction(
            FUNCTION_NAME,
            FUNCTION_DESC,
            bytes32(0), // Invalid hash
            GAS_LIMIT,
            RUNTIME
        );
    }

    function testRegisterFunctionWithExcessiveGasLimit() public {
        vm.prank(developer);
        
        uint256 excessiveGas = 10_000_000; // Exceeds default 5M limit
        
        vm.expectRevert(abi.encodeWithSelector(
            FunctionRegistry.GasLimitExceeded.selector,
            excessiveGas,
            5_000_000
        ));
        
        registry.registerFunction(
            FUNCTION_NAME,
            FUNCTION_DESC,
            WASM_HASH,
            excessiveGas,
            RUNTIME
        );
    }

    function testAddTrigger() public {
        // First register a function
        vm.prank(developer);
        uint256 functionId = registry.registerFunction(
            FUNCTION_NAME,
            FUNCTION_DESC,
            WASM_HASH,
            GAS_LIMIT,
            RUNTIME
        );
        
        // Add trigger
        vm.prank(developer);
        bytes memory triggerData = abi.encode("price > 100");
        
        vm.expectEmit(true, true, false, true);
        emit TriggerAdded(1, functionId, FunctionRegistry.TriggerType.PRICE_THRESHOLD);
        
        uint256 triggerId = registry.addTrigger(
            functionId,
            FunctionRegistry.TriggerType.PRICE_THRESHOLD,
            triggerData
        );
        
        assertEq(triggerId, 1);
        
        // Verify trigger data
        FunctionRegistry.TriggerRule memory trigger = registry.getTrigger(triggerId);
        assertEq(trigger.functionId, functionId);
        assertEq(uint256(trigger.triggerType), uint256(FunctionRegistry.TriggerType.PRICE_THRESHOLD));
        assertEq(trigger.triggerData, triggerData);
        assertTrue(trigger.active);
        assertEq(trigger.triggerCount, 0);
    }

    function testAddTriggerUnauthorized() public {
        // Register function as developer
        vm.prank(developer);
        uint256 functionId = registry.registerFunction(
            FUNCTION_NAME,
            FUNCTION_DESC,
            WASM_HASH,
            GAS_LIMIT,
            RUNTIME
        );
        
        // Try to add trigger as different user
        vm.prank(user);
        bytes memory triggerData = abi.encode("price > 100");
        
        vm.expectRevert(abi.encodeWithSelector(
            FunctionRegistry.UnauthorizedAccess.selector,
            user,
            functionId
        ));
        
        registry.addTrigger(
            functionId,
            FunctionRegistry.TriggerType.PRICE_THRESHOLD,
            triggerData
        );
    }

    function testFireTrigger() public {
        // Setup function and trigger
        vm.startPrank(developer);
        uint256 functionId = registry.registerFunction(
            FUNCTION_NAME,
            FUNCTION_DESC,
            WASM_HASH,
            GAS_LIMIT,
            RUNTIME
        );
        
        bytes memory triggerData = abi.encode("price > 100");
        uint256 triggerId = registry.addTrigger(
            functionId,
            FunctionRegistry.TriggerType.PRICE_THRESHOLD,
            triggerData
        );
        vm.stopPrank();
        
        // Fire trigger as admin
        vm.prank(admin);
        bytes memory contextData = abi.encode("price = 150");
        
        vm.expectEmit(true, true, false, true);
        emit TriggerFired(triggerId, functionId, contextData);
        
        registry.fireTrigger(triggerId, contextData);
        
        // Verify trigger was updated
        FunctionRegistry.TriggerRule memory trigger = registry.getTrigger(triggerId);
        assertEq(trigger.triggerCount, 1);
        assertGt(trigger.lastTriggered, 0);
    }

    function testReportExecution() public {
        // Setup function
        vm.prank(developer);
        uint256 functionId = registry.registerFunction(
            FUNCTION_NAME,
            FUNCTION_DESC,
            WASM_HASH,
            GAS_LIMIT,
            RUNTIME
        );
        
        // Setup trigger
        vm.prank(developer);
        uint256 triggerId = registry.addTrigger(
            functionId,
            FunctionRegistry.TriggerType.HTTP_WEBHOOK,
            abi.encode("http://example.com/webhook")
        );
        
        // Report execution as admin
        vm.prank(admin);
        bytes memory returnData = abi.encode("Hello, World!");
        uint256 gasUsed = 50_000;
        
        vm.expectEmit(true, true, false, true);
        emit FunctionExecuted(functionId, triggerId, true, gasUsed);
        
        registry.reportExecution(
            functionId,
            triggerId,
            true,
            returnData,
            gasUsed,
            ""
        );
        
        // Verify execution was recorded
        FunctionRegistry.FunctionMetadata memory func = registry.getFunction(functionId);
        assertEq(func.executionCount, 1);
        
        FunctionRegistry.ExecutionResult[] memory history = registry.getExecutionHistory(functionId);
        assertEq(history.length, 1);
        assertEq(history[0].functionId, functionId);
        assertEq(history[0].triggerId, triggerId);
        assertTrue(history[0].success);
        assertEq(history[0].returnData, returnData);
        assertEq(history[0].gasUsed, gasUsed);
    }

    function testUpdateFunction() public {
        // Register function
        vm.prank(developer);
        uint256 functionId = registry.registerFunction(
            FUNCTION_NAME,
            FUNCTION_DESC,
            WASM_HASH,
            GAS_LIMIT,
            RUNTIME
        );
        
        // Update function
        vm.prank(developer);
        bytes32 newWasmHash = keccak256("updated_wasm_hash");
        
        vm.expectEmit(true, false, false, true);
        emit FunctionUpdated(functionId, newWasmHash);
        
        registry.updateFunction(functionId, newWasmHash);
        
        // Verify update
        FunctionRegistry.FunctionMetadata memory func = registry.getFunction(functionId);
        assertEq(func.wasmHash, newWasmHash);
    }

    function testDeactivateFunction() public {
        // Register function
        vm.prank(developer);
        uint256 functionId = registry.registerFunction(
            FUNCTION_NAME,
            FUNCTION_DESC,
            WASM_HASH,
            GAS_LIMIT,
            RUNTIME
        );
        
        // Deactivate function
        vm.prank(developer);
        
        vm.expectEmit(true, true, false, false);
        emit FunctionDeactivated(functionId, developer);
        
        registry.deactivateFunction(functionId);
        
        // Verify deactivation
        FunctionRegistry.FunctionMetadata memory func = registry.getFunction(functionId);
        assertFalse(func.active);
    }

    function testAdminCanManageMaxGasLimit() public {
        uint256 newLimit = 10_000_000;
        
        vm.prank(admin);
        registry.setMaxGasLimit(newLimit);
        
        assertEq(registry.maxGasLimit(), newLimit);
    }

    function testAdminCanGrantRoles() public {
        vm.prank(admin);
        registry.grantDeveloperRole(user);
        
        assertTrue(registry.hasRole(registry.DEVELOPER_ROLE(), user));
    }

    function testMultipleFunctionRegistrations() public {
        vm.startPrank(developer);
        
        // Register multiple functions
        for (uint256 i = 0; i < 5; i++) {
            string memory name = string(abi.encodePacked("function_", vm.toString(i)));
            bytes32 hash = keccak256(abi.encodePacked("hash_", i));
            
            uint256 functionId = registry.registerFunction(
                name,
                FUNCTION_DESC,
                hash,
                GAS_LIMIT,
                RUNTIME
            );
            
            assertEq(functionId, i + 1);
        }
        
        vm.stopPrank();
        
        // Verify next function ID
        assertEq(registry.nextFunctionId(), 6);
    }

    function testEventEmissionOnRegistration() public {
        vm.prank(developer);
        
        // Record logs
        vm.recordLogs();
        
        uint256 functionId = registry.registerFunction(
            FUNCTION_NAME,
            FUNCTION_DESC,
            WASM_HASH,
            GAS_LIMIT,
            RUNTIME
        );
        
        Vm.Log[] memory logs = vm.getRecordedLogs();
        assertEq(logs.length, 1);
        
        // Verify event topics
        assertEq(logs[0].topics[0], keccak256("FunctionRegistered(uint256,address,string,bytes32)"));
        assertEq(logs[0].topics[1], bytes32(functionId));
        assertEq(logs[0].topics[2], bytes32(uint256(uint160(developer))));
    }

    function testFuzzRegisterFunction(
        uint256 gasLimit,
        bytes32 wasmHash
    ) public {
        // Bound inputs to valid ranges
        gasLimit = bound(gasLimit, 1, 5_000_000);
        vm.assume(wasmHash != bytes32(0));
        
        vm.prank(developer);
        
        uint256 functionId = registry.registerFunction(
            FUNCTION_NAME,
            FUNCTION_DESC,
            wasmHash,
            gasLimit,
            RUNTIME
        );
        
        FunctionRegistry.FunctionMetadata memory func = registry.getFunction(functionId);
        assertEq(func.wasmHash, wasmHash);
        assertEq(func.gasLimit, gasLimit);
        assertTrue(func.active);
    }

    function testTriggerTypesEnum() public {
        // Test all trigger types can be used
        vm.prank(developer);
        uint256 functionId = registry.registerFunction(
            FUNCTION_NAME,
            FUNCTION_DESC,
            WASM_HASH,
            GAS_LIMIT,
            RUNTIME
        );
        
        vm.startPrank(developer);
        
        // Test each trigger type
        uint256 triggerId1 = registry.addTrigger(
            functionId,
            FunctionRegistry.TriggerType.HTTP_WEBHOOK,
            abi.encode("webhook_data")
        );
        
        uint256 triggerId2 = registry.addTrigger(
            functionId,
            FunctionRegistry.TriggerType.ON_CHAIN_EVENT,
            abi.encode("event_data")
        );
        
        uint256 triggerId3 = registry.addTrigger(
            functionId,
            FunctionRegistry.TriggerType.PRICE_THRESHOLD,
            abi.encode("price_data")
        );
        
        uint256 triggerId4 = registry.addTrigger(
            functionId,
            FunctionRegistry.TriggerType.TIME_BASED,
            abi.encode("time_data")
        );
        
        uint256 triggerId5 = registry.addTrigger(
            functionId,
            FunctionRegistry.TriggerType.CUSTOM,
            abi.encode("custom_data")
        );
        
        vm.stopPrank();
        
        // Verify all triggers were created
        assertEq(triggerId1, 1);
        assertEq(triggerId2, 2);
        assertEq(triggerId3, 3);
        assertEq(triggerId4, 4);
        assertEq(triggerId5, 5);
    }
}
