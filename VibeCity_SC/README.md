# Launch Pass Project

## Overview
The Launch Pass Project is a smart contract system built on the Ethereum blockchain that implements ERC-1155 tokens. It provides a versatile solution for managing various utility tokens, including discount tokens, creator share tokens, and badge NFTs. This project includes a factory contract for deploying new instances of the LaunchPass contract, allowing for easy management and scalability.

## Features
- **ERC-1155 Token Implementation**: The LaunchPass contract supports multiple token types, enabling the creation of various utility tokens.
- **Minting and Transferring**: Users can mint new tokens and transfer them seamlessly between accounts.
- **Factory Contract**: The LaunchPassFactory contract allows for the deployment of new LaunchPass instances, facilitating the creation of unique token sets.

## Project Structure
```
launch-pass-project
├── src
│   ├── LaunchPass.sol          # ERC-1155 token implementation
│   ├── LaunchPassFactory.sol    # Factory contract for LaunchPass
│   ├── interfaces
│   │   ├── ILaunchPass.sol      # Interface for LaunchPass
│   │   └── ILaunchPassFactory.sol # Interface for LaunchPassFactory
│   └── utils
│       └── Counters.sol         # Utility library for managing counters
├── test
│   ├── LaunchPass.t.sol         # Test cases for LaunchPass
│   └── LaunchPassFactory.t.sol   # Test cases for LaunchPassFactory
├── script
│   └── DeployLaunchPass.s.sol   # Deployment script for contracts
├── foundry.toml                 # Configuration file for Foundry
└── README.md                    # Project documentation
```

## Setup Instructions
1. **Clone the Repository**: 
   ```
   git clone <repository-url>
   cd launch-pass-project
   ```

2. **Install Dependencies**: 
   Ensure you have Foundry installed. Run the following command to install necessary dependencies:
   ```
   forge install
   ```

3. **Compile the Contracts**: 
   Use the following command to compile the smart contracts:
   ```
   forge build
   ```

4. **Run Tests**: 
   Execute the test suite to ensure everything is functioning correctly:
   ```
   forge test
   ```

5. **Deploy Contracts**: 
   Use the deployment script to deploy the contracts to the blockchain:
   ```
   forge script script/DeployLaunchPass.s.sol --broadcast
   ```

## Usage Guidelines
- After deploying the contracts, you can interact with the LaunchPass and LaunchPassFactory contracts through their respective interfaces.
- Use the minting functions to create new tokens and manage them as needed.

## License
This project is licensed under the MIT License. See the LICENSE file for more details.