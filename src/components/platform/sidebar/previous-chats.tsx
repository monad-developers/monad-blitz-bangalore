'use client';

import { useParams, usePathname, useRouter } from 'next/navigation';
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '../../ui/sidebar';
import useSWR from 'swr';
import { Chat } from '@/prisma/generated/prisma';
import { dataFetcher } from '@/src/lib/utils';
import { memo, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { GroupedChats } from '@/src/types/grouped-chats';
import { isToday, isYesterday, subMonths, subWeeks } from 'date-fns';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../ui/dropdown-menu';
import { MoreHorizontalIcon, PencilLineIcon, TrashIcon } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../ui/alert-dialog';
import { User } from 'next-auth';
import { Skeleton } from '../../ui/skeleton';

const PureChatItem = ({
  chat,
  isActive,
  onDelete,
  onRename,
  setOpenMobile,
}: {
  chat: Chat;
  isActive: boolean;
  onDelete: (chatId: string) => void;
  onRename: (chatId: string) => void;
  setOpenMobile: (open: boolean) => void;
}) => {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={isActive}>
        <Link href={`/chat/${chat.id}`} onClick={() => setOpenMobile(false)}>
          <span>{chat.title}</span>
        </Link>
      </SidebarMenuButton>

      <DropdownMenu modal={true}>
        <DropdownMenuTrigger asChild className="cursor-pointer">
          <SidebarMenuAction
            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground mr-0.5"
            showOnHover={!isActive}
          >
            <MoreHorizontalIcon />
            <span className="sr-only">More</span>
          </SidebarMenuAction>
        </DropdownMenuTrigger>

        <DropdownMenuContent side="bottom" align="end">
          <DropdownMenuItem
            className="cursor-pointer"
            onSelect={() => onRename(chat.id)}
          >
            <PencilLineIcon />
            <span>Rename</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="focus:bg-destructive/15 focus:text-destructive cursor-pointer text-red-500"
            onSelect={() => onDelete(chat.id)}
          >
            <TrashIcon />
            <span>Delete</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  );
};

export const ChatItem = memo(PureChatItem, (prevProps, nextProps) => {
  if (prevProps.isActive !== nextProps.isActive) return false;
  return true;
});

const PreviousChat = ({ user }: { user: User | undefined }) => {
  const router = useRouter();
  const { setOpenMobile } = useSidebar();
  //get chat id from params
  const { chatId } = useParams();
  //get pathname
  const pathname = usePathname();
  //set id to delete
  const [deletingId, setDeletingId] = useState<string | null>(null);
  //set id to rename
  const [renamingId, setRenamingId] = useState<string | null>(null);
  //set dialog for deleting
  const [DeleteDialog, setDeleteDialog] = useState(false);
  //set dialog for renaming
  const [renameDialog, setRenameDialog] = useState(false);
  //rename title
  const [renameTitle, setRenameTitle] = useState<string>('');

  const skeletonCount = Math.floor(Math.random() * 4) + 2;
  //swr for data fetching , empty array as fallback
  const {
    data: history,
    isLoading,
    mutate,
  } = useSWR<Array<Chat>>(user ? `/api/history` : null, dataFetcher, {
    fallbackData: [],
  });
  //refresh every time site loads and reloads
  useEffect(() => {
    mutate();
  }, [pathname, mutate]);
  //api call to delete chat
  const groupChats = (chats: Chat[] = []): GroupedChats => {
    const now = new Date();
    const oneWeekAgo = subWeeks(now, 1);
    const oneMonthAgo = subMonths(now, 1);

    return chats.reduce(
      (groups, chat) => {
        const chatDate = new Date(chat.createdAt);
        if (isToday(chatDate)) {
          groups.today.push(chat);
        } else if (isYesterday(chatDate)) {
          groups.yesterday.push(chat);
        } else if (chatDate > oneWeekAgo) {
          groups.lastWeek.push(chat);
        } else if (chatDate > oneMonthAgo) {
          groups.lastMonth.push(chat);
        } else {
          groups.older.push(chat);
        }
        return groups;
      },
      {
        today: [],
        yesterday: [],
        lastWeek: [],
        lastMonth: [],
        older: [],
      } as GroupedChats,
    );
  };

  const handleDelete = async () => {
    const deleteHandle = fetch(`/api/delete?id=${deletingId}`, {
      method: 'DELETE',
    });
    //await toast on response of call
    toast.promise(deleteHandle, {
      loading: 'Deleting Chat...',
      success: () => {
        mutate((history) => {
          if (history) {
            return history.filter((h) => h.id !== deletingId);
          }
        });
        return 'Chat deleted sucessfully';
      },
      error: 'Failed to delete chat',
    });
    //set the delete dialog and push to new chat if user is on the deleted chat
    setDeleteDialog(false);
    if (deletingId === chatId) {
      router.push('/chat');
    }
  };
  const handleRename = async () => {
    const renameHandle = fetch(`/api/rename?id=${renamingId}`, {
      method: 'PUT',
      body: JSON.stringify({ newTitle: renameTitle }),
    });

    toast.promise(renameHandle, {
      loading: 'Renaming Chat...',
      success: () => {
        mutate((history) => {
          if (history) {
            return history.filter((h) => h.id !== chatId);
          }
        });
        return 'Chat Renamed sucessfully';
      },
      error: 'Failed to rename chat',
    });
    setRenameDialog(false);
  };
  //if user hasn't logged in
  if (!user) {
    return (
      <SidebarGroup>
        <SidebarGroupContent>
          <div className="flex w-full flex-row items-center justify-center gap-2 px-2 text-sm text-zinc-500">
            Login to see your previous chat
          </div>
        </SidebarGroupContent>
      </SidebarGroup>
    );
  }
  //if chat are still loading
  if (isLoading) {
    return (
      <SidebarGroup>
        <SidebarGroupContent className="flex flex-col items-center justify-center space-y-4">
          {[...Array(skeletonCount)].map((_, idx) => (
            <div key={idx} className="flex flex-col items-center space-y-2">
              <Skeleton className="h-6 w-32 bg-gray-200/15" />
              <div className="flex items-center space-x-4">
                <div className="space-y-2">
                  <Skeleton className="h-3 w-10 bg-gray-200/10" />
                  <Skeleton className="h-3 w-10 bg-gray-200/10" />
                </div>
              </div>
            </div>
          ))}
        </SidebarGroupContent>
      </SidebarGroup>
    );
  }
  //if no previous chat history
  if (history?.length === 0) {
    return (
      <SidebarGroup>
        <SidebarGroupContent>
          <div className="flex w-full flex-row items-center justify-center gap-2 px-2 text-sm text-zinc-500">
            No previous chats
          </div>
        </SidebarGroupContent>
      </SidebarGroup>
    );
  }

  return (
    <>
      <SidebarGroup>
        <SidebarGroupLabel className="flex items-center justify-center">
          <div className="text-lg font-semibold">Chat History</div>
        </SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {history &&
              (() => {
                const groupedChats = groupChats(
                  Array.isArray(history) ? history : [],
                );

                return (
                  <>
                    {groupedChats.today.length > 0 && (
                      <>
                        <div className="text-sidebar-foreground/50 px-2 py-1 text-xs">
                          Today
                        </div>
                        {groupedChats.today.map((chat) => (
                          <ChatItem
                            key={chat.id}
                            chat={chat}
                            isActive={chat.id === chatId}
                            onRename={(chatId: string) => {
                              setRenameTitle(chat.title);
                              setRenamingId(chatId);
                              setRenameDialog(true);
                            }}
                            onDelete={(chatId: string) => {
                              setDeletingId(chatId);
                              setDeleteDialog(true);
                            }}
                            setOpenMobile={setOpenMobile}
                          />
                        ))}
                      </>
                    )}

                    {groupedChats.yesterday.length > 0 && (
                      <>
                        <div className="text-sidebar-foreground/50 mt-6 px-2 py-1 text-xs">
                          Yesterday
                        </div>
                        {groupedChats.yesterday.map((chat) => (
                          <ChatItem
                            key={chat.id}
                            chat={chat}
                            isActive={chat.id === chatId}
                            onRename={(chatId: string) => {
                              setRenameTitle(chat.title);
                              setRenamingId(chatId);
                              setRenameDialog(true);
                            }}
                            onDelete={(chatId) => {
                              setDeletingId(chatId);
                              setDeleteDialog(true);
                            }}
                            setOpenMobile={setOpenMobile}
                          />
                        ))}
                      </>
                    )}

                    {groupedChats.lastWeek.length > 0 && (
                      <>
                        <div className="text-sidebar-foreground/50 mt-6 px-2 py-1 text-xs">
                          Last 7 days
                        </div>
                        {groupedChats.lastWeek.map((chat) => (
                          <ChatItem
                            key={chat.id}
                            chat={chat}
                            isActive={chat.id === chatId}
                            onRename={(chatId: string) => {
                              setRenameTitle(chat.title);
                              setRenamingId(chatId);
                              setRenameDialog(true);
                            }}
                            onDelete={(chatId) => {
                              setDeletingId(chatId);
                              setDeleteDialog(true);
                            }}
                            setOpenMobile={setOpenMobile}
                          />
                        ))}
                      </>
                    )}

                    {groupedChats.lastMonth.length > 0 && (
                      <>
                        <div className="text-sidebar-foreground/50 mt-6 px-2 py-1 text-xs">
                          Last 30 days
                        </div>
                        {groupedChats.lastMonth.map((chat) => (
                          <ChatItem
                            key={chat.id}
                            chat={chat}
                            isActive={chat.id === chatId}
                            onRename={(chatId: string) => {
                              setRenameTitle(chat.title);
                              setRenamingId(chatId);
                              setRenameDialog(true);
                            }}
                            onDelete={(chatId) => {
                              setDeletingId(chatId);
                              setDeleteDialog(true);
                            }}
                            setOpenMobile={setOpenMobile}
                          />
                        ))}
                      </>
                    )}

                    {groupedChats.older.length > 0 && (
                      <>
                        <div className="text-sidebar-foreground/50 mt-6 px-2 py-1 text-xs">
                          Older
                        </div>
                        {groupedChats.older.map((chat) => (
                          <ChatItem
                            key={chat.id}
                            chat={chat}
                            isActive={chat.id === chatId}
                            onRename={(chatId: string) => {
                              setRenameTitle(chat.title);
                              setRenamingId(chatId);
                              setRenameDialog(true);
                            }}
                            onDelete={(chatId) => {
                              setDeletingId(chatId);
                              setDeleteDialog(true);
                            }}
                            setOpenMobile={setOpenMobile}
                          />
                        ))}
                      </>
                    )}
                  </>
                );
              })()}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
      {/* Rename Dialog */}
      <AlertDialog open={renameDialog} onOpenChange={setRenameDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Rename Chat</AlertDialogTitle>
            <AlertDialogDescription>
              Enter a new name for this chat.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <input
            className="mt-2 w-full rounded border p-2"
            value={renameTitle}
            onChange={(e) => setRenameTitle(e.target.value)}
          />
          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRename}
              className="cursor-pointer hover:bg-fuchsia-500/30"
            >
              Rename
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={DeleteDialog} onOpenChange={setDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              chat and remove it from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="cursor-pointer hover:bg-red-500"
            >
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export { PreviousChat };
