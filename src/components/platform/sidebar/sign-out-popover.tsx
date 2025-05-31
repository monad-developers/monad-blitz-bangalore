'use client';

import Image from 'next/image';
import { Popover, PopoverContent, PopoverTrigger } from '../../ui/popover';
import { SidebarMenu, SidebarMenuItem } from '../../ui/sidebar';
import { Button } from '../../ui/button';
import { LogOut } from 'lucide-react';
import { User } from 'next-auth';
import { handleSignout } from '../../auth/utils';

export const SignOutPopOver = ({ user }: { user: User | undefined }) => {
  return user ? (
    <SidebarMenu>
      <SidebarMenuItem>
        <div className="flex flex-col items-start gap-y-6 group-data-[collapsible=icon]:hidden">
          <div>
            <Popover>
              <PopoverTrigger>
                <Button className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground cursor-pointer">
                  {user.image && (
                    <Image
                      src={user.image}
                      alt="user Image"
                      width={30}
                      height={30}
                      className="rounded-full"
                    />
                  )}
                  <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                    <span className="truncate font-semibold">{user.name}</span>
                    <span className="truncate text-white/15">{user.email}</span>
                  </div>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="h-36 bg-gradient-to-r from-orange-400 to-violet-400">
                <div className="grid flex-1 text-left text-base leading-tight text-black group-data-[collapsible=icon]:hidden">
                  {user.image && (
                    <Image
                      src={user.image}
                      alt="user Image"
                      width={30}
                      height={30}
                      className="rounded-full"
                    />
                  )}
                  <span className="truncate font-semibold">{user.name}</span>
                  <span className="truncate text-black/70">{user.email}</span>
                </div>
                <Button
                  variant={'fushia'}
                  size={'default'}
                  className="mt-2"
                  onClick={handleSignout}
                >
                  <LogOut />
                  <span>Sign Out</span>
                </Button>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </SidebarMenuItem>
    </SidebarMenu>
  ) : null;
};
