from web3 import Web3
from eth_account import Account
import dotenv

dotenv.load_dotenv()

RPC_URL = "https://testnet-rpc.monad.xyz"
PRIVATE_KEY = dotenv.get_key(dotenv.find_dotenv(), "PRIVATE_KEY")
FACTORY_ADDRESS = "0x569da0B61295Fd6687eA3317eFCfd23F427C2418"

w3 = Web3(Web3.HTTPProvider(RPC_URL))
account = Account.from_key(PRIVATE_KEY)

# Amount to send (in wei)
amount_in_eth = 0.1  # Example: 0.1 MON
amount_in_wei = w3.to_wei(amount_in_eth, "ether")

# Get nonce and gas price
nonce = w3.eth.get_transaction_count(account.address)
gas_price = w3.eth.gas_price

# Build transaction
tx = {
    "to": FACTORY_ADDRESS,
    "value": amount_in_wei,
    "gas": 100000,
    "gasPrice": gas_price,
    "nonce": nonce,
}

# Sign and send
signed_tx = w3.eth.account.sign_transaction(tx, account.key)
tx_hash = w3.eth.send_raw_transaction(signed_tx.raw_transaction)

print(f"Transaction sent: {tx_hash.hex()}")

# Wait for confirmation (optional)
receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
print(f"✅ Transaction confirmed in block {receipt.blockNumber}")
