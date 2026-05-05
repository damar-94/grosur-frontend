"use client";

interface StockPrintHeaderProps {
  monthName: string;
  year: number;
  storeName: string;
}

export function StockPrintHeader({ monthName, year, storeName }: StockPrintHeaderProps) {
  return (
    <div className="hidden print:block mb-6 border-b pb-4">
      <h1 className="text-2xl font-bold">Laporan Mutasi Stok - Grosur</h1>
      <div className="flex justify-between mt-2 text-sm">
        <div>
          <p><span className="font-semibold">Periode:</span> {monthName} {year}</p>
          <p><span className="font-semibold">Toko:</span> {storeName}</p>
        </div>
        <div className="text-right">
          <p><span className="font-semibold">Tanggal Cetak:</span> {new Date().toLocaleDateString("id-ID")}</p>
        </div>
      </div>
    </div>
  );
}
