const { Web3 } = require('web3');

class BlockchainService {
  constructor(providerUrl, privateKey, contractAddress, contractAbi) {
    this.web3 = new Web3(providerUrl);
    this.account = this.web3.eth.accounts.privateKeyToAccount(privateKey);
    this.web3.eth.accounts.wallet.add(this.account);
    this.contract = new this.web3.eth.Contract(contractAbi, contractAddress);
  }

  async getBounty(bountyId) {
    return await this.contract.methods.getBounty(bountyId).call();
  }

  async getBounties(total) {
    const bounties = [];
    for (let i = 0; i < total; i++) {
      try {
        const bounty = await this.getBounty(i);
        bounties.push(bounty);
      } catch (e) {}
    }
    return bounties;
  }

  async getTotalBounties() {
    return await this.contract.methods.getTotalBounties().call();
  }

  async getBountySubmissions(bountyId) {
    return await this.contract.methods.getBountySubmissions(bountyId).call();
  }

  async getSubmission(submissionId) {
    return await this.contract.methods.getSubmission(submissionId).call();
  }

  async submitWork(bountyId, ipfsHash) {
    return await this.contract.methods.submitWork(bountyId, ipfsHash).send({ from: this.account.address });
  }

  async startVotingPhase(bountyId) {
    return await this.contract.methods.startVotingPhase(bountyId).send({ from: this.account.address });
  }

  async voteOnSubmission(bountyId, submissionId) {
    return await this.contract.methods.voteOnSubmission(bountyId, submissionId).send({ from: this.account.address });
  }

  async selectWinnerAndPayout(bountyId) {
    return await this.contract.methods.selectWinnerAndPayout(bountyId).send({ from: this.account.address });
  }
}

module.exports = BlockchainService; 