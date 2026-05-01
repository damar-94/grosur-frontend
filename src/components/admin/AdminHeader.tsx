"use client";

import React from "react";
import { Search, Bell, LogOut, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { useAppStore } from "@/stores/useAppStore";
import { api } from "@/lib/axiosInstance";
import { useRouter } from "next/navigation";

import Link from "next/link";

export function AdminHeader() {
  const { user, logout } = useAppStore();
  const router = useRouter();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
      logout();
      router.push("/login");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 border-b-2 border-gray-300 shadow-md backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="flex h-16 items-center px-4 md:px-6 gap-4">
        {/* Left: Logo and Mobile Hamburger */}
        <div className="flex items-center gap-2 md:gap-4 shrink-0">
          <SidebarTrigger className="h-9 w-9 -ml-2" />
          <div className="hidden md:flex items-center gap-2 font-bold text-lg text-primary">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
              G
            </div>
            <span>Grosur Admin</span>
          </div>
        </div>

        {/* Search */}
        <div className="flex-1 flex md:ml-6 items-center justify-end md:justify-start">
          <div className="relative w-full max-w-md hidden md:flex">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search..."
              className="w-full pl-8 bg-muted/50 rounded-full border-muted-foreground/20 focus-visible:ring-primary/50"
            />
          </div>
          {/* Mobile Search Icon */}
          <div className="md:hidden">
            <Button variant="ghost" size="icon">
              <Search className="h-5 w-5" />
              <span className="sr-only">Search</span>
            </Button>
          </div>
        </div>

        {/* Right: Notifications & Profile Dropdown */}
        <div className="flex items-center gap-2 md:gap-4 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="relative text-muted-foreground hover:text-foreground"
          >
            <Bell className="h-5 w-5" />
            {/* Notification Dot indicator */}
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-destructive border border-background"></span>
            <span className="sr-only">Notifications</span>
          </Button>

          {mounted ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-9 w-9 rounded-full ml-1"
                >
                  <Avatar className="h-9 w-9 border border-border">
                    <AvatarImage src="/placeholder-avatar.png" alt="@admin" />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {user ? user.name?.charAt(0).toUpperCase() : "AD"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal border-b pb-2 mb-1">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user?.name || "Admin User"}</p>
                    <p className="text-xs text-muted-foreground">
                      {user?.email || "admin@grosur.com"}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link href="/profile" className="flex w-full items-center">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={handleLogout}
                  className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="h-9 w-9 rounded-full bg-muted animate-pulse ml-1" />
          )}
        </div>
      </div>
    </header>
  );
}
