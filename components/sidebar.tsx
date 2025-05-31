import Link from "next/link"
import { Compass, BarChart2, ClipboardList, Beaker, Trophy } from "lucide-react"

export function Sidebar() {
  return (
    <div className="w-16 md:w-56 bg-[#0d1924] border-r border-[#1a2c3a] flex flex-col">
      <div className="p-4 border-b border-[#1a2c3a]">
        <Link href="/" className="flex items-center justify-center md:justify-start">
          <span className="text-xl font-bold text-emerald-400 hidden md:inline">CricketX</span>
          <span className="text-xl font-bold text-emerald-400 md:hidden">CX</span>
        </Link>
      </div>
      <nav className="flex-1 p-2">
        <ul className="space-y-1">
          <li>
            <Link
              href="/"
              className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-[#162736] text-gray-400 hover:text-white bg-[#162736] text-emerald-400"
            >
              <Compass className="h-5 w-5" />
              <span className="hidden md:inline">Explore</span>
            </Link>
          </li>
          <li>
            <Link
              href="/my-bets"
              className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-[#162736] text-gray-400 hover:text-white"
            >
              <BarChart2 className="h-5 w-5" />
              <span className="hidden md:inline">My Bets</span>
            </Link>
          </li>
          <li>
            <Link
              href="/my-orders"
              className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-[#162736] text-gray-400 hover:text-white"
            >
              <ClipboardList className="h-5 w-5" />
              <span className="hidden md:inline">My Orders</span>
            </Link>
          </li>
          <li>
            <Link
              href="/lab"
              className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-[#162736] text-gray-400 hover:text-white"
            >
              <Beaker className="h-5 w-5" />
              <span className="hidden md:inline">The Lab</span>
            </Link>
          </li>
          <li>
            <Link
              href="/leaderboard"
              className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-[#162736] text-gray-400 hover:text-white"
            >
              <Trophy className="h-5 w-5" />
              <span className="hidden md:inline">Leaderboard</span>
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  )
}
