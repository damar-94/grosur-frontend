// src/app/layout.tsx
import type { Metadata } from "next";

// ADD THIS LINE BACK IN!
import "./globals.css"; 

export const metadata: Metadata = {
  title: "Online Grocery App",
  description: "Shop from your nearest grocery store",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}