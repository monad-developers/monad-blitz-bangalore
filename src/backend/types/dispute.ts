export type DisputeType = 'payment' | 'work' | 'other';
export type UserRole = 'client' | 'freelancer' | 'arbitrator';

export interface Message {
  id: string;
  sender: string;
  content: string;
  timestamp: Date;
  role: UserRole;
  disputeId?: string;
}

export interface Dispute {
  id: string;
  disputeWith: string;
  disputeType: DisputeType;
  description: string;
  createdBy: string;
  messages: Message[];
}
