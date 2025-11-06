// src/app/layout.tsx
import './globals.css';
import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs';
import SegmentedAuth from "@/components/SegmentedAuth";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { shadesOfPurple } from '@clerk/themes'

export const metadata = {
  title: "Varsity Sports Show Live-Streaming",
  description: "Live streaming platform",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider 
    appearance={{theme: shadesOfPurple,}} afterSignOutUrl = 'https://varsitysportsshow.com/'>
      <html lang="en" suppressHydrationWarning>
        <body className="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100 antialiased">
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <header className="flex justify-end items-center gap-3 p-4 h-16 border-slate-200 dark:border-slate-800">
              <ThemeToggle />
              <SignedOut>
                <SegmentedAuth /> 
              </SignedOut>
              <SignedIn>
                <div className="scale-130">
                  <UserButton appearance={{
                    elements: {
                      avatarImage: "rounded-full border-2 border-violet-600",
                    },
                  }}/>
                </div>
              </SignedIn>   
            </header>
            {children}
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}