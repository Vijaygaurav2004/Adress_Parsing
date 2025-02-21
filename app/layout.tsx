import type { Metadata } from "next";
import { Inter as FontSans } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Address Parser Dashboard",
  description: "A dashboard for parsing and managing addresses",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={fontSans.variable}>
      <body className={`font-sans ${fontSans.className}`}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
//layout.tsx