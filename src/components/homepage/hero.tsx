'use client';

import React from 'react';
import { Button } from '@/src/components/ui/button';
import { Hexagon } from '@/src/components/globals/hexagon';
import Link from 'next/link';
import { motion } from 'framer-motion';

export const MarketingHero = () => {
  return (
    <section className="overflow-x-clip py-24 md:py-52">
      <div className="container">
        <p className="text-center text-xl font-extrabold text-zinc-400">
          An Agentic Chat web app based that lets you interact with Monad
          Blockchain
        </p>
        <h1 className="mx-auto mt-5 max-w-4xl text-center text-5xl font-black uppercase md:text-6xl">
          Introducing ModAI
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-center text-xl font-semibold text-zinc-500 md:text-2xl">
          Start talking to ModAI
        </p>
        <div className="z-0 mt-20 flex justify-center">
          <div className="inset-0 rounded-2xl outline-2 outline-offset-2 outline-fuchsia-500/30 hover:bg-fuchsia-500/30">
            <Link href={'/chat'}>
              <Button
                variant={'fushia'}
                size={'default'}
                className="hover:cursor-pointer hover:bg-fuchsia-500/30"
              >
                Start Now
              </Button>
            </Link>
          </div>
        </div>
        <div className="relative -z-30 mt-24 flex justify-center">
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
        <div className="mt-96 flex flex-col items-center justify-center gap-4 md:mt-80">
          <div className="mb-5 inline-flex h-12 w-5 justify-center rounded-full pt-2 outline-[6px] outline-fuchsia-500/10">
            <motion.div
              animate={{
                translateY: 12,
                opacity: 0.2,
              }}
              transition={{
                duration: 4,
                ease: 'linear',
                repeat: Infinity,
                repeatType: 'loop',
              }}
              className="h-3 w-1 rounded-full bg-fuchsia-500"
            />
          </div>
          <p className="font-extrabold tracking-wider text-zinc-500 uppercase">
            Scroll to Learn More
          </p>
        </div>
      </div>
    </section>
  );
};
