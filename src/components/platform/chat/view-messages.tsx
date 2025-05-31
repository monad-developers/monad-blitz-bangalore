'use client';

import { Attachment, ToolInvocation } from 'ai';
import { motion } from 'framer-motion';
import { ReactNode } from 'react';

import { BotIcon, UserIcon } from 'lucide-react';
import { Markdown } from './markdown';
import { PreviewAttachment } from './preview-attachment';
import { BalanceCheck } from './tools-ui/get-balance-ui';
import { TransferMod } from './tools-ui/transfer-mod';

export const ViewMessages = ({
  role,
  content,
  toolInvocations,
  attachments,
}: {
  role: string;
  content: string | ReactNode;
  toolInvocations: Array<ToolInvocation> | undefined;
  attachments?: Array<Attachment>;
}) => {
  return (
    <motion.div
      className={`flex w-full flex-row gap-4 px-4 first-of-type:pt-20 md:w-[500px] md:px-0`}
      initial={{ y: 5, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
    >
      <div className="flex size-[24px] shrink-0 flex-col items-center justify-center rounded-sm border p-1 text-zinc-500">
        {role === 'assistant' ? (
          <BotIcon className="text-fuchsia-500" />
        ) : (
          <UserIcon className="text-white" />
        )}
      </div>

      <div className="flex w-full flex-col gap-2">
        {content && typeof content === 'string' && (
          <div className="flex flex-col gap-4 text-zinc-300">
            <Markdown>{content}</Markdown>
          </div>
        )}

        {toolInvocations && (
          <div className="flex flex-col gap-4">
            {toolInvocations.map((toolInvocation) => {
              const { toolName, toolCallId, state } = toolInvocation;

              if (state === 'result') {
                const { result } = toolInvocation;

                return (
                  <div key={result}>
                    {toolName === 'getbalance' ? (
                      <BalanceCheck RecievedResult={result} />
                    ) : toolName === 'transfersui' ? (
                      <TransferMod
                      // RecievedResult={result}
                      />
                    ) : (
                      <div>{JSON.stringify(result, null, 2)}</div>
                    )}
                  </div>
                );
              } else {
                return (
                  <div key={toolCallId} className="skeleton">
                    {toolName === 'getWeather' ? (
                      <BalanceCheck />
                    ) : toolName === 'transfersui' ? (
                      <TransferMod />
                    ) : null}
                  </div>
                );
              }
            })}
          </div>
        )}

        {attachments && (
          <div className="flex flex-row gap-2">
            {attachments.map((attachment) => (
              <PreviewAttachment key={attachment.url} attachment={attachment} />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};
