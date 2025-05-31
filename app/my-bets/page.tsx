import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { MyBetsContent } from "@/components/my-bets-content"

export default function MyBetsPage() {
  return (
    <div className="flex h-screen bg-[#0a1218] text-white overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto p-4">
          <div className="max-w-7xl mx-auto">
            <MyBetsContent />
          </div>
        </main>
      </div>
    </div>
  )
}
