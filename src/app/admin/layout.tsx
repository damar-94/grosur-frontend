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
  // Temporary Simple Protection
  const cookieStore = await cookies();
  const role = cookieStore.get("role")?.value;

  // DIMATIKAN SEMENTARA UNTUK DEVELOPMENT:
  // Jika cookie role bukan 'admin', tendang ke halaman utama
  // if (role !== "admin") {
  //   redirect("/");
  // }

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
