"use client";

import * as React from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { 
  Download, 
  TrendingUp, 
  ShoppingCart, 
  DollarSign, 
  Percent,
  Calendar,
  Store,
  Filter,
  Package,
} from "lucide-react";
import { toast } from "sonner";

import { salesService, SalesTransaction, SalesSummary, MonthlyTrend } from "@/services/salesService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line
} from "recharts";

export default function SalesReportPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Filter states from URL
  const month = searchParams.get("month") ? parseInt(searchParams.get("month")!) : undefined;
  const year = searchParams.get("year") ? parseInt(searchParams.get("year")!) : new Date().getFullYear();
  const storeId = searchParams.get("storeId") || undefined;
  const page = parseInt(searchParams.get("page") || "1");

  // Data states
  const [transactions, setTransactions] = React.useState<SalesTransaction[]>([]);
  const [summary, setSummary] = React.useState<SalesSummary | null>(null);
  const [trends, setTrends] = React.useState<MonthlyTrend[]>([]);
  const [byProduct, setByProduct] = React.useState<any[]>([]);
  const [byCategory, setByCategory] = React.useState<any[]>([]);
  const [pagination, setPagination] = React.useState<{ page: number; totalPages: number; total: number } | null>(null);
  const [stores, setStores] = React.useState<Array<{ id: string; name: string }>>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isExporting, setIsExporting] = React.useState(false);

  // Fetch stores on mount
  React.useEffect(() => {
    const fetchStores = async () => {
      try {
        const response = await salesService.getStores();
        if (response.success) {
          setStores(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch stores", error);
      }
    };
    fetchStores();
  }, []);

  // Fetch sales report when filters change
  React.useEffect(() => {
    const fetchSalesReport = async () => {
      setIsLoading(true);
      try {
        const response = await salesService.getSalesReport({
          month,
          year,
          storeId,
          page,
          limit: 10,
        });

        if (response.success) {
          setTransactions(response.data.transactions);
          setSummary(response.data.summary);
          setTrends(response.data.trends);
          setByProduct(response.data.byProduct);
          setByCategory(response.data.byCategory);
          setPagination({
            page: response.data.pagination.page,
            totalPages: response.data.pagination.totalPages,
            total: response.data.pagination.total,
          });
        }
      } catch (error: any) {
        console.error("Failed to fetch sales report", error);
        const errorMessage = error?.response?.status === 404
            ? "Endpoint laporan penjualan belum tersedia di backend. Hubungi developer backend untuk mengaktifkan fitur ini."
            : error?.response?.data?.message
          || "Gagal memuat laporan penjualan. Pastikan backend server sudah berjalan.";
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSalesReport();
  }, [month, year, storeId, page]);

  // Update URL params
  const updateFilters = (newFilters: { month?: number | null; year?: number | null; storeId?: string | null; page?: number }) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (newFilters.month !== undefined) {
      if (newFilters.month !== null) params.set("month", String(newFilters.month));
      else params.delete("month");
    }
    
    if (newFilters.year !== undefined) {
      if (newFilters.year !== null) params.set("year", String(newFilters.year));
      else params.delete("year");
    }

    if (newFilters.storeId !== undefined) {
      if (newFilters.storeId !== null) params.set("storeId", newFilters.storeId);
      else params.delete("storeId");
    }

    if (newFilters.page !== undefined) {
      params.set("page", String(newFilters.page));
    } else {
      params.set("page", "1"); // Reset to page 1 on filter change
    }

    router.push(`${pathname}?${params.toString()}`);
  };

  // Export to CSV
  const handleExportCSV = async () => {
    setIsExporting(true);
    try {
      const blob = await salesService.exportSalesCSV({
        month,
        year,
        storeId,
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `sales-report-${year}-${month || "all"}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success("Laporan berhasil diunduh!");
    } catch (error: unknown) {
      console.error("Failed to export CSV", error);
      toast.error("Gagal mengunduh laporan.");
    } finally {
      setIsExporting(false);
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return "bg-green-500 hover:bg-green-600";
      case "SENT":
        return "bg-purple-500 hover:bg-purple-600";
      case "PROCESSED":
        return "bg-blue-500 hover:bg-blue-600";
      case "WAITING_CONFIRMATION":
        return "bg-yellow-500 hover:bg-yellow-600";
      case "WAITING_PAYMENT":
        return "bg-slate-500 hover:bg-slate-600";
      case "CANCELLED":
        return "bg-red-500 hover:bg-red-600";
      default:
        return "bg-gray-500 hover:bg-gray-600";
    }
  };

  if (isLoading) {
    return <SalesReportSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Laporan Penjualan</h2>
          <p className="text-muted-foreground mt-1">
            Analisis dan pantau performa penjualan toko Anda
          </p>
        </div>
        <Button
          onClick={handleExportCSV}
          disabled={isExporting || transactions.length === 0}
          className="gap-2"
        >
          <Download className="h-4 w-4" />
          {isExporting ? "Mengunduh..." : "Export CSV"}
        </Button>
      </div>

      {/* Filter Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Filter className="h-5 w-5" />
            Filter Laporan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Month Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Bulan
              </label>
              <Select
                value={month?.toString() || "all"}
                onValueChange={(value) =>
                  updateFilters({ month: value === "all" ? null : parseInt(value) })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih bulan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Bulan</SelectItem>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                    <SelectItem key={m} value={m.toString()}>
                      {new Date(2000, m - 1).toLocaleString("id-ID", { month: "long" })}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Year Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Tahun
              </label>
              <Select
                value={year?.toString()}
                onValueChange={(value) => updateFilters({ year: parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih tahun" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map((y) => (
                    <SelectItem key={y} value={y.toString()}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Store Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Store className="h-4 w-4" />
                Toko
              </label>
              <Select
                value={storeId || "all"}
                onValueChange={(value) =>
                  updateFilters({ storeId: value === "all" ? null : value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih toko" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Toko</SelectItem>
                  {stores.map((store) => (
                    <SelectItem key={store.id} value={store.id}>
                      {store.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Reset Filters */}
            <div className="space-y-2 flex items-end">
              <Button
                variant="outline"
                onClick={() => {
                  router.push(pathname);
                }}
                className="w-full"
              >
                Reset Filter
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Pendapatan</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#00997a]">
                {formatCurrency(summary.totalRevenue)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Dari {summary.totalOrders} transaksi
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Pesanan</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.totalOrders}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Rata-rata {formatCurrency(summary.averageOrderValue)}/order
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Diskon</CardTitle>
              <Percent className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {formatCurrency(summary.totalDiscount)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Potongan harga diberikan
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tren Penjualan</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {trends.length > 0 ? trends[trends.length - 1].orders : 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Order bulan ini
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Charts */}
      {trends.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Tren Pendapatan Bulanan</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={trends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip
                    formatter={(value) => [formatCurrency(Number(value)), "Pendapatan"]}
                  />
                  <Bar dataKey="revenue" fill="#00997a" name="Pendapatan" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Orders Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Tren Jumlah Pesanan</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="orders"
                    stroke="#00997a"
                    strokeWidth={2}
                    name="Jumlah Order"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Aggregations */}
      {(byProduct.length > 0 || byCategory.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Products */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-[#00997a]" />
                Produk Terlaris
              </CardTitle>
            </CardHeader>
            <CardContent>
              {byProduct.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                  {byProduct.slice(0, 5).map((item, index) => (
                    <div 
                      key={item.productId} 
                      className="flex items-center gap-4 p-3 rounded-xl border border-transparent hover:border-slate-100 hover:bg-slate-50/50 transition-all group"
                    >
                      <div className="relative h-16 w-16 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
                        {item.productImage ? (
                          <img 
                            src={item.productImage} 
                            alt={item.productName}
                            className="object-cover h-full w-full group-hover:scale-110 transition-transform duration-500"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-slate-400">
                            <Package className="h-6 w-6" />
                          </div>
                        )}
                        <div className="absolute top-0 left-0 bg-[#00997a] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-br-lg shadow-sm">
                          #{index + 1}
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-slate-900 truncate group-hover:text-[#00997a] transition-colors">
                          {item.productName}
                        </h4>
                        <p className="text-xs text-muted-foreground mt-0.5">{item.categoryName}</p>
                        <div className="flex items-center gap-3 mt-2">
                          <div className="flex items-center gap-1 text-xs font-medium text-slate-600">
                            <ShoppingCart className="h-3 w-3 text-blue-500" />
                            {item.quantity} terjual
                          </div>
                          <div className="flex items-center gap-1 text-xs font-bold text-[#00997a]">
                            Rp {new Intl.NumberFormat("id-ID").format(item.revenue)}
                          </div>
                        </div>
                      </div>
                      
                      <div className="hidden sm:block">
                         <div className="h-1.5 w-16 bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-[#00997a]" 
                              style={{ width: `${Math.min(100, (item.revenue / byProduct[0].revenue) * 100)}%` }}
                            />
                         </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="bg-slate-50 p-4 rounded-full mb-4">
                    <Package className="h-8 w-8 text-slate-300" />
                  </div>
                  <p className="text-sm text-muted-foreground font-medium">Belum ada data produk terlaris.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Top Categories */}
          <Card>
            <CardHeader>
              <CardTitle>Kategori Populer</CardTitle>
            </CardHeader>
            <CardContent>
              {byCategory.length > 0 ? (
                <div className="rounded-md border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Kategori</TableHead>
                        <TableHead className="text-right">Qty</TableHead>
                        <TableHead className="text-right">Revenue</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {byCategory.slice(0, 5).map((item) => (
                        <TableRow key={item.categoryId}>
                          <TableCell className="font-medium">{item.categoryName}</TableCell>
                          <TableCell className="text-right">{item.quantity}</TableCell>
                          <TableCell className="text-right font-semibold">
                            {formatCurrency(item.revenue)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground italic">
                  Belum ada data kategori untuk periode ini.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Detail Transaksi</CardTitle>
        </CardHeader>
        <CardContent>
          {transactions.length > 0 ? (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>No. Order</TableHead>
                      <TableHead>Pelanggan</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Diskon</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Tanggal</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell className="font-medium">
                          {transaction.orderNumber}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{transaction.customerName}</p>
                            <p className="text-xs text-muted-foreground">
                              {transaction.customerEmail}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>{formatCurrency(transaction.finalAmount)}</TableCell>
                        <TableCell>
                          {transaction.discountAmount > 0 ? (
                            <span className="text-orange-600">
                              -{formatCurrency(transaction.discountAmount)}
                            </span>
                          ) : (
                            "-"
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(transaction.status)}>
                            {transaction.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {formatDate(transaction.createdAt)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {pagination && pagination.totalPages > 1 && (
                <div className="mt-4">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            if (page > 1) updateFilters({ page: page - 1 });
                          }}
                          className={
                            page <= 1
                              ? "pointer-events-none opacity-50"
                              : "cursor-pointer"
                          }
                        />
                      </PaginationItem>

                      {Array.from(
                        { length: Math.min(5, pagination.totalPages) },
                        (_, i) => {
                          let pageNum;
                          if (pagination.totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (page <= 3) {
                            pageNum = i + 1;
                          } else if (page >= pagination.totalPages - 2) {
                            pageNum = pagination.totalPages - 4 + i;
                          } else {
                            pageNum = page - 2 + i;
                          }
                          return (
                            <PaginationItem key={pageNum}>
                              <PaginationLink
                                href="#"
                                onClick={(e) => {
                                  e.preventDefault();
                                  updateFilters({ page: pageNum });
                                }}
                                isActive={page === pageNum}
                              >
                                {pageNum}
                              </PaginationLink>
                            </PaginationItem>
                          );
                        }
                      )}

                      <PaginationItem>
                        <PaginationNext
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            if (page < pagination.totalPages)
                              updateFilters({ page: page + 1 });
                          }}
                          className={
                            page >= pagination.totalPages
                              ? "pointer-events-none opacity-50"
                              : "cursor-pointer"
                          }
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                  <p className="text-xs text-muted-foreground text-center mt-2">
                    Menampilkan {(page - 1) * 10 + 1}-{Math.min(page * 10, pagination.total)} dari{" "}
                    {pagination.total} transaksi
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                Tidak ada transaksi untuk periode yang dipilih.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function SalesReportSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-10" />
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-3 w-24 mt-2" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-40" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[300px]" />
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[400px]" />
        </CardContent>
      </Card>
    </div>
  );
}
