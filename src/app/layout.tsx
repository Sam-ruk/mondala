import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LFP WL Checker",
  description: "Checker for phase III mint- LFP FEET PASS.",
  icons: {
    icon: [
      { url: '/lfp_logo.jpg', type: 'image/jpg' },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/mondala_logo.png" type="image/jpg" />
        <link href="https://fonts.googleapis.com/css2?family=Rouge+Script&display=swap" rel="stylesheet"/>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
      <Providers>
        {children}
      </Providers>
      </body>
    </html>
  );
}