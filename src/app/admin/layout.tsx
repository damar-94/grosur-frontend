import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { BottomNav } from "@/components/admin/BottomNav";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <TooltipProvider delayDuration={0}>
      <SidebarProvider>
        <AdminSidebar />
        <SidebarInset className="flex flex-col min-w-0 h-screen overflow-hidden bg-gray-50 pb-16 md:pb-0">
          <AdminHeader />
          <main className="flex-1 p-6 overflow-auto">{children}</main>
          <BottomNav />
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
