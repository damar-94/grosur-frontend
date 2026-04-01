import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function MainLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <Navbar />
            {/* Mobile padding to prevent content hiding behind the bottom nav */}
            <main className="flex-grow pb-20 md:pb-0">
                {children}
            </main>
            <Footer />
        </>
    );
}