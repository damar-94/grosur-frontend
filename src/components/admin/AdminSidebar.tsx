"use client";

import * as React from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  Package,
  Box,
  ShoppingCart,
  FileText,
  Store,
  Users,
  Tags,
  BadgePercent,
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
import { useAppStore } from "@/stores/useAppStore";

const adminMenuItems = [
  { title: "Dashboard", url: "/admin", icon: LayoutDashboard, roles: ["SUPER_ADMIN", "STORE_ADMIN"] },
  { title: "Manage Stores", url: "/admin/stores", icon: Store, roles: ["SUPER_ADMIN"] },
  { title: "Manage Users", url: "/admin/users", icon: Users, roles: ["SUPER_ADMIN"] },
  { title: "Manage Admins", url: "/admin/manage-admins", icon: Users, roles: ["SUPER_ADMIN"] },
  { title: "Categories", url: "/admin/categories", icon: Tags, roles: ["SUPER_ADMIN", "STORE_ADMIN"] },
  { title: "Products", url: "/admin/products", icon: Package, roles: ["SUPER_ADMIN", "STORE_ADMIN"] },
  { title: "Stocks", url: "/admin/stocks", icon: Box, roles: ["SUPER_ADMIN", "STORE_ADMIN"] },
  { title: "Orders", url: "/admin/orders", icon: ShoppingCart, roles: ["SUPER_ADMIN", "STORE_ADMIN"] },
  { title: "Discounts", url: "/admin/discounts", icon: BadgePercent, roles: ["SUPER_ADMIN", "STORE_ADMIN"] },
  { title: "Reports", url: "/admin/reports", icon: FileText, roles: ["SUPER_ADMIN", "STORE_ADMIN"] },
];

export function AdminSidebar() {
  const { user } = useAppStore();

  const filteredMenuItems = adminMenuItems.filter(
    (item) => !item.roles || (user?.role && item.roles.includes(user.role))
  );

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
              {filteredMenuItems.map((item) => (
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
