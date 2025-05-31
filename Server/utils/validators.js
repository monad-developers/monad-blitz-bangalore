function validateAddress(address) {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

function validateBountyData(data) {
  return data && data.title && data.description && data.ipfsHash && data.deadline;
}

module.exports = { validateAddress, validateBountyData }; 