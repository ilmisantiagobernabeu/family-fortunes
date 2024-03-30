import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import localFont from "@next/font/local";

const inter = Inter({ subsets: ["latin"] });

const mobile = localFont({
  src: [
    {
      path: "../../public/fonts/mobile-font.regular.ttf",
      weight: "400",
    },
  ],
  variable: "--mobile-font",
});

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${mobile.variable} font-sans`}>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
