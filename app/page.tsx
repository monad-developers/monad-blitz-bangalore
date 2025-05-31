import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { LiveScoreCard } from "@/components/live-score-card";
import { CurrentBetCard } from "@/components/current-bet-card";
import { PreviousBetsContainer } from "@/components/previous-bets-container";
import { UpcomingMatchesCard } from "@/components/upcoming-matches-card";
import { LiveBetFeed } from "@/components/live-bet-feed";
import { Providers } from "@/components/providers";

export default function Home() {
  return (
    <Providers>
      <div className="flex h-screen bg-[#0a1218] text-white overflow-hidden">
        <Sidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <Header />
          <main className="flex-1 overflow-auto p-4">
            <div className="max-w-7xl mx-auto space-y-4">
              <LiveScoreCard />
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2 space-y-4">
                  <CurrentBetCard />
                  <PreviousBetsContainer />
                </div>
                <div className="space-y-4">
                  <UpcomingMatchesCard />
                </div>
              </div>
            </div>
          </main>
        </div>
        <LiveBetFeed />
      </div>
    </Providers>
  );
}
