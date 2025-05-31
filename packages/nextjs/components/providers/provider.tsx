// in app/providers.tsx

"use client";

import type { Session } from "next-auth";
import { SessionProvider } from "next-auth/react";

// THIS WILL WORK

export default function Providers({ children, session }: any) {
  return <SessionProvider session={session}>{children}</SessionProvider>;
}
