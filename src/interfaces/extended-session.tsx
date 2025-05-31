import type { Session, User } from 'next-auth';

export interface ExtendedUser extends User {
  id: string;
}

export interface ExtendedSession extends Session {
  user: ExtendedUser;
}
