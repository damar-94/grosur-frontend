"use client";

import { useState } from "react";
import { Tag, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { api } from "@/lib/axiosInstance";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export interface VoucherResult {
  valid: boolean;
  voucher: {
    id: string;
    code: string;
    type: string;
    value: number;
    maxDiscount?: number;
  };
  discountAmount: number;
}

interface VoucherInputProps {
  cartTotal: number;
  onApplied: (result: VoucherResult | null) => void;
}

export default function VoucherInput({ cartTotal, onApplied }: VoucherInputProps) {
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [appliedCode, setAppliedCode] = useState("");

  const handleApply = async () => {
    if (!code.trim()) return;
    setIsLoading(true);
    setStatus("idle");
    setMessage("");
    try {
      const res = await api.post("/vouchers/validate", {
        code: code.trim().toUpperCase(),
        cartTotal,
      });
      if (res.data.success) {
        const result: VoucherResult = res.data.data;
        setStatus("success");
        setAppliedCode(code.trim().toUpperCase());
        setMessage(
          `Voucher berhasil! Hemat Rp${result.discountAmount.toLocaleString("id-ID")}`
        );
        onApplied(result);
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setStatus("error");
      setMessage(error.response?.data?.message || "Kode voucher tidak valid.");
      onApplied(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemove = () => {
    setCode("");
    setAppliedCode("");
    setStatus("idle");
    setMessage("");
    onApplied(null);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Tag className="h-4 w-4 text-primary shrink-0" />
        <span className="text-sm font-semibold text-gray-700">Kode Voucher</span>
      </div>

      <div className="flex gap-2">
        <Input
          placeholder="Masukkan kode voucher"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          disabled={!!appliedCode || isLoading}
          onKeyDown={(e) => e.key === "Enter" && handleApply()}
          className="uppercase tracking-wider font-mono text-sm"
        />
        {appliedCode ? (
          <Button
            variant="outline"
            className="shrink-0 border-red-300 text-red-600 hover:bg-red-50"
            onClick={handleRemove}
          >
            Hapus
          </Button>
        ) : (
          <Button
            onClick={handleApply}
            disabled={!code.trim() || isLoading}
            className="shrink-0"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Terapkan"
            )}
          </Button>
        )}
      </div>

      {status === "success" && (
        <div className="flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {status === "error" && (
        <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          <XCircle className="h-4 w-4 shrink-0" />
          <span>{message}</span>
        </div>
      )}
    </div>
  );
}
