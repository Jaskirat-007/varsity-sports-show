// src/app/layout.tsx
import './globals.css';
import {
  ClerkProvider,
} from '@clerk/nextjs';
import { shadesOfPurple } from '@clerk/themes'

export const metadata = {
  title: "Varsity Sports Show Live-Streaming",
  description: "Live streaming platform",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider appearance={{ theme: shadesOfPurple }} afterSignOutUrl="https://varsitysportsshow.com/">
      <html lang="en">
        <body className="bg-white text-slate-900 antialiased">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}