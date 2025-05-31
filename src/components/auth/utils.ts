'use server';

import { signOut } from '@/app/(auth)/auth';

export const handleSignout = async () => {
  await signOut({
    redirectTo: '/',
  });
};
