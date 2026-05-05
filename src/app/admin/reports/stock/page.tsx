"use client";

import * as React from "react";
import { Suspense } from "react";
import { toast } from "sonner";
import { useSearchParams, useRouter, usePathname } from "next/navigation";

import { reportService, StockSummaryReport } from "@/services/reportService";
import { salesService } from "@/services/salesService";
import { useAppStore } from "@/stores/useAppStore";
import { StockReportDetailModal } from "@/components/admin/reports/StockReportDetailModal";

import { StockPrintHeader } from "@/components/admin/reports/stock/StockPrintHeader";
import { StockPageHeader } from "@/components/admin/reports/stock/StockPageHeader";
import { StockSummaryCards } from "@/components/admin/reports/stock/StockSummaryCards";
import { StockFilters } from "@/components/admin/reports/stock/StockFilters";
import { StockTable } from "@/components/admin/reports/stock/StockTable";

const months = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

function StockReportContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user } = useAppStore();
  const isSuperAdmin = user?.role === "SUPER_ADMIN";

  const [reports, setReports] = React.useState<StockSummaryReport[]>([]);
  const [stores, setStores] = React.useState<{ id: string; name: string }[]>(
    [],
  );
  const [isLoading, setIsLoading] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState("");

  const [selectedProduct, setSelectedProduct] = React.useState<{
    id: string;
    name: string;
  } | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const month = parseInt(
    searchParams.get("month") || String(new Date().getMonth() + 1),
  );
  const year = parseInt(searchParams.get("year") || String(currentYear));
  const storeId = searchParams.get("storeId") || "";

  React.useEffect(() => {
    if (isSuperAdmin) {
      salesService
        .getStores()
        .then((res) => {
          if (res.success) setStores(res.data);
        })
        .catch((err) => console.error("Failed to fetch stores", err));
    }
  }, [isSuperAdmin]);

  const fetchReport = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await reportService.getStockSummary({
        month,
        year,
        storeId: storeId || undefined,
      });
      if (response.success) {
        setReports(response.data);
      }
    } catch (error) {
      toast.error("Gagal memuat laporan stok");
    } finally {
      setIsLoading(false);
    }
  }, [month, year, storeId]);

  React.useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const updateFilters = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value && value !== "all") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  const filteredReports = reports.filter((r) =>
    r.productName.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleViewDetail = (productId: string, productName: string) => {
    setSelectedProduct({ id: productId, name: productName });
    setIsModalOpen(true);
  };

  const printStoreName =
    storeId === "all"
      ? "Semua Toko"
      : stores.find((s) => s.id === storeId)?.name ||
        user?.managedStore?.name ||
        "Toko Utama";

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <StockPrintHeader
        monthName={months[month - 1]}
        year={year}
        storeName={printStoreName}
      />

      <StockPageHeader />

      <StockSummaryCards reports={reports} isLoading={isLoading} />

      <StockFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        month={month}
        year={year}
        storeId={storeId}
        months={months}
        years={years}
        stores={stores}
        isSuperAdmin={isSuperAdmin}
        onFilterChange={updateFilters}
      />

      <StockTable
        reports={filteredReports}
        isLoading={isLoading}
        isSuperAdmin={isSuperAdmin}
        monthName={months[month - 1]}
        year={year}
        onViewDetail={handleViewDetail}
      />

      {selectedProduct && (
        <StockReportDetailModal
          isOpen={isModalOpen}
          onOpenChange={setIsModalOpen}
          productId={selectedProduct.id}
          productName={selectedProduct.name}
          storeId={storeId || user?.managedStore?.id || ""}
          month={month}
          year={year}
        />
      )}
    </div>
  );
}

export default function StockReportPage() {
  return (
    <Suspense
      fallback={<div className="p-8 text-center">Loading Report...</div>}
    >
      <StockReportContent />
    </Suspense>
  );
}
