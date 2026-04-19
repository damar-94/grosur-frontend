import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { BottomNav } from "@/components/admin/BottomNav";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Authentication & Role Authorization is strictly handled by src/middleware.ts
  // before the layout even loads. No need to double-check missing 'role' cookies here!

  return (
    <TooltipProvider delayDuration={0}>
      <SidebarProvider>
        <div className="flex min-h-screen flex-col w-full">
          <AdminHeader />
          <div className="flex flex-1 overflow-hidden">
            <AdminSidebar />
            <SidebarInset className="flex-1 flex flex-col bg-gray-50">
              <main className="flex-1 p-6 pb-20 md:pb-6 overflow-auto">
                {children}
              </main>
              <BottomNav />
            </SidebarInset>
          </div>
        </div>
      </SidebarProvider>
    </TooltipProvider>
  );
}
