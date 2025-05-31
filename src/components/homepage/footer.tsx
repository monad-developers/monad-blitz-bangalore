export const MarketingFooter = () => {
  return (
    <footer
      id="footer"
      className="relative border-t border-purple-500/10 bg-black py-12 backdrop-blur-sm"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
          {/* Logo & Description */}
          <div className="flex flex-col items-center md:items-start">
            <h2 className="bg-white bg-[radial-gradient(100%_100%_at_top_left,#4a208a,white,rgb(74,32,138,.5))] bg-clip-text text-2xl font-semibold text-transparent">
              ModAI
            </h2>
            <p className="mt-2 max-w-xs text-center text-sm text-gray-400 md:text-left"></p>
          </div>

          {/* Contact Info */}
          <div className="flex flex-col items-center gap-2 md:items-start">
            <div className="flex items-center gap-2 text-gray-400 transition-colors hover:text-fuchsia-500">
              <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
              <a href="mailto:itsranahrishikesh@gmail.com" className="text-sm">
                Hrishikesh Rana
              </a>
            </div>
            <div className="flex items-center gap-2 text-gray-400 transition-colors hover:text-fuchsia-500">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              <a
                href="https://github.com/rishi-xyz/modAI"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm"
              >
                Source Code
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 border-t border-purple-500/10 pt-8">
          <p className="text-center text-xs text-gray-400">
            {new Date().getFullYear()} ModAI. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
