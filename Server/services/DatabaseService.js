const mongoose = require('mongoose');

const bountySchema = new mongoose.Schema({
  bountyId: Number,
  title: String,
  description: String,
  ipfsHash: String,
  deadline: Number,
  allowedRoles: [String],
  status: String,
  rewardAmount: String,
  creator: String,
  votingEndTime: Number,
  fundsReleased: Boolean,
  winningSubmissionId: Number,
});

const submissionSchema = new mongoose.Schema({
  submissionId: Number,
  bountyId: Number,
  contributor: String,
  ipfsHash: String,
  voteCount: Number,
  timestamp: Number,
  status: String,
});

const fileSchema = new mongoose.Schema({
  filename: String,
  ipfs_hash: String,
  file_size: Number,
  content_type: String,
  uploader_address: String,
  uploaded_at: Date,
});

const userSchema = new mongoose.Schema({
  address: { type: String, unique: true },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

const Bounty = mongoose.model('Bounty', bountySchema);
const Submission = mongoose.model('Submission', submissionSchema);
const File = mongoose.model('File', fileSchema);
const User = mongoose.model('User', userSchema);

class DatabaseService {
  static async connect(uri) {
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  }

  static async addBounty(bounty) {
    return await Bounty.create(bounty);
  }

  static async getBountyById(bountyId) {
    return await Bounty.findOne({ bountyId });
  }

  static async getAllBounties() {
    return await Bounty.find();
  }

  static async updateBounty(bountyId, update) {
    return await Bounty.findOneAndUpdate({ bountyId }, update, { new: true });
  }

  static async addSubmission(submission) {
    return await Submission.create(submission);
  }

  static async getSubmissionsByBountyId(bountyId) {
    return await Submission.find({ bountyId });
  }

  static async getSubmissionById(submissionId) {
    return await Submission.findOne({ submissionId });
  }

  static async updateSubmission(submissionId, update) {
    return await Submission.findOneAndUpdate({ submissionId }, update, { new: true });
  }

  // --- Added methods to match server.js usage ---
  static async createFile(fileMetadata) {
    return await File.create(fileMetadata);
  }

  static async getBounties(status, creator, limit = 50, skip = 0) {
    const query = {};
    if (status) query.status = status;
    if (creator) query.creator = creator;
    return await Bounty.find(query).skip(skip).limit(limit);
  }

  static async searchBounties(search, limit = 50) {
    return await Bounty.find({
      $or: [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ],
    }).limit(limit);
  }

  static async createBounty(bountyData) {
    return await Bounty.create(bountyData);
  }

  static async updateBountyStatus(bountyId, status) {
    return await Bounty.findOneAndUpdate({ bountyId }, { status }, { new: true });
  }

  static async createOrUpdateUser(address) {
    return await User.findOneAndUpdate(
      { address: address.toLowerCase() },
      { address: address.toLowerCase(), updated_at: new Date() },
      { upsert: true, new: true }
    );
  }
}

module.exports = DatabaseService; 