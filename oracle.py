from web3 import Web3
from eth_account import Account
import json
import time
import dotenv
import time
import random

dotenv.load_dotenv()

# Ball outcome constants
BALL_OUTCOMES = {
    "BOUNDARY": 1,  # 4 or 6 runs
    "WICKET": 2,  # Batsman out
    "DOT_BALL": 3,  # 0 runs
    "ONE_RUN": 4,  # 1 run
    "TWO_RUNS": 5,  # 2 runs
    "EXTRAS": 6,  # Wide or No ball
}


def setup_web3(rpc_url, private_key):
    """
    Setup Web3 connection and return web3 instance and account

    Args:
        rpc_url: RPC endpoint URL
        private_key: Private key (with or without 0x)

    Returns:
        tuple: (web3_instance, account_address)
    """
    w3 = Web3(Web3.HTTPProvider(rpc_url))

    if not private_key.startswith("0x"):
        private_key = "0x" + private_key

    account = Account.from_key(private_key)

    if not w3.is_connected():
        raise Exception("Cannot connect to Web3")

    balance = w3.eth.get_balance(account.address)
    print(f"Connected to Web3")
    print(f"Account: {account.address}")
    print(f"Balance: {w3.from_wei(balance, 'ether')} ETH")

    return w3, account


def send_transaction(w3, account, contract_function, gas_limit=None):
    """
    Send a transaction and wait for confirmation

    Args:
        w3: Web3 instance
        account: Account object
        contract_function: Contract function to call
        gas_limit: Optional gas limit

    Returns:
        dict: Transaction result
    """
    try:
        # Get transaction parameters
        nonce = w3.eth.get_transaction_count(account.address)
        gas_price = w3.eth.gas_price

        if gas_limit is None:
            gas_limit = contract_function.estimate_gas({"from": account.address}) * 2

        # Build transaction
        tx = contract_function.build_transaction(
            {
                "from": account.address,
                "gas": gas_limit,
                "gasPrice": gas_price,
                "nonce": nonce,
            }
        )

        # Sign and send
        signed_tx = w3.eth.account.sign_transaction(tx, account.key)
        tx_hash = w3.eth.send_raw_transaction(signed_tx.raw_transaction)

        print(f"Transaction sent: {tx_hash.hex()}")

        # Wait for receipt
        receipt = w3.eth.wait_for_transaction_receipt(tx_hash)

        if receipt.status == 1:
            print(f"✅ Success! Gas used: {receipt.gasUsed}")
            return {"success": True, "tx_hash": tx_hash.hex(), "receipt": receipt}
        else:
            print("❌ Transaction failed")
            return {"success": False, "tx_hash": tx_hash.hex(), "receipt": receipt}

    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return {"success": False, "error": str(e)}


# FACTORY CONTRACT FUNCTIONS


def create_game(w3, account, factory_contract, team_a, team_b, match_id):
    """
    Create a new cricket betting game

    Args:
        w3: Web3 instance
        account: Owner account
        factory_contract: Factory contract instance
        team_a: Team A name
        team_b: Team B name
        match_id: Match ID

    Returns:
        dict: Result with game address if successful
    """
    print(f"\n🏏 Creating game: {team_a} vs {team_b} (ID: {match_id})")

    contract_function = factory_contract.functions.createGame(team_a, team_b, match_id)
    result = send_transaction(w3, account, contract_function)

    print(result)
    if result["success"]:
        # Get game address from logs
        receipt = result["receipt"]
        game_created_event = factory_contract.events.GameCreated().process_receipt(
            receipt
        )

        if game_created_event:
            game_address = game_created_event[0]["args"]["gameAddress"]
            result["game_address"] = game_address
            print(f"🎯 Game created at: {game_address}")

    return result


def remove_game(w3, account, factory_contract, game_address):
    """
    Remove a game from active games
    """
    print(f"\n🗑️ Removing game: {game_address}")

    contract_function = factory_contract.functions.removeGame(game_address)
    return send_transaction(w3, account, contract_function)


def get_active_games(factory_contract):
    """
    Get all active game addresses
    """
    try:
        games = factory_contract.functions.getActiveGames().call()
        print(f"\n📋 Active games: {len(games)}")
        for i, game in enumerate(games):
            print(f"   {i+1}. {game}")
        return games
    except Exception as e:
        print(f"❌ Error getting active games: {str(e)}")
        return []


# GAME CONTRACT FUNCTIONS


def open_ball(w3, account, game_contract, ball_number):
    """
    Open betting for a specific ball

    Args:
        w3: Web3 instance
        account: Owner account
        game_contract: Game contract instance
        ball_number: Ball number (1-120)

    Returns:
        dict: Transaction result
    """
    print(f"\n🟢 Opening ball {ball_number} for betting")

    contract_function = game_contract.functions.openBall(ball_number)
    return send_transaction(w3, account, contract_function)


def close_ball(w3, account, game_contract, ball_number):
    """
    Close betting for a specific ball
    """
    print(f"\n🔴 Closing ball {ball_number}")

    contract_function = game_contract.functions.closeBall(ball_number)
    return send_transaction(w3, account, contract_function)


def report_ball_result(w3, account, game_contract, ball_number, outcome):
    """
    Report the result of a ball

    Args:
        outcome: Use BALL_OUTCOMES constants (1-6)
    """
    outcome_names = {
        1: "BOUNDARY",
        2: "WICKET",
        3: "DOT_BALL",
        4: "ONE_RUN",
        5: "TWO_RUNS",
        6: "EXTRAS",
    }
    outcome_name = outcome_names.get(outcome, "UNKNOWN")

    print(f"\n📊 Reporting ball {ball_number} result: {outcome_name}")

    contract_function = game_contract.functions.reportBallResult(ball_number, outcome)
    return send_transaction(w3, account, contract_function)


def cancel_ball(w3, account, game_contract, ball_number, reason):
    """
    Cancel a ball and refund all bets
    """
    print(f"\n❌ Cancelling ball {ball_number}: {reason}")

    contract_function = game_contract.functions.cancelBall(ball_number, reason)
    return send_transaction(w3, account, contract_function)


def emergency_pause(w3, account, game_contract):
    """
    Trigger emergency pause
    """
    print(f"\n⚠️ Activating emergency pause")

    contract_function = game_contract.functions.emergencyPause()
    return send_transaction(w3, account, contract_function)


# VIEW FUNCTIONS (READ-ONLY)


def get_match_info(game_contract):
    """
    Get match information
    """
    try:
        info = game_contract.functions.getMatchInfo().call()
        match_data = {
            "team_a": info[0],
            "team_b": info[1],
            "match_id": info[2],
            "current_ball": info[3],
            "total_balls": info[4],
        }

        print(f"\n🏏 Match Info:")
        print(f"   Teams: {match_data['team_a']} vs {match_data['team_b']}")
        print(f"   Match ID: {match_data['match_id']}")
        print(
            f"   Progress: {match_data['current_ball']}/{match_data['total_balls']} balls"
        )

        return match_data
    except Exception as e:
        print(f"❌ Error getting match info: {str(e)}")
        return None


def get_ball_info(game_contract, ball_number):
    """
    Get detailed ball information
    """
    try:
        info = game_contract.functions.getBallInfo(ball_number).call()

        states = {0: "CLOSED", 1: "OPEN", 2: "RESOLVED"}
        outcomes = {
            0: "PENDING",
            1: "BOUNDARY",
            2: "WICKET",
            3: "DOT_BALL",
            4: "ONE_RUN",
            5: "TWO_RUNS",
            6: "EXTRAS",
        }

        ball_data = {
            "state": states.get(info[0], "UNKNOWN"),
            "result": outcomes.get(info[1], "UNKNOWN"),
            "total_pool": info[2],
            "bets": {
                "boundary": info[3][0],
                "wicket": info[3][1],
                "dot_ball": info[3][2],
                "one_run": info[3][3],
                "two_runs": info[3][4],
                "extras": info[3][5],
            },
            "bettor_count": info[4],
            "distributed": info[5],
            "refunded": info[6],
        }

        print(f"\n⚾ Ball {ball_number} Info:")
        print(f"   State: {ball_data['state']}")
        print(f"   Result: {ball_data['result']}")
        print(f"   Total Pool: {ball_data['total_pool']} wei")
        print(f"   Bettors: {ball_data['bettor_count']}")

        return ball_data
    except Exception as e:
        print(f"❌ Error getting ball info: {str(e)}")
        return None


def get_contract_balance(w3, contract_address):
    """
    Get contract balance
    """
    try:
        balance = w3.eth.get_balance(contract_address)
        balance_eth = w3.from_wei(balance, "ether")
        print(f"\n💰 Contract Balance: {balance_eth} ETH")
        return balance
    except Exception as e:
        print(f"❌ Error getting balance: {str(e)}")
        return 0


# UTILITY FUNCTIONS


def create_contract_instance(w3, address, abi):
    """
    Create a contract instance
    """
    return w3.eth.contract(address=address, abi=abi)


def load_abi_from_file(file_path):
    """
    Load ABI from JSON file
    """
    with open(file_path, "r") as f:
        data = json.load(f)
        # If the ABI is nested under "abi"
        if "abi" in data:
            return data["abi"]
        else:
            # If the JSON is just the ABI array itself
            return data


# BATCH OPERATIONS


def open_multiple_balls(w3, account, game_contract, start_ball, count):
    """
    Open multiple consecutive balls
    """
    results = []
    for i in range(count):
        ball_num = start_ball + i
        if ball_num <= 120:  # Max balls
            result = open_ball(w3, account, game_contract, ball_num)
            results.append(result)
            if not result["success"]:
                break
            time.sleep(1)  # Small delay between transactions
        else:
            print(f"⚠️ Ball {ball_num} exceeds maximum (120)")
            break
    return results


def complete_ball_sequence(w3, account, game_contract, ball_number, outcome):
    """
    Complete sequence: close ball -> report result
    """
    print(f"\n🔄 Processing ball {ball_number} sequence...")

    # Close the ball
    close_result = close_ball(w3, account, game_contract, ball_number)
    if not close_result["success"]:
        return {"success": False, "error": "Failed to close ball"}

    time.sleep(2)  # Wait a bit between transactions

    # Report result
    result_report = report_ball_result(w3, account, game_contract, ball_number, outcome)

    return {
        "success": result_report["success"],
        "close_tx": close_result["tx_hash"],
        "result_tx": result_report.get("tx_hash"),
    }


RPC_URL = "https://testnet-rpc.monad.xyz"
PRIVATE_KEY = dotenv.get_key(dotenv.find_dotenv(), "PRIVATE_KEY")
FACTORY_ADDRESS = "0x847a4b1A928Ad60a6be4d2A4Db107dEA669cbacF"
FACTORY_ABI = load_abi_from_file("contracts/CricketBettingFactory.json")
GAME_ABI = load_abi_from_file("contracts/CricketBettingGame.json")

# Initialize
w3, account = setup_web3(RPC_URL, PRIVATE_KEY)
factory_contract = create_contract_instance(w3, FACTORY_ADDRESS, FACTORY_ABI)

# Create a game
result = create_game(w3, account, factory_contract, "RCB", "CSK", 214235245)
game_address = result.get("game_address")

# game_address = "0x7e88F447F2C0C072c5Bd35c3e1f0f3A4090A349F"
game_contract = create_contract_instance(w3, game_address, GAME_ABI)

for i in range(1, 6):
    open_ball(w3, account, game_contract, i)
    # contract_function = game_contract.functions.placeBet(i, random.randint(1, 6))
    # send_transaction(w3, account, contract_function)
    time.sleep(5)  # Wait a bit before next operation
    outcome = random.choice(list(BALL_OUTCOMES.values()))
    complete_ball_sequence(w3, account, game_contract, i, outcome)
