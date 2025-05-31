import { updateChatVisiblityById } from '@/src/database/queries';
import { VisibilityType } from '@/src/types/visibility';

export async function updateChatVisibility({
  chatId,
  visibility,
}: {
  chatId: string;
  visibility: VisibilityType;
}) {
  await updateChatVisiblityById({ chatId, visibility });
}
