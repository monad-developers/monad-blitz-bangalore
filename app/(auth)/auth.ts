import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import GitHubProvider from 'next-auth/providers/github';
import { authConfig } from './auth.config';
import { createUserWithOauth, getUser } from '@/src/database/queries';
import {
  ExtendedSession,
  ExtendedUser,
} from '@/src/interfaces/extended-session';
import { compare } from 'bcrypt-ts';

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {},
      async authorize({ email, password }: any) {
        const users = await getUser(email);
        if (users.length === 0) return null;

        const user = users[0];
        const passwordsMatch = await compare(password, user.password!);
        if (!passwordsMatch) return null;

        return {
          id: user.id,
          email: user.email,
        };
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
  ],
  secret: process.env.AUTH_SECRET,
  callbacks: {
    async jwt({ token, user, account }) {
      if (user && account?.provider !== 'credentials') {
        const [existingUser] = await getUser(user.email!);

        if (!existingUser) {
          const newUser = await createUserWithOauth(user.email!);
          token.id = newUser.id;
        } else {
          token.id = existingUser.id;
        }
      } else if (user) {
        token.id = user.id;
      }

      return token;
    },
    async session({ session, token }) {
      (session.user as ExtendedUser).id = token.id as string;
      return session as ExtendedSession;
    },
  },
});
