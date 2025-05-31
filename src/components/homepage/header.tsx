import React from 'react';
import { Button } from '../ui/button';
import Link from 'next/link';

export const MarketingHeader = () => {
  return (
    <header className="sticky top-3 z-50 m-4 rounded-2xl bg-zinc-900/50 outline-2 outline-fuchsia-500/30 backdrop-blur-sm">
      <div className="container">
        <div className="flex h-20 items-center justify-between">
          <div>
            <h2 className="ml-1 bg-white bg-[radial-gradient(100%_100%_at_top_left,#d946ef,white,rgb(74,32,138,.5))] bg-clip-text text-center text-3xl font-semibold tracking-tighter text-transparent md:ml-5 md:text-4xl md:leading-none">
              ModAI
            </h2>
          </div>
          <div className="hidden items-center justify-center gap-x-4 md:flex">
            <Link
              href={'#'}
              className="transition-transform hover:text-lg hover:text-fuchsia-500/60"
            >
              Home
            </Link>
            <Link
              href={'#features'}
              className="transition-transform hover:text-lg hover:text-fuchsia-500/60"
            >
              Features
            </Link>
            <Link
              href={'#footer'}
              className="transition-transform hover:text-lg hover:text-fuchsia-500/60"
            >
              Contact
            </Link>
          </div>
          <div className="mr-5">
            <div className="inset-0 rounded-2xl outline-2 outline-offset-2 outline-fuchsia-500/30 hover:bg-fuchsia-500/30">
              <Link href={'/chat'}>
                <Button variant={'fushia'} size={'default'}>
                  Launch App
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
