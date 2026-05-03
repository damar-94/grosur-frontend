import Link from "next/link";
import { HelpCircle } from "lucide-react";

interface AuthHeaderProps {
  title: string;
}

export default function AuthHeader({ title }: AuthHeaderProps) {
  return (
    <header className="w-full bg-white border-b border-gray-100 shadow-sm h-20 shrink-0">
      <div className="max-w-[1200px] mx-auto px-4 md:px-6 h-full flex items-center justify-between">
        
        {/* Left side: Logo + Page Title (Shopee style) */}
        <div className="flex items-end gap-3 md:gap-4">
          <Link href="/" className="flex items-center gap-2 outline-none">
            <span className="text-3xl md:text-4xl font-extrabold text-[#00997a] tracking-tight">
              Grosur
            </span>
          </Link>
          <span className="text-xl md:text-2xl font-medium text-gray-700 mb-0.5 hidden sm:block">
            {title}
          </span>
        </div>

        {/* Right side: Help Link */}
        <a href="mailto:support@grosur.com" className="flex items-center gap-1.5 text-sm font-medium text-[#00997a] hover:text-[#007a61] transition-colors">
          <HelpCircle size={16} />
          <span className="hidden sm:inline">Butuh bantuan?</span>
        </a>
      </div>
    </header>
  );
}
