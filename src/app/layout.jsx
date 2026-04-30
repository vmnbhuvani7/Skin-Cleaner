import { Outfit, Geist_Mono } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
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
import { ThemeProvider } from "@/context/ThemeContext";

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                let theme = window.localStorage.getItem('theme') || 'system';
                let activeTheme = theme === 'system' ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : theme;
                document.documentElement.classList.add(activeTheme);
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <GraphQLProvider>
          <ThemeProvider>
            <ChatProvider>
              <AuthGuard>
                {children}
              </AuthGuard>
            </ChatProvider>
          </ThemeProvider>
        </GraphQLProvider>
      </body>
    </html>
  );
}
