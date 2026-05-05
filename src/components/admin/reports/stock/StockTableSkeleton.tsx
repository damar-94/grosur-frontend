"use client";

import { TableCell, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

interface StockTableSkeletonProps {
  isSuperAdmin: boolean;
}

export function StockTableSkeleton({ isSuperAdmin }: StockTableSkeletonProps) {
  return (
    <>
      {[1, 2, 3, 4, 5].map((i) => (
        <TableRow key={i}>
          <TableCell className="print:hidden"><Skeleton className="h-4 w-4 mx-auto" /></TableCell>
          <TableCell><Skeleton className="h-4 w-24" /></TableCell>
          <TableCell><Skeleton className="h-4 w-40" /></TableCell>
          {isSuperAdmin && <TableCell><Skeleton className="h-4 w-24" /></TableCell>}
          <TableCell><Skeleton className="h-4 w-12 mx-auto" /></TableCell>
          <TableCell><Skeleton className="h-8 w-20 mx-auto rounded-full" /></TableCell>
          <TableCell><Skeleton className="h-8 w-20 mx-auto rounded-full" /></TableCell>
          <TableCell><Skeleton className="h-6 w-12 mx-auto" /></TableCell>
          <TableCell className="text-right print:hidden"><Skeleton className="h-9 w-32 ml-auto" /></TableCell>
        </TableRow>
      ))}
      <style jsx global>{`
        @media print {
          body {
            background: white !important;
          }
          .print\\:hidden, 
          button, 
          aside, 
          nav, 
          header,
          .fixed,
          [role="dialog"] {
            display: none !important;
          }
          .main-content, 
          .container, 
          .space-y-6 {
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
          }
          .card, .shadow-xl, .shadow-sm {
            box-shadow: none !important;
            border: 1px solid #eee !important;
          }
          table {
            width: 100% !important;
            border-collapse: collapse !important;
          }
          th {
            background-color: #f8fafc !important;
            -webkit-print-color-adjust: exact;
          }
          .text-emerald-700 { color: #065f46 !important; }
          .bg-emerald-50 { background-color: #ecfdf5 !important; -webkit-print-color-adjust: exact; }
          .text-rose-700 { color: #9f1239 !important; }
          .bg-rose-50 { background-color: #fff1f2 !important; -webkit-print-color-adjust: exact; }
        }
      `}</style>
    </>
  );
}
