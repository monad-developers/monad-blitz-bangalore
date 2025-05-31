'use client';

import { startTransition, useMemo, useOptimistic, useState } from 'react';

import { saveModelId } from '@/src/actions/chat/model';
import { Button } from '@/src/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/src/components/ui/dropdown-menu';
import { models } from '@/src/ai/models';
import { cn } from '@/src/lib/utils';

import { CheckCircle, ChevronDownIcon } from 'lucide-react';

export function ModelSelector({
  selectedModelId,
  className,
}: {
  selectedModelId: string;
} & React.ComponentProps<typeof Button>) {
  const [open, setOpen] = useState(false);
  const [optimisticModelId, setOptimisticModelId] =
    useOptimistic(selectedModelId);

  const selectedModel = useMemo(
    () => models.find((model) => model.id === optimisticModelId),
    [optimisticModelId],
  );

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger
        asChild
        className={cn(
          'data-[state=open]:bg-accent data-[state=open]:text-accent-foreground w-fit',
          className,
        )}
      >
        <Button
          variant="outline"
          className="border-2 hover:border-fuchsia-500 md:h-[34px] md:px-2"
        >
          {selectedModel?.label}
          <ChevronDownIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-[300px]">
        {models.map((model) => (
          <DropdownMenuItem
            key={model.id}
            onSelect={() => {
              setOpen(false);

              startTransition(() => {
                setOptimisticModelId(model.id);
                saveModelId(model.id);
              });
            }}
            className="group/item flex flex-row items-center justify-between gap-4"
            data-active={model.id === optimisticModelId}
          >
            <div className="flex flex-col items-start gap-1">
              {model.label}
              {model.description && (
                <div className="text-muted-foreground text-xs">
                  {model.description}
                </div>
              )}
            </div>
            <div className="text-foreground dark:text-foreground opacity-0 group-data-[active=true]/item:opacity-100">
              <CheckCircle />
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
