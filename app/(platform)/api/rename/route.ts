import { auth } from '@/app/(auth)/auth';
import { renameChatTitleByChatId } from '@/src/database/queries';
import { NextRequest, NextResponse } from 'next/server';

export async function PUT(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const chatId = searchParams.get('id');

  if (!chatId) {
    return NextResponse.json({ error: 'Missing chat ID' }, { status: 400 });
  }
  const body = await req.json();
  const { newTitle } = body;

  if (!newTitle || typeof newTitle !== 'string') {
    return NextResponse.json(
      { error: 'Invalid or missing title' },
      { status: 400 },
    );
  }

  const session = await auth();

  if (!session || !session.user) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const updatedChat = await renameChatTitleByChatId({ chatId, newTitle });
    return NextResponse.json(
      { message: 'Chat renamed successfully', updatedChat },
      { status: 200 },
    );
  } catch (error) {
    console.error('Rename error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    );
  }
}
