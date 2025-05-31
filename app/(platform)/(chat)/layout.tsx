import { auth } from '@/app/(auth)/auth';
import { AppSidebar } from '@/src/components/platform/sidebar';
import { SidebarInset, SidebarProvider } from '@/src/components/ui/sidebar';
import { cookies } from 'next/headers';
import React from 'react';

export default async function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [session, cookieStore] = await Promise.all([auth(), cookies()]);
  const isCollapsed = cookieStore.get('sidebar:state')?.value !== 'true';
  return (
    <SidebarProvider defaultOpen={!isCollapsed}>
      <AppSidebar user={session?.user} />
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}
