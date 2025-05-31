'use client';

import { Attachment, Message } from 'ai';
import { useChat } from '@ai-sdk/react';
import { useScrollToBottom } from '@/src/hooks/use-scrolltobottom';
import { useState } from 'react';
import { Overview } from './overview';
import { ViewMessages } from './view-messages';
import { MultimodalInput } from './multimodalinput';
import { ChatHeader } from './chat-header';

export function Chat({
  id,
  initialMessages,
  selectedModelId,
  isReadonly,
}: {
  id: string;
  initialMessages: Array<Message>;
  selectedModelId: string;
  isReadonly: boolean;
}) {
  const { messages, handleSubmit, input, setInput, append, isLoading, stop } =
    useChat({
      id,
      body: { id },
      initialMessages,
      maxSteps: 10,
      onFinish: () => {
        window.history.replaceState({}, '', `/chat/${id}`);
      },
    });

  const [messagesContainerRef, messagesEndRef] =
    useScrollToBottom<HTMLDivElement>();
  const [attachments, setAttachments] = useState<Array<Attachment>>([]);

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      {/* Sticky header inside sidebar-aware layout */}
      <div className="bg-background sticky top-0 z-10 border-b border-zinc-800">
        <ChatHeader selectedModelId={selectedModelId} isReadonly={isReadonly} />
      </div>

      {/* Scrollable message area */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto px-2 py-4 md:px-4"
      >
        <div className="flex flex-col items-center gap-4">
          {messages.length === 0 && <Overview />}

          {messages.map((message: any) => (
            <ViewMessages
              key={message.id}
              role={message.role}
              content={message.content}
              attachments={message.experimental_attachments}
              toolInvocations={message.toolInvocations}
            />
          ))}

          <div
            ref={messagesEndRef}
            className="min-h-[24px] min-w-[24px] shrink-0"
          />
        </div>
      </div>

      {/* Sticky input within layout */}
      <div className="bg-background sticky bottom-0 z-10 border-t border-zinc-800 px-4 py-2 md:px-0">
        <form className="mx-auto flex w-full max-w-[500px] flex-row items-end gap-2">
          <MultimodalInput
            input={input}
            setInput={setInput}
            handleSubmit={handleSubmit}
            isLoading={isLoading}
            stop={stop}
            attachments={attachments}
            setAttachments={setAttachments}
            messages={messages}
            append={append}
          />
        </form>
      </div>
    </div>
  );
}
