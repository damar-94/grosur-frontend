import type { Metadata } from "next";
import { Montserrat, Poppins, Geist } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import AuthProvider from "@/components/providers/AuthProvider";

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' });

// Configure Montserrat for Headings/Brand
const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
});

// Configure Poppins for Body Text
const poppins = Poppins({
  variable: "--font-poppins",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Grosur - Belanja Kebutuhan Harian",
  description: "Belanja kebutuhan harianmu dengan mudah, cepat, dan terpercaya.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={cn("font-sans", geist.variable)}>
      <body className={`${montserrat.variable} ${poppins.variable} font-sans antialiased bg-background text-foreground flex flex-col min-h-screen`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}