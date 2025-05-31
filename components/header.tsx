import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bell, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConnectWalletButton } from "./wallet";

export function Header() {
  return (
    <header className="h-14 border-b border-[#1a2c3a] bg-[#0d1924] flex items-center justify-between px-4">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          className="text-xs text-emerald-400 border border-[#1a2c3a] rounded-md"
        >
          All Events <ChevronDown className="h-3 w-3 ml-1" />
        </Button>

        <div className="hidden md:flex items-center gap-2 ml-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-gray-400 hover:text-white"
          >
            IPL
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-gray-400 hover:text-white"
          >
            T20 World Cup
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-gray-400 hover:text-white"
          >
            Test Matches
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="text-gray-400">
          <Bell className="h-5 w-5" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-emerald-900 text-emerald-200">
                  JD
                </AvatarFallback>
              </Avatar>
              <ChevronDown className="h-4 w-4 text-gray-400" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuItem>Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <ConnectWalletButton />
      </div>
    </header>
  );
}
