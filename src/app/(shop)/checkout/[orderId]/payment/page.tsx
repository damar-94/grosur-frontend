"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import {
  FiUpload,
  FiCheckCircle,
  FiArrowLeft,
  FiLoader,
  FiCopy,
  FiAlertCircle,
  FiImage,
  FiX,
  FiPackage,
  FiClock,
  FiAlertTriangle,
} from "react-icons/fi";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { fetchOrder, uploadPaymentProof, cancelOrder as cancelOrderService, type Order } from "@/services/checkoutService";
import { useAppStore } from "@/stores/useAppStore";

// ─── Bank Transfer Info ───────────────────────────────────────────────────────
const BANK_ACCOUNTS = [
  { bank: "BCA", account: "1234567890", name: "PT. Grosur Indonesia" },
  { bank: "Mandiri", account: "0987654321", name: "PT. Grosur Indonesia" },
];

// ─── Allowed file types & max size ────────────────────────────────────────────
const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png"];
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/jpg"];
const MAX_FILE_SIZE = 1 * 1024 * 1024; // 1MB

// ─── Payment Deadline: 1 hour ─────────────────────────────────────────────────
const PAYMENT_DEADLINE_MS = 60 * 60 * 1000; // 1 hour

export default function PaymentPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const { user } = useAppStore();
  const router = useRouter();

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [copiedAcc, setCopiedAcc] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // ─── Countdown Timer State ──────────────────────────────────────────────────
  const [timeLeft, setTimeLeft] = useState<number>(PAYMENT_DEADLINE_MS);
  const [isExpired, setIsExpired] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // ─── Data Fetch ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }
    const load = async () => {
      try {
        const data = await fetchOrder(orderId);
        setOrder(data);

        // Calculate remaining time
        const createdAt = new Date(data.createdAt).getTime();
        const remaining = PAYMENT_DEADLINE_MS - (Date.now() - createdAt);
        if (remaining <= 0) {
          setIsExpired(true);
          setTimeLeft(0);
        } else {
          setTimeLeft(remaining);
        }
      } catch {
        toast.error("Pesanan tidak ditemukan");
        router.push("/orders");
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [orderId, user, router]);

  // ─── Countdown Timer ────────────────────────────────────────────────────────
  useEffect(() => {
    if (isExpired || uploadSuccess || !order) return;
    if (order.paymentStatus === "PAID" || order.status === "WAITING_CONFIRMATION") return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1000) {
          setIsExpired(true);
          clearInterval(interval);
          return 0;
        }
        return prev - 1000;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isExpired, uploadSuccess, order]);

  // ─── Format time ────────────────────────────────────────────────────────────
  const formatTime = (ms: number) => {
    const totalSec = Math.max(0, Math.floor(ms / 1000));
    const hours = Math.floor(totalSec / 3600);
    const minutes = Math.floor((totalSec % 3600) / 60);
    const seconds = totalSec % 60;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  };

  // ─── File Validation ────────────────────────────────────────────────────────
  const validateFile = useCallback((file: File): string | null => {
    // Check extension
    const fileName = file.name.toLowerCase();
    const hasValidExt = ALLOWED_EXTENSIONS.some((ext) => fileName.endsWith(ext));
    if (!hasValidExt) {
      return "Hanya file .jpg, .jpeg, dan .png yang diperbolehkan";
    }

    // Check MIME type
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return "Format file tidak valid. Hanya JPG, JPEG, dan PNG yang diperbolehkan";
    }

    // Check file size (max 1MB)
    if (file.size > MAX_FILE_SIZE) {
      return `Ukuran file maksimal 1 MB. File Anda: ${(file.size / 1024 / 1024).toFixed(2)} MB`;
    }

    return null;
  }, []);

  // ─── File Handling ──────────────────────────────────────────────────────────
  const processFile = useCallback(
    (file: File) => {
      const error = validateFile(file);
      if (error) {
        toast.error(error);
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    },
    [validateFile]
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processFile(file);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ─── Drag & Drop ───────────────────────────────────────────────────────────
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  // ─── Upload ──────────────────────────────────────────────────────────────────
  const handleUpload = async () => {
    if (!selectedFile || !order) return;

    if (isExpired) {
      toast.error("Batas waktu pembayaran telah habis. Pesanan dibatalkan otomatis.");
      return;
    }

    setIsUploading(true);
    try {
      await uploadPaymentProof(order.id, selectedFile);
      setUploadSuccess(true);
      toast.success("Bukti pembayaran berhasil dikirim!");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Gagal mengunggah bukti pembayaran");
    } finally {
      setIsUploading(false);
    }
  };

  // ─── Copy Account ─────────────────────────────────────────────────────────────
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAcc(text);
    toast.success("Nomor rekening disalin!");
    setTimeout(() => setCopiedAcc(null), 2000);
  };

  // ─── Cancel Order ─────────────────────────────────────────────────────────────
  const handleCancelOrder = async () => {
    setIsLoading(true);
    try {
      await cancelOrderService(orderId as string);
      toast.success("Pesanan berhasil dibatalkan");
      router.push(`/orders/${orderId}`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Gagal membatalkan pesanan");
      setIsLoading(false);
    }
  };

  // ─── Loading ──────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="max-w-[680px] mx-auto px-4 py-16 flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-[#00997a] border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-500 text-sm">Memuat detail pembayaran...</p>
      </div>
    );
  }

  if (!order) return null;

  const isManual = order.paymentMethod === "MANUAL_TRANSFER";
  const isPaid = order.paymentStatus === "PAID";
  const isWaitingConfirmation = order.status === "WAITING_CONFIRMATION";

  // Determine timer urgency
  const isUrgent = timeLeft < 10 * 60 * 1000; // < 10 minutes
  const isCritical = timeLeft < 5 * 60 * 1000; // < 5 minutes

  return (
    <div className="max-w-[680px] mx-auto px-4 py-8">
      {/* ── Header ── */}
      <div className="flex items-center gap-3 mb-8">
        <Link href="/orders" className="text-gray-400 hover:text-[#00997a] transition-colors">
          <FiArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[#1a1a1a]">
            {uploadSuccess || isPaid || isWaitingConfirmation
              ? "Pembayaran Berhasil"
              : isExpired
              ? "Waktu Habis"
              : "Selesaikan Pembayaran"}
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Pesanan #{order.orderNumber || order.id.slice(0, 8).toUpperCase()}
          </p>
        </div>
      </div>

      {/* ── Countdown Timer ── */}
      {isManual && !uploadSuccess && !isPaid && !isWaitingConfirmation && !isExpired && (
        <div
          className={`mb-6 rounded-2xl border-2 p-4 flex items-center gap-4 transition-all ${
            isCritical
              ? "bg-red-50 border-red-200 animate-pulse"
              : isUrgent
              ? "bg-amber-50 border-amber-200"
              : "bg-blue-50 border-blue-200"
          }`}
        >
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
              isCritical
                ? "bg-red-100"
                : isUrgent
                ? "bg-amber-100"
                : "bg-blue-100"
            }`}
          >
            <FiClock
              size={24}
              className={
                isCritical
                  ? "text-red-500"
                  : isUrgent
                  ? "text-amber-500"
                  : "text-blue-500"
              }
            />
          </div>
          <div className="flex-1">
            <p
              className={`text-xs font-semibold uppercase tracking-wide ${
                isCritical
                  ? "text-red-500"
                  : isUrgent
                  ? "text-amber-600"
                  : "text-blue-600"
              }`}
            >
              Batas Waktu Pembayaran
            </p>
            <p
              className={`text-2xl font-extrabold tracking-wider font-mono ${
                isCritical
                  ? "text-red-600"
                  : isUrgent
                  ? "text-amber-700"
                  : "text-blue-700"
              }`}
            >
              {formatTime(timeLeft)}
            </p>
          </div>
          <p
            className={`text-[10px] font-medium max-w-[120px] text-right ${
              isCritical
                ? "text-red-400"
                : isUrgent
                ? "text-amber-500"
                : "text-blue-400"
            }`}
          >
            Selesaikan pembayaran sebelum waktu habis
          </p>
        </div>
      )}

      {/* ── Expired Banner ── */}
      {isExpired && !uploadSuccess && !isPaid && !isWaitingConfirmation && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-2xl p-6 flex flex-col items-center gap-3 text-center">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
            <FiAlertCircle size={32} className="text-red-500" />
          </div>
          <div>
            <p className="font-bold text-red-800 text-lg">Waktu Pembayaran Habis</p>
            <p className="text-sm text-red-600 mt-1 max-w-xs">
              Batas waktu pembayaran 1 jam telah habis. Pesanan ini telah dibatalkan secara otomatis.
            </p>
          </div>
          <Link
            href="/orders"
            className="mt-2 px-6 py-2.5 bg-[#00997a] text-white text-sm font-bold rounded-xl hover:bg-[#007a61] transition-colors"
          >
            Lihat Pesanan Lain
          </Link>
        </div>
      )}

      {/* ── Success Banner ── */}
      {(uploadSuccess || isPaid || isWaitingConfirmation) && (
        <div className="mb-6 bg-emerald-50 border border-emerald-200 rounded-2xl p-6 flex flex-col items-center gap-3 text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
            <FiCheckCircle size={32} className="text-emerald-500" />
          </div>
          <div>
            <p className="font-bold text-emerald-800 text-lg">
              {isPaid ? "Pembayaran Dikonfirmasi!" : "Bukti Pembayaran Terkirim!"}
            </p>
            <p className="text-sm text-emerald-600 mt-1 max-w-xs">
              {isPaid
                ? "Pesananmu sedang diproses oleh tim kami."
                : "Tim kami akan segera memverifikasi pembayaranmu. Pesanan akan diproses setelah verifikasi."}
            </p>
          </div>
          <Link
            href="/orders"
            className="mt-2 px-6 py-2.5 bg-[#00997a] text-white text-sm font-bold rounded-xl hover:bg-[#007a61] transition-colors"
          >
            Lihat Pesanan Saya
          </Link>
        </div>
      )}

      {/* ── Order Summary Card ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-5">
        <div className="flex items-center gap-2 mb-4">
          <FiPackage size={16} className="text-[#00997a]" />
          <h2 className="font-bold text-[#1a1a1a]">Detail Pesanan</h2>
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-gray-600">
            <span>Status Pesanan</span>
            <span className="font-semibold capitalize">{order.status?.replace(/_/g, " ")}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Total Produk</span>
            <span className="font-semibold text-[#00997a]">
              Rp {Number(order.totalAmount).toLocaleString("id-ID")}
            </span>
          </div>
          {order.shippingCost > 0 && (
            <div className="flex justify-between text-gray-600">
              <span>Ongkos Kirim</span>
              <span className="font-medium">
                Rp {Number(order.shippingCost).toLocaleString("id-ID")}
              </span>
            </div>
          )}
          <div className="flex justify-between text-gray-600">
            <span>Alamat Pengiriman</span>
            <span className="font-medium text-right max-w-[220px]">
              {order.address?.detail}, {order.address?.city}
            </span>
          </div>
        </div>
      </div>

      {/* ═══════ MANUAL TRANSFER SECTION ═══════ */}
      {isManual && !uploadSuccess && !isPaid && !isWaitingConfirmation && !isExpired && (
        <div className="space-y-5">
          {/* Bank Accounts */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-bold text-[#1a1a1a] mb-4">Rekening Tujuan Transfer</h2>
            <div className="space-y-3">
              {BANK_ACCOUNTS.map((acc) => (
                <div
                  key={acc.bank}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100"
                >
                  <div>
                    <p className="text-xs text-gray-400 font-medium">{acc.bank}</p>
                    <p className="text-lg font-bold tracking-wider text-[#1a1a1a]">
                      {acc.account}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">{acc.name}</p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(acc.account)}
                    className="flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 hover:border-[#00997a] hover:text-[#00997a] transition-all"
                  >
                    {copiedAcc === acc.account ? (
                      <FiCheckCircle size={13} className="text-[#00997a]" />
                    ) : (
                      <FiCopy size={13} />
                    )}
                    {copiedAcc === acc.account ? "Tersalin" : "Salin"}
                  </button>
                </div>
              ))}
            </div>
            <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-3 flex gap-2">
              <FiAlertCircle size={14} className="text-amber-500 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700 leading-relaxed">
                Transfer tepat sesuai jumlah tagihan. Sertakan 3 digit terakhir nomor pesanan sebagai berita acara.
              </p>
            </div>
          </div>

          {/* Upload Proof */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-bold text-[#1a1a1a] mb-1">Upload Bukti Pembayaran</h2>
            <p className="text-xs text-gray-400 mb-4">
              Format: <span className="font-semibold text-gray-500">.jpg, .jpeg, .png</span> — Maksimal{" "}
              <span className="font-semibold text-gray-500">1 MB</span>
            </p>

            {!selectedFile ? (
              <button
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`w-full border-2 border-dashed rounded-xl py-10 flex flex-col items-center gap-3 transition-all group ${
                  isDragging
                    ? "border-[#00997a] bg-[#00997a]/10 scale-[1.02]"
                    : "border-gray-200 hover:border-[#00997a] hover:bg-[#00997a]/5"
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                    isDragging
                      ? "bg-[#00997a]/20"
                      : "bg-gray-100 group-hover:bg-[#00997a]/10"
                  }`}
                >
                  <FiImage
                    size={22}
                    className={
                      isDragging
                        ? "text-[#00997a]"
                        : "text-gray-400 group-hover:text-[#00997a]"
                    }
                  />
                </div>
                <div className="text-center">
                  <p
                    className={`text-sm font-semibold ${
                      isDragging
                        ? "text-[#00997a]"
                        : "text-gray-600 group-hover:text-[#00997a]"
                    }`}
                  >
                    {isDragging ? "Lepaskan file di sini" : "Klik untuk memilih file"}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">atau seret & lepas file di sini</p>
                </div>
              </button>
            ) : (
              <div className="space-y-3">
                {/* Preview */}
                <div className="relative">
                  {previewUrl && (
                    <div className="relative rounded-xl overflow-hidden border border-gray-200 max-h-64">
                      <img
                        src={previewUrl}
                        alt="Preview bukti bayar"
                        className="w-full h-full object-contain bg-gray-50"
                      />
                    </div>
                  )}
                  <button
                    onClick={handleRemoveFile}
                    className="absolute top-2 right-2 w-7 h-7 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-500 hover:text-red-500 hover:border-red-300 transition-colors shadow-sm"
                  >
                    <FiX size={13} />
                  </button>
                </div>

                {/* File info */}
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <FiImage size={12} />
                    <span className="truncate max-w-[200px]">{selectedFile.name}</span>
                    <span className="text-gray-300">|</span>
                    <span>{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</span>
                  </div>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs text-[#00997a] hover:underline font-medium"
                  >
                    Ganti file
                  </button>
                </div>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept=".jpg,.jpeg,.png"
              onChange={handleFileChange}
              className="hidden"
            />

            <button
              onClick={handleUpload}
              disabled={!selectedFile || isUploading || isExpired}
              className="mt-4 w-full py-3.5 bg-[#00997a] hover:bg-[#007a61] text-white font-bold rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm shadow-[#00997a]/20"
            >
              {isUploading ? (
                <>
                  <FiLoader size={16} className="animate-spin" />
                  Mengirim bukti...
                </>
              ) : (
                <>
                  <FiUpload size={16} />
                  Kirim Bukti Pembayaran
                </>
              )}
            </button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button
                  disabled={isUploading || isExpired}
                  className="mt-3 w-full py-3.5 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-xl transition-colors text-center border border-red-100 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Batalkan Pesanan
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent className="rounded-2xl max-w-md">
                <AlertDialogHeader className="sm:text-center flex flex-col items-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50 mb-3">
                    <FiAlertTriangle className="h-8 w-8 text-red-500" aria-hidden="true" />
                  </div>
                  <AlertDialogTitle className="text-xl font-bold text-[#1a1a1a]">Batalkan Pesanan</AlertDialogTitle>
                  <AlertDialogDescription className="text-center text-sm text-gray-500 mt-2">
                    Apakah Anda yakin ingin membatalkan pesanan ini? Tindakan ini tidak dapat diurungkan dan pesanan akan hangus.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="w-full mt-6 grid grid-cols-2 gap-3 sm:flex-none">
                  <AlertDialogCancel className="w-full h-12 rounded-xl border-gray-200 text-gray-600 font-bold m-0 sm:m-0">Batal</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleCancelOrder}
                    className="w-full h-12 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold m-0 sm:m-0"
                  >
                    Ya, Batalkan
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      )}
    </div>
  );
}
