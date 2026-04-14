import type { Metadata } from "next";
import { Poppins, JetBrains_Mono } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Kora - Smart Travel Planning",
  description: "Plan every journey with clarity. Organize trips, packing lists, and travel documents in one beautiful place.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${poppins.variable} ${jetBrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground overflow-y-auto" suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
