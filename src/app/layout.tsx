import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Magister Latinitatis",
  description: "Learn Latin vocabulary easily",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased h-[100dvh] flex flex-col overflow-hidden bg-gray-50 dark:bg-gray-900`}
      >
        <div className="flex-1 overflow-y-auto w-full max-w-screen-xl mx-auto flex flex-col px-2 sm:px-4">
          <main className="flex-1 flex flex-col">
            {children}
          </main>
        </div>
        <footer className="py-4 text-center text-gray-500 dark:text-gray-400 text-[10px] sm:text-xs border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shrink-0">
          Made possible by <a href="https://sl-analytics.com" target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline">Sweet Lake Analytics</a>.
        </footer>
      </body>
    </html>
  );
}
