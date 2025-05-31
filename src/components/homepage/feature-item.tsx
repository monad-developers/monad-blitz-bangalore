'use client';

import { useMotionTemplate, useMotionValue, motion } from 'framer-motion';
import { useEffect, useRef } from 'react';

interface FeatureItemProps {
  title: string;
  description: string;
  icon: React.ReactNode;
}

export const FeatureItem = ({ title, description, icon }: FeatureItemProps) => {
  const offsetx = useMotionValue(-100);
  const offsety = useMotionValue(-100);
  const maskImage = useMotionTemplate`radial-gradient(100px 1100px at ${offsetx}px ${offsety}0px, black, transparent)`;
  const border = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const updateMousePosition = (e: MouseEvent) => {
      if (!border.current) return;
      const borderRect = border.current.getBoundingClientRect();
      offsetx.set(e.x - borderRect.x);
      offsety.set(e.y - borderRect.y);
    };
    window.addEventListener('mousemove', updateMousePosition);
    return () => {
      window.removeEventListener('mousemove', updateMousePosition);
    };
  }, [offsetx, offsety]);
  return (
    <div className="relative flex-1 rounded-xl border border-fuchsia-500/20 bg-zinc-900/10 px-5 py-10 text-center transition-transform duration-300 hover:scale-105 hover:bg-black">
      <motion.div
        className="absolute inset-0 rounded-xl border-4 border-fuchsia-500"
        style={{
          WebkitMaskImage: maskImage,
          maskImage: maskImage,
        }}
        ref={border}
      ></motion.div>
      <div className="inline-flex h-14 w-14 items-center justify-center rounded-lg bg-white text-black transition-transform duration-300 hover:scale-125">
        {icon}
      </div>
      <h3 className="mt-6 font-bold">{title}</h3>
      <p className="mt-2 text-white/70">{description}</p>
    </div>
  );
};
