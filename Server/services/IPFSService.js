const axios = require('axios');
const FormData = require('form-data');

class IPFSService {
  constructor({ pinataApiKey, pinataSecretKey, pinataJWT, usePinata }) {
    this.pinataApiKey = pinataApiKey;
    this.pinataSecretKey = pinataSecretKey;
    this.pinataJWT = pinataJWT;
    this.usePinata = usePinata;
  }

  async uploadFile(fileBuffer, filename) {
    if (this.usePinata) {
      const url = 'https://api.pinata.cloud/pinning/pinFileToIPFS';
      const data = new FormData();
      data.append('file', fileBuffer, filename);
      const headers = {
        ...data.getHeaders(),
        Authorization: this.pinataJWT ? `Bearer ${this.pinataJWT}` : undefined,
        pinata_api_key: this.pinataApiKey,
        pinata_secret_api_key: this.pinataSecretKey,
      };
      const res = await axios.post(url, data, { headers });
      return res.data.IpfsHash;
    } else {
      // fallback: local IPFS node or web3.storage (not implemented here)
      throw new Error('Only Pinata supported in this template.');
    }
  }
}

module.exports = IPFSService; 