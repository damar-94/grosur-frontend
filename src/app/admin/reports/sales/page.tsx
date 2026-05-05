"use client";

import * as React from "react";
import { Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { toast } from "sonner";
import { salesService, SalesTransaction, SalesSummary, MonthlyTrend } from "@/services/salesService";
import { useAppStore } from "@/stores/useAppStore";

import { SalesReportSkeleton } from "@/components/admin/reports/sales/SalesReportSkeleton";
import { SalesHeader } from "@/components/admin/reports/sales/SalesHeader";
import { SalesFilters } from "@/components/admin/reports/sales/SalesFilters";
import { SalesSummaryCards } from "@/components/admin/reports/sales/SalesSummaryCards";
import { SalesCharts } from "@/components/admin/reports/sales/SalesCharts";
import { TopItemsSection } from "@/components/admin/reports/sales/TopItemsSection";
import { SalesTable } from "@/components/admin/reports/sales/SalesTable";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("id-ID", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getStatusColor(status: string) {
  switch (status) {
    case "CONFIRMED": return "bg-green-500 hover:bg-green-600";
    case "SENT": return "bg-purple-500 hover:bg-purple-600";
    case "PROCESSED": return "bg-blue-500 hover:bg-blue-600";
    case "WAITING_CONFIRMATION": return "bg-yellow-500 hover:bg-yellow-600";
    case "WAITING_PAYMENT": return "bg-slate-500 hover:bg-slate-600";
    case "CANCELLED": return "bg-red-500 hover:bg-red-600";
    default: return "bg-gray-500 hover:bg-gray-600";
  }
}

function SalesReportContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { user } = useAppStore();
  const isSuperAdmin = user?.role === "SUPER_ADMIN";
  const managedStoreId = user?.managedStore?.id;

  const month = searchParams.get("month") ? parseInt(searchParams.get("month")!) : undefined;
  const year = searchParams.get("year") ? parseInt(searchParams.get("year")!) : new Date().getFullYear();
  const rawStoreId = searchParams.get("storeId") || undefined;
  const storeId = isSuperAdmin ? rawStoreId : managedStoreId;
  const page = parseInt(searchParams.get("page") || "1");

  const [transactions, setTransactions] = React.useState<SalesTransaction[]>([]);
  const [summary, setSummary] = React.useState<SalesSummary | null>(null);
  const [trends, setTrends] = React.useState<MonthlyTrend[]>([]);
  const [byProduct, setByProduct] = React.useState<any[]>([]);
  const [byCategory, setByCategory] = React.useState<any[]>([]);
  const [pagination, setPagination] = React.useState<{ page: number; totalPages: number; total: number } | null>(null);
  const [stores, setStores] = React.useState<Array<{ id: string; name: string }>>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isExporting, setIsExporting] = React.useState(false);

  React.useEffect(() => {
    salesService.getStores().then((res) => {
      if (res.success) setStores(res.data);
    }).catch((err) => console.error("Failed to fetch stores", err));
  }, []);

  React.useEffect(() => {
    const fetchSalesReport = async () => {
      setIsLoading(true);
      try {
        const response = await salesService.getSalesReport({ month, year, storeId, page, limit: 10 });
        if (response.success) {
          setTransactions(response.data.transactions);
          setSummary(response.data.summary);
          setTrends(response.data.trends);
          setByProduct(response.data.byProduct);
          setByCategory(response.data.byCategory);
          setPagination(response.data.pagination);
        }
      } catch (error: any) {
        toast.error(error?.response?.data?.message || "Gagal memuat laporan penjualan.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchSalesReport();
  }, [month, year, storeId, page]);

  const updateFilters = (newFilters: { month?: number | null; year?: number | null; storeId?: string | null; page?: number }) => {
    const params = new URLSearchParams(searchParams.toString());
    if (newFilters.month !== undefined) newFilters.month !== null ? params.set("month", String(newFilters.month)) : params.delete("month");
    if (newFilters.year !== undefined) newFilters.year !== null ? params.set("year", String(newFilters.year)) : params.delete("year");
    if (newFilters.storeId !== undefined) newFilters.storeId !== null ? params.set("storeId", newFilters.storeId) : params.delete("storeId");
    newFilters.page !== undefined ? params.set("page", String(newFilters.page)) : params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleExportCSV = async () => {
    setIsExporting(true);
    try {
      const blob = await salesService.exportSalesCSV({ month, year, storeId });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `sales-report-${year}-${month || "all"}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Laporan berhasil diunduh!");
    } catch (error) {
      toast.error("Gagal mengunduh laporan.");
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading) return <SalesReportSkeleton />;

  return (
    <div className="space-y-6">
      <SalesHeader onExport={handleExportCSV} isExporting={isExporting} hasData={transactions.length > 0} />
      <SalesFilters month={month} year={year} storeId={storeId} stores={stores} isSuperAdmin={isSuperAdmin} onFilterChange={updateFilters} onReset={() => router.push(pathname)} />
      <SalesSummaryCards summary={summary} currentMonthOrders={trends.length > 0 ? trends[trends.length - 1].orders : 0} formatCurrency={formatCurrency} />
      <SalesCharts trends={trends} formatCurrency={formatCurrency} />
      <TopItemsSection byProduct={byProduct} byCategory={byCategory} formatCurrency={formatCurrency} />
      <SalesTable transactions={transactions} pagination={pagination} page={page} onPageChange={(p) => updateFilters({ page: p })} formatCurrency={formatCurrency} formatDate={formatDate} getStatusColor={getStatusColor} />
    </div>
  );
}

export default function SalesReportPage() {
  return (
    <Suspense fallback={<SalesReportSkeleton />}>
      <SalesReportContent />
    </Suspense>
  );
}
