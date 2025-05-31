import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import monadImage from '@/public/monad.png';

export const Overview = () => {
  return (
    <motion.div
      key="overview"
      className="mx-4 mt-20 max-w-[500px] md:mx-0"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ delay: 0.5 }}
    >
      <div className="flex flex-col gap-4 rounded-2xl border-none p-6 text-sm text-zinc-400">
        <p className="flex flex-row items-center justify-center gap-4 text-gray-900">
          <Image src={monadImage} alt="ModAI" width={100} height={100} />
        </p>
        <p>
          Welcome to ModAI a Chatbot to chat with SUI blockchain powered by the
          Google Gemini model built with
          <code className="bg-muted-foreground/15 rounded-sm px-1.5 py-0.5">
            Nextjs
          </code>{' '}
          and{' '}
          <code className="bg-muted-foreground/15 rounded-sm px-1.5 py-0.5">
            Vercel AI SDK
          </code>{' '}
          to create a seamless chat experience.
        </p>
        <p>
          {' '}
          Learn more about{' '}
          <Link
            className="text-blue-500 dark:text-blue-400"
            href="/"
            target="_blank"
          >
            ModAI
          </Link>
          .
        </p>
      </div>
    </motion.div>
  );
};
