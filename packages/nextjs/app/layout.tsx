import './globals.css'
import { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ThemeProvider } from '@/components/providers/theme-provider'
import { TokenProvider } from '@/components/providers/token-provider'
import { getSession } from 'next-auth/react'
import Providers from '@/components/providers/provider'
import { Toaster } from '@/components/ui/toaster'
import SubProviders from "./Providers";
import { Menu } from '@/components/ui/menu'
import { PrivyProvider } from '@privy-io/react-auth';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MonaSwipe - Crypto Trading Made Simple",
  description: "Swipe right on your next crypto investment",
  metadataBase: new URL("https://monadswipe.example.com"),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let session;
  getSession()
    .then((data) => {
      session = data;
    })
    .catch((err) => console.log(err));
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <Providers session={session}>

            <PrivyProvider
              appId={"cmbc3dx8z00ggjm0nlf7mnbjl"}
              onSuccess={(user: any) => console.log(`User ${user.id} logged in!`)}
            >
            <TokenProvider>
              <SubProviders>
                {children}
                <Toaster />
                <Menu />
              </SubProviders>
            </TokenProvider>
          </PrivyProvider>
        </Providers>
      </ThemeProvider>
    </body>
    </html >
  );
}
