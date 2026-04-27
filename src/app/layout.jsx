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

export const metadata = {
  title: "Skin Cleaner AI - Modern Intelligent Chat",
  description: "Experience the next generation of AI assistance with Skin Cleaner.",
};

import GraphQLProvider from "@/lib/apollo-client";
import AuthGuard from "@/components/AuthGuard";
import { ChatProvider } from "@/context/ChatContext";

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-stone-50">
        <GraphQLProvider>
          <ChatProvider>
            <AuthGuard>
              {children}
            </AuthGuard>
          </ChatProvider>
        </GraphQLProvider>
      </body>
    </html>
  );
}
