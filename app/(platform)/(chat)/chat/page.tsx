import { DEFAULT_MODEL_NAME, models } from '@/src/ai/models';
import { Chat } from '@/src/components/platform/chat';
import { generateUUID } from '@/src/lib/utils';
import { cookies } from 'next/headers';

const ChatPage = async () => {
  const id = generateUUID();
  const cookieStore = await cookies();
  const modelIdFromCookie = cookieStore.get('model-id')?.value;
  const selectedModelId =
    models.find((model) => model.id === modelIdFromCookie)?.id ||
    DEFAULT_MODEL_NAME;
  return (
    <Chat
      key={id}
      id={id}
      initialMessages={[]}
      selectedModelId={selectedModelId}
      isReadonly={false}
    />
  );
};

export default ChatPage;
