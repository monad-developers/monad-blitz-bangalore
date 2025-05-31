// This file provides a library for managing counters, which can be used for tracking token IDs or other numerical values in a safe manner.

pragma solidity ^0.8.20;

library Counters {
    struct Counter {
        uint256 _value; // default: 0
    }

    function current(Counter storage counter) internal view returns (uint256) {
        return counter._value;
    }

    function increment(Counter storage counter) internal {
        unchecked {
            counter._value += 1;
        }
    }

    function decrement(Counter storage counter) internal {
        require(counter._value > 0, "Counter: decrement overflow");
        unchecked {
            counter._value -= 1;
        }
    }

    function reset(Counter storage counter) internal {
        counter._value = 0;
    }
}