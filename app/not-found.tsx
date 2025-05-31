'use client';

import { Hexagon } from '@/src/components/globals/hexagon';
import { Button } from '@/src/components/ui/button';
import { redirect } from 'next/navigation';

export default function NotFound() {
  return (
    <section className="relative min-h-screen overflow-x-hidden overflow-y-auto">
      {/* Background Hexagons */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <Hexagon size={700} className="size-[700px]" reverse={true} />
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <Hexagon size={900} className="size-[900px]" />
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <Hexagon size={1100} className="size-[1100px]" />
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <Hexagon size={1800} className="size-[1800px]" reverse={true} />
        </div>
      </div>

      {/* Sign-in box */}
      <div className="relative z-10 flex min-h-screen items-center justify-center px-4">
        <div className="flex h-75 w-75 flex-col items-center justify-center gap-10 rounded-2xl bg-white/5 p-7 text-center">
          <div>
            <h1 className="bg-white bg-[radial-gradient(100%_100%_at_top_left,#d946ef,white,rgb(74,32,138,.5))] bg-clip-text text-5xl font-semibold tracking-tighter text-transparent md:text-4xl">
              ModAI
            </h1>
            <h3 className="mt-5 text-gray-500">You are Lost</h3>
          </div>
          <div className="inset-0 mt-10 rounded-2xl outline-2 outline-offset-2 outline-fuchsia-500/30 hover:bg-fuchsia-500/30">
            <Button
              variant={'fushia'}
              size={'default'}
              onClick={() => redirect('/')}
            >
              Go to Homepage
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
