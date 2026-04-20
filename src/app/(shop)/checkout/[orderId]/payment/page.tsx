"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import {
  FiUpload,
  FiCheckCircle,
  FiArrowLeft,
  FiLoader,
  FiCopy,
  FiExternalLink,
  FiAlertCircle,
  FiImage,
  FiX,
  FiPackage,
} from "react-icons/fi";
import { fetchOrder, uploadPaymentProof, type Order } from "@/services/checkoutService";
import { useAppStore } from "@/stores/useAppStore";

// ─── Bank Transfer Info ───────────────────────────────────────────────────────
const BANK_ACCOUNTS = [
  { bank: "BCA", account: "1234567890", name: "PT. Grosur Indonesia" },
  { bank: "Mandiri", account: "0987654321", name: "PT. Grosur Indonesia" },
];

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
      } catch {
        toast.error("Pesanan tidak ditemukan");
        router.push("/");
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [orderId, user, router]);

  // ─── File Handling ───────────────────────────────────────────────────────────
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isImage = file.type.startsWith("image/");
    const isPdf = file.type === "application/pdf";
    if (!isImage && !isPdf) {
      toast.error("Hanya file gambar (JPG, PNG) atau PDF yang diperbolehkan");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ukuran file maksimal 5 MB");
      return;
    }

    setSelectedFile(file);
    if (isImage) {
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setPreviewUrl(null); // PDF: no preview
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ─── Upload ──────────────────────────────────────────────────────────────────
  const handleUpload = async () => {
    if (!selectedFile || !order) return;
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
  const isGateway = order.paymentMethod === "PAYMENT_GATEWAY";
  const isPaid = order.paymentStatus === "PAID";

  return (
    <div className="max-w-[680px] mx-auto px-4 py-8">
      {/* ── Header ── */}
      <div className="flex items-center gap-3 mb-8">
        <Link href="/" className="text-gray-400 hover:text-[#00997a] transition-colors">
          <FiArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[#1a1a1a]">
            {uploadSuccess || isPaid ? "Pembayaran Berhasil" : "Selesaikan Pembayaran"}
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Pesanan #{order.orderNumber || order.id.slice(0, 8).toUpperCase()}
          </p>
        </div>
      </div>

      {/* ── Success Banner ── */}
      {(uploadSuccess || isPaid) && (
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
            href="/"
            className="mt-2 px-6 py-2.5 bg-[#00997a] text-white text-sm font-bold rounded-xl hover:bg-[#007a61] transition-colors"
          >
            Kembali ke Beranda
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
            <span className="font-semibold capitalize">{order.status}</span>
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
          {order.warehouse && (
            <div className="flex justify-between text-gray-600">
              <span>Dikirim dari Gudang</span>
              <span className="font-medium">{order.warehouse.name}</span>
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
      {isManual && !uploadSuccess && !isPaid && (
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
              Format: JPG, PNG, atau PDF. Maks 5 MB.
            </p>

            {!selectedFile ? (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full border-2 border-dashed border-gray-200 rounded-xl py-10 flex flex-col items-center gap-3 hover:border-[#00997a] hover:bg-[#00997a]/5 transition-all group"
              >
                <div className="w-12 h-12 rounded-full bg-gray-100 group-hover:bg-[#00997a]/10 flex items-center justify-center transition-colors">
                  <FiImage size={22} className="text-gray-400 group-hover:text-[#00997a]" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-gray-600 group-hover:text-[#00997a]">
                    Klik untuk memilih file
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">atau seret & lepas file di sini</p>
                </div>
              </button>
            ) : (
              <div className="space-y-3">
                {/* Preview */}
                <div className="relative">
                  {previewUrl ? (
                    <div className="relative rounded-xl overflow-hidden border border-gray-200 max-h-64">
                      <img src={previewUrl} alt="Preview" className="w-full h-full object-contain bg-gray-50" />
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
                      <FiUpload size={20} className="text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">{selectedFile.name}</p>
                        <p className="text-xs text-gray-400">
                          {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                  )}
                  <button
                    onClick={handleRemoveFile}
                    className="absolute top-2 right-2 w-7 h-7 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-500 hover:text-red-500 hover:border-red-300 transition-colors shadow-sm"
                  >
                    <FiX size={13} />
                  </button>
                </div>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs text-[#00997a] hover:underline"
                >
                  Ganti file
                </button>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,application/pdf"
              onChange={handleFileChange}
              className="hidden"
            />

            <button
              onClick={handleUpload}
              disabled={!selectedFile || isUploading}
              className="mt-4 w-full py-3.5 bg-[#00997a] hover:bg-[#007a61] text-white font-bold rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
          </div>
        </div>
      )}

      {/* ═══════ PAYMENT GATEWAY SECTION ═══════ */}
      {isGateway && !isPaid && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-blue-50 flex items-center justify-center">
            <FiCreditCard size={28} className="text-blue-500" />
          </div>
          <div>
            <h2 className="font-bold text-[#1a1a1a] text-lg">Selesaikan Pembayaran</h2>
            <p className="text-sm text-gray-500 mt-1 max-w-xs mx-auto leading-relaxed">
              Klik tombol di bawah untuk diarahkan ke halaman pembayaran Midtrans.
              Pesanan akan otomatis diproses setelah pembayaran berhasil.
            </p>
          </div>

          {order.paymentGatewayUrl ? (
            <a
              href={order.paymentGatewayUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#00997a] hover:bg-[#007a61] text-white font-bold rounded-xl transition-all shadow-sm"
            >
              <FiCreditCard size={16} />
              Bayar Sekarang
              <FiExternalLink size={14} />
            </a>
          ) : (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <p className="text-sm text-amber-700">
                Link pembayaran sedang disiapkan. Muat ulang halaman dalam beberapa saat.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="mt-2 text-xs text-[#00997a] font-semibold hover:underline"
              >
                Muat Ulang Halaman
              </button>
            </div>
          )}

          <p className="text-xs text-gray-400">
            Mengalami kendala?{" "}
            <Link href="/bantuan" className="text-[#00997a] hover:underline">
              Hubungi CS kami
            </Link>
          </p>
        </div>
      )}
    </div>
  );
}
