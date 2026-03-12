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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased h-screen flex flex-col overflow-hidden`}
      >
        <div className="flex-1 overflow-auto">
          {children}
        </div>
        <footer className="py-4 text-center text-gray-500 dark:text-gray-400 text-[10px] sm:text-xs border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shrink-0">
          Made possible by <a href="https://sl-analytics.com" target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline">Sweet Lake Analytics</a>.
        </footer>
      </body>
    </html>
  );
}
