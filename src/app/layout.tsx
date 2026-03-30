import type { Metadata } from "next";
import { Montserrat, Poppins } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

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
    <html lang="id">
      {/* Notice the flex classes here: 
        min-h-screen ensures the footer is pushed to the bottom even if the page is empty 
      */}
      <body className={`${montserrat.variable} ${poppins.variable} font-sans antialiased bg-background text-foreground flex flex-col min-h-screen`}>
        <Navbar />
        <main className="flex-grow">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}