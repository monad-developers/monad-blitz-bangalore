import { Dispute, Message } from '../types/dispute';

class DisputeService {
  private disputes: Map<string, Dispute> = new Map();

  createDispute(dispute: Dispute): Dispute {
    this.disputes.set(dispute.id, {
      ...dispute,
      messages: []
    });
    return dispute;
  }

  addMessage(disputeId: string, message: Message): Message | null {
    const dispute = this.disputes.get(disputeId);
    if (!dispute) return null;

    dispute.messages.push(message);
    return message;
  }

  getDispute(disputeId: string): Dispute | null {
    return this.disputes.get(disputeId) || null;
  }

  getDisputesByUser(userAddress: string): Dispute[] {
    return Array.from(this.disputes.values()).filter(
      dispute => dispute.createdBy === userAddress || dispute.disputeWith === userAddress
    );
  }
}

export const disputeService = new DisputeService();
