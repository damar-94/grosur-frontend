"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Search, Filter, RotateCcw } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { adminService, PaginationData, User, UserListParams } from "@/services/adminService";
import { UserTable } from "@/components/admin/UserTable";

function UsersListContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState<PaginationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Sync state with URL params
  const page = searchParams.get("page") || "1";
  const search = searchParams.get("search") || "";
  const role = searchParams.get("role") || "ALL";
  const status = searchParams.get("status") || "ALL";

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: UserListParams = {
        page,
        search,
        role: role === "ALL" ? undefined : role,
        isVerified: status === "ALL" ? undefined : status === "VERIFIED" ? "true" : "false",
      };
      const response = await adminService.getUsers(params);
      setUsers(response.data);
      setPagination(response.pagination);
    } catch (error: unknown) {
      if (error instanceof Error) {
        const axiosError = error as any;
        toast.error(axiosError.response?.data?.message || "Failed to load users");
      } else {
        toast.error("An unknown error occurred");
      }
    } finally {
      setIsLoading(false);
    }
  }, [page, search, role, status]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const updateFilters = (newFilters: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });
    // Reset to page 1 on filter change
    if (!newFilters.page) params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const query = formData.get("search") as string;
    updateFilters({ search: query });
  };

  const handleReset = () => {
    // Clear all filters from URL
    router.push(pathname);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manage Users</h1>
          <p className="text-muted-foreground">
            View and monitor all registered accounts in the system.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Filter className="h-4 w-4" /> Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <form onSubmit={handleSearch} className="flex-1 flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  name="search"
                  placeholder="Search by name or email..."
                  className="pl-9"
                  defaultValue={search}
                />
              </div>
              <Button type="submit">Search</Button>
            </form>

            <div className="flex gap-2 flex-wrap">
              <Select
                value={role}
                onValueChange={(value) => updateFilters({ role: value })}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Roles</SelectItem>
                  <SelectItem value="USER">User</SelectItem>
                  <SelectItem value="STORE_ADMIN">Store Admin</SelectItem>
                  <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={status}
                onValueChange={(value) => updateFilters({ status: value })}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Status</SelectItem>
                  <SelectItem value="VERIFIED">Verified</SelectItem>
                  <SelectItem value="UNVERIFIED">Unverified</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-4 pt-2 border-t">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Join Date:</span>
              <Input
                type="date"
                className="w-auto h-9"
                value={searchParams.get("startDate") || ""}
                onChange={(e) => updateFilters({ startDate: e.target.value })}
              />
              <span>to</span>
              <Input
                type="date"
                className="w-auto h-9"
                value={searchParams.get("endDate") || ""}
                onChange={(e) => updateFilters({ endDate: e.target.value })}
              />
            </div>
            
            <div className="ml-auto">
              <Button variant="outline" size="sm" onClick={handleReset} className="text-xs h-9">
                <RotateCcw className="mr-2 h-3.5 w-3.5" /> Reset All Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          ) : (
            <UserTable
              users={users}
              pagination={pagination || { page: 1, totalPage: 1, totalRows: 0 }}
              onPageChange={(p) => updateFilters({ page: p.toString() })}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function UsersListPage() {
  return (
    <Suspense fallback={<div className="p-6">Loading User Management...</div>}>
      <UsersListContent />
    </Suspense>
  );
}
