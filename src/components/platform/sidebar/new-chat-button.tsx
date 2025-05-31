'use client';

import { useRouter } from 'next/navigation';
import { useSidebar } from '../../ui/sidebar';
import { Button } from '../../ui/button';

const NewChatButton = () => {
  const { setOpenMobile } = useSidebar();
  const router = useRouter();
  return (
    <div className="m-3 w-full rounded-2xl bg-white/10 p-1 outline-2 outline-fuchsia-500">
      <Button
        variant={'fushia'}
        size={'default'}
        onClick={() => {
          setOpenMobile(false);
          router.push('/chat');
          router.refresh();
        }}
        className="w-full bg-fuchsia-500/60"
      >
        New Chat
      </Button>
    </div>
  );
};

export { NewChatButton };
