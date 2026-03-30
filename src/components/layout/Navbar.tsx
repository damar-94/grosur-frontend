import Link from "next/link";
import { FiSearch, FiShoppingCart, FiUser, FiMenu } from "react-icons/fi";

export default function Navbar() {
    return (
        <header className="sticky top-0 z-50 w-full border-b border-border bg-card shadow-sm">
            <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-4 md:px-6">

                {/* Logo & Mobile Menu */}
                <div className="flex items-center gap-4">
                    <button className="md:hidden text-foreground hover:text-primary transition-colors">
                        <FiMenu size={24} />
                    </button>
                    <Link href="/" className="flex items-center gap-2">
                        <span className="text-2xl font-extrabold text-primary tracking-tight">Grosur</span>
                    </Link>
                </div>

                {/* Desktop Search Bar (Hidden on Mobile) */}
                <div className="hidden flex-1 items-center justify-center px-8 md:flex">
                    <div className="relative w-full max-w-2xl">
                        <input
                            type="text"
                            placeholder="Cari kebutuhan harianmu..."
                            className="w-full rounded-md border border-border bg-background py-2.5 pl-4 pr-10 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                        />
                        <button className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors">
                            <FiSearch size={20} />
                        </button>
                    </div>
                </div>

                {/* Icons (Cart & Profile) */}
                <div className="flex items-center gap-5 md:gap-6">
                    <Link href="/cart" className="relative text-foreground hover:text-primary transition-colors">
                        <FiShoppingCart size={22} />
                        <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-accent-foreground shadow-sm">
                            0
                        </span>
                    </Link>
                    <Link href="/profile" className="hidden text-foreground hover:text-primary transition-colors md:block">
                        <FiUser size={22} />
                    </Link>
                </div>
            </div>

            {/* Mobile Search Bar (Visible only on Mobile) */}
            <div className="border-t border-border p-3 md:hidden bg-card">
                <div className="relative w-full">
                    <input
                        type="text"
                        placeholder="Cari kebutuhan harianmu..."
                        className="w-full rounded-md border border-border bg-background py-2 pl-4 pr-10 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                    />
                    <button className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        <FiSearch size={18} />
                    </button>
                </div>
            </div>
        </header>
    );
}