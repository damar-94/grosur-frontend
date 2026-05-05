"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, Box, ShoppingCart, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/components/ui/sidebar";

const bottomNavItems = [
  { title: "Home", url: "/admin", icon: LayoutDashboard },
  { title: "Produk", url: "/admin/products", icon: Package },
  { title: "Stok", url: "/admin/stocks", icon: Box },
  { title: "Pesanan", url: "/admin/orders", icon: ShoppingCart },
  { title: "Lainnya", action: "sidebar", icon: Menu },
];

export function BottomNav() {
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();

  return (
    <nav className="fixed bottom-0 left-0 z-50 w-full h-16 bg-background border-t md:hidden flex items-center justify-around px-2 pb-safe">
      {bottomNavItems.map((item) => {
        if (item.action === "sidebar") {
          return (
            <button
              key={item.title}
              onClick={() => setOpenMobile(true)}
              className="flex flex-col items-center justify-center w-full h-full gap-1 transition-colors text-muted-foreground hover:text-foreground"
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[10px] font-medium leading-none">
                {item.title}
              </span>
            </button>
          );
        }

        // Active if exact match for home, or starts with for others
        const isActive =
          item.url === "/admin"
            ? pathname === "/admin"
            : pathname?.startsWith(item.url || "");

        return (
          <Link
            key={item.title}
            href={item.url || "#"}
            className={cn(
              "flex flex-col items-center justify-center w-full h-full gap-1 transition-colors",
              isActive
                ? "text-primary font-semibold"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <item.icon className={cn("w-5 h-5", isActive && "fill-primary/20")} />
            <span className="text-[10px] font-medium leading-none">
              {item.title}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
