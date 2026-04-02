"use client";

import * as React from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  Package,
  Box,
  ShoppingCart,
  FileText,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarHeader,
} from "@/components/ui/sidebar";

const adminMenuItems = [
  { title: "Dashboard", url: "/admin", icon: LayoutDashboard },
  { title: "Produk", url: "/admin/produk", icon: Package },
  { title: "Stok", url: "/admin/stok", icon: Box },
  { title: "Pesanan", url: "/admin/pesanan", icon: ShoppingCart },
  { title: "Laporan", url: "/admin/laporan", icon: FileText },
];

export function AdminSidebar() {
  return (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarHeader className="h-16 flex justify-center px-4 border-b">
        {/* Placeholder for Logo in Sidebar if needed, otherwise hidden when collapsed */}
        <div className="flex items-center gap-2 font-bold text-lg text-primary group-data-[collapsible=icon]:hidden">
          <span>Grosur Panel</span>
        </div>
        <div className="hidden group-data-[collapsible=icon]:flex items-center justify-center font-bold text-primary">
          G
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    tooltip={item.title}
                    className="w-full rounded-none h-10"
                  >
                    <Link href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
