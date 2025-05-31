import { CoreMessage } from 'ai';
import { notFound } from 'next/navigation';

import { auth } from '@/app/(auth)/auth';
import { getChatById } from '@/src/database/queries';
import { convertToUIMessages } from '@/src/lib/utils';
import { Chat } from '@/prisma/generated/prisma';
import { Chat as ViewChat } from '@/src/components/platform/chat';
import { cookies } from 'next/headers';
import { DEFAULT_MODEL_NAME, models } from '@/src/ai/models';

export default async function Page({ params }: { params: any }) {
  const { id } = await params;
  const cookieStore = await cookies();
  const modelIdFromCookie = cookieStore.get('model-id')?.value;
  const selectedModelId =
    models.find((model) => model.id === modelIdFromCookie)?.id ||
    DEFAULT_MODEL_NAME;
  const chatFromDb = await getChatById({ id });

  if (!chatFromDb) {
    notFound();
  }

  // type casting and converting to UI messages
  const chat: Chat = {
    ...chatFromDb,
    messages: JSON.stringify(
      convertToUIMessages((chatFromDb.messages as Array<CoreMessage>) || []),
    ),
  };

  const session = await auth();

  if (!session || !session.user) {
    return notFound();
  }

  if (session.user.id !== chat.userId) {
    return notFound();
  }

  const parsedMessage =
    typeof chat.messages === 'string' ? JSON.parse(chat.messages) : null;

  return (
    <ViewChat
      id={chat.id}
      initialMessages={parsedMessage}
      selectedModelId={selectedModelId}
      isReadonly={session.user.id !== chatFromDb.userId}
    />
  );
}
