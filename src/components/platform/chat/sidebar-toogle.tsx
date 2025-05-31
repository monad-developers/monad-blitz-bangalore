import { SidebarTrigger, useSidebar } from '@/src/components/ui/sidebar';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/src/components/ui/tooltip';

import { Button } from '../../ui/button';

export function SidebarToggle() {
  const { toggleSidebar } = useSidebar();

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          onClick={toggleSidebar}
          variant={'outline'}
          className="cursor-pointer border-2 hover:border-fuchsia-500 md:h-fit md:px-2"
          size={'lg'}
        >
          <SidebarTrigger className="cursor-pointer" />
        </Button>
      </TooltipTrigger>
      <TooltipContent align="start">Toggle Sidebar</TooltipContent>
    </Tooltip>
  );
}
