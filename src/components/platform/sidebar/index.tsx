import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
} from '@/src/components/ui/sidebar';
import Link from 'next/link';
import { NewChatButton } from './new-chat-button';
import { PreviousChat } from './previous-chats';
import { SignOutPopOver } from './sign-out-popover';
import { User } from 'next-auth';

export async function AppSidebar({ user }: { user: User | undefined }) {
  return (
    <Sidebar className="rounded-2xl">
      <SidebarHeader className="mt-3 flex items-center justify-center text-center">
        <div className="w-full rounded-2xl p-2 hover:bg-white/10">
          <Link
            href={'/'}
            className="ml-1 bg-white bg-[radial-gradient(100%_100%_at_top_left,#d946ef,white,rgb(74,32,138,.5))] bg-clip-text text-center text-2xl font-semibold tracking-tighter text-transparent md:ml-5 md:text-3xl md:leading-none"
          >
            ModAI
          </Link>
        </div>
        <NewChatButton />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup className="flex gap-y-3">
          <PreviousChat user={user} />
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SignOutPopOver user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}
