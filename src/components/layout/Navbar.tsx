import Link from "next/link";
import {
  FiSearch,
  FiShoppingCart,
  FiUser,
  FiHome,
  FiGrid,
} from "react-icons/fi";

export default function Navbar() {
  return (
    <>
      {/* 1. TOP HEADER (Sticky Search & Desktop Nav) */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-card shadow-sm">
        <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-4 md:px-6">
          {/* Desktop Logo */}
          <Link href="/" className="hidden md:flex items-center gap-2">
            <span className="text-2xl font-extrabold text-primary tracking-tight">
              Grosur
            </span>
          </Link>

          {/* Mobile Search Bar (Takes full width on mobile) */}
          <div className="flex w-full md:hidden relative items-center">
            <input
              type="text"
              placeholder="Cari di Grosur..."
              className="w-full rounded-md border border-border bg-background py-2 pl-4 pr-10 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
            />
            <button className="absolute right-3 text-muted-foreground">
              <FiSearch size={18} />
            </button>
          </div>

          {/* Desktop Search Bar */}
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

          {/* Desktop Icons (Hidden on Mobile) */}
          <div className="hidden items-center gap-5 md:flex md:gap-6">
            <Link
              href="/cart"
              className="relative text-foreground hover:text-primary transition-colors"
            >
              <FiShoppingCart size={22} />
              <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-accent-foreground shadow-sm">
                0
              </span>
            </Link>
            <Link
              href="/profile"
              className="text-foreground hover:text-primary transition-colors"
            >
              <FiUser size={22} />
            </Link>
          </div>
        </div>
      </header>

      {/* 2. MOBILE BOTTOM NAVIGATION (Hidden on Desktop) */}
      <nav className="fixed bottom-0 left-0 z-50 w-full border-t border-border bg-card md:hidden shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
        <div className="flex h-[60px] items-center justify-around px-2">
          <Link
            href="/"
            className="flex flex-col items-center justify-center gap-1 text-primary"
          >
            <FiHome size={20} />
            <span className="text-[10px] font-semibold">Beranda</span>
          </Link>

          <Link
            href="/categories"
            className="flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-primary transition-colors"
          >
            <FiGrid size={20} />
            <span className="text-[10px] font-medium">Kategori</span>
          </Link>

          <Link
            href="/cart"
            className="relative flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-primary transition-colors"
          >
            <div className="relative">
              <FiShoppingCart size={20} />
              <span className="absolute -right-2 -top-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-accent text-[8px] font-bold text-accent-foreground shadow-sm">
                0
              </span>
            </div>
            <span className="text-[10px] font-medium">Keranjang</span>
          </Link>

          <Link
            href="/profile"
            className="flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-primary transition-colors"
          >
            <FiUser size={20} />
            <span className="text-[10px] font-medium">Profil</span>
          </Link>
        </div>
      </nav>
    </>
  );
}
