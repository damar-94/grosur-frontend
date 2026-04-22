"use client";

import { useState, useEffect, useRef } from "react";
import { api } from "@/lib/axiosInstance";
import { FiPlus, FiTrash2, FiImage, FiType, FiCheck, FiX, FiLoader, FiLink, FiEdit2 } from "react-icons/fi";
import { toast } from "sonner";
import Image from "next/image";

interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl?: string;
  bgGradient?: string;
  contentColor: string;
  linkUrl?: string;
  isActive: boolean;
  showText: boolean;
}

const PRESET_GRADIENTS = [
  "bg-gradient-to-r from-primary to-accent",
  "bg-gradient-to-r from-orange-500 to-yellow-400",
  "bg-gradient-to-r from-blue-600 to-cyan-500",
  "bg-gradient-to-r from-purple-600 to-pink-500",
  "bg-gradient-to-r from-emerald-500 to-teal-400",
];

const CONTENT_COLORS = [
  { label: "Putih", value: "text-white" },
  { label: "Hitam", value: "text-black" },
  { label: "Gelap", value: "text-gray-800" },
];

export default function BannerManagement() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [bgGradient, setBgGradient] = useState(PRESET_GRADIENTS[0]);
  const [contentColor, setContentColor] = useState("text-white");
  const [isActive, setIsActive] = useState(true);
  const [showText, setShowText] = useState(true);
  const [bannerType, setBannerType] = useState<"image" | "gradient">("gradient");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const res = await api.get("/banners/admin");
      setBanners(res.data.data);
    } catch (err) {
      toast.error("Gagal memuat daftar banner");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 1024 * 1024) {
        toast.error("File terlalu besar (Maks 1MB)");
        return;
      }
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return toast.error("Judul wajib diisi");
    if (bannerType === "image" && !file && !editingId) return toast.error("Gambar wajib diunggah");

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append("title", title);
    formData.append("subtitle", subtitle);
    formData.append("linkUrl", linkUrl);
    formData.append("isActive", String(isActive));
    formData.append("showText", String(showText));
    
    if (bannerType === "gradient") {
      formData.append("bgGradient", bgGradient);
      formData.append("contentColor", contentColor);
    } else if (file) {
      formData.append("image", file);
    }

    try {
      if (editingId) {
        await api.patch(`/banners/${editingId}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Banner berhasil diperbarui!");
      } else {
        await api.post("/banners", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Banner berhasil dibuat!");
      }
      resetForm();
      fetchBanners();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Gagal menyimpan banner");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (banner: Banner) => {
    setEditingId(banner.id);
    setTitle(banner.title);
    setSubtitle(banner.subtitle || "");
    setLinkUrl(banner.linkUrl || "");
    setBgGradient(banner.bgGradient || PRESET_GRADIENTS[0]);
    setContentColor(banner.contentColor);
    setIsActive(banner.isActive);
    setShowText(banner.showText ?? true);
    setBannerType(banner.imageUrl ? "image" : "gradient");
    setPreview(banner.imageUrl || null);
    setShowAddForm(true);
  };
  const toggleActive = async (banner: Banner) => {
    try {
      await api.patch(`/banners/${banner.id}`, { isActive: !banner.isActive });
      toast.success(`Banner ${!banner.isActive ? "diaktifkan" : "dinonaktifkan"}`);
      fetchBanners();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Gagal memperbarui status");
    }
  };

  const toggleShowText = async (banner: Banner) => {
    try {
      await api.patch(`/banners/${banner.id}`, { showText: !banner.showText });
      toast.success(`Teks overlay ${!banner.showText ? "ditampilkan" : "disembunyikan"}`);
      fetchBanners();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Gagal memperbarui pengaturan teks");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus banner ini?")) return;
    try {
      await api.delete(`/banners/${id}`);
      toast.success("Banner dihapus");
      fetchBanners();
    } catch (err) {
      toast.error("Gagal menghapus banner");
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setTitle("");
    setSubtitle("");
    setLinkUrl("");
    setFile(null);
    setPreview(null);
    setShowText(true);
    setShowAddForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
        <div>
          <h1 className="text-xl font-medium text-gray-800">Manajemen Banner</h1>
          <p className="text-sm text-gray-500 mt-1">Kelola konten promosi di halaman utama (Maks 5 banner aktif)</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
            showAddForm ? "bg-gray-100 text-gray-600" : "bg-primary text-white hover:bg-primary-dark"
          }`}
        >
          {showAddForm ? <><FiX /> Batal</> : <><FiPlus /> Tambah Banner</>}
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1">Konten Utama</label>
                <div className="space-y-3">
                    <input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Judul Banner (Contoh: MEGA SALE!)"
                      className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/10 outline-none transition-all"
                    />
                    <textarea
                      value={subtitle}
                      onChange={(e) => setSubtitle(e.target.value)}
                      placeholder="Sub-judul / Deskripsi singkat promo..."
                      rows={2}
                      className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/10 outline-none resize-none transition-all"
                    />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1">Tautan URL</label>
                <div className="relative group">
                  <FiLink className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" />
                  <input
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    placeholder="/products?category=..."
                    className="w-full p-3 pl-10 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/10 outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1">Visual & Gaya</label>
                <div className="flex bg-gray-100 border border-gray-200 rounded-xl p-1 mb-4">
                  <button
                    type="button"
                    onClick={() => setBannerType("gradient")}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all ${
                      bannerType === "gradient" ? "bg-white text-primary shadow-sm" : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    <FiType size={14} /> Gradient
                  </button>
                  <button
                    type="button"
                    onClick={() => setBannerType("image")}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all ${
                      bannerType === "image" ? "bg-white text-primary shadow-sm" : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    <FiImage size={14} /> Gambar
                  </button>
                </div>
              </div>

              {bannerType === "image" ? (
                <div className="animate-in fade-in duration-300">
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="group relative h-40 w-full rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-all overflow-hidden"
                  >
                    {preview ? (
                      <Image src={preview} alt="Preview" fill className="object-cover" />
                    ) : (
                      <>
                        <FiImage size={32} className="text-gray-300 group-hover:text-primary mb-2 transition-all group-hover:scale-110" />
                        <span className="text-xs text-gray-400 font-bold group-hover:text-primary">Klik untuk unggah (Maks 1MB)</span>
                      </>
                    )}
                  </div>
                  <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-5 animate-in fade-in duration-300">
                   <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1">Pilihan Warna Gradient</label>
                    <div className="grid grid-cols-5 gap-3">
                       {PRESET_GRADIENTS.map((grad) => (
                         <div 
                           key={grad}
                           onClick={() => setBgGradient(grad)}
                           className={`h-10 rounded-xl cursor-pointer border-2 transition-all shadow-sm ${grad} ${bgGradient === grad ? "border-primary scale-110 shadow-md" : "border-transparent hover:scale-105"}`}
                         />
                       ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1">Warna Konten Teks</label>
                        <div className="flex gap-2">
                            {CONTENT_COLORS.map(c => (
                                <button
                                    key={c.value}
                                    type="button"
                                    onClick={() => setContentColor(c.value)}
                                    className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-all ${contentColor === c.value ? "bg-primary text-white border-primary" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"}`}
                                >
                                    {c.label}
                                </button>
                            ))}
                        </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-6 mt-8 pt-6 border-t border-gray-100">
             <label className="flex items-center gap-3 cursor-pointer group">
               <div 
                 onClick={() => setIsActive(!isActive)}
                 className={`w-12 h-6 rounded-full relative transition-colors ${isActive ? "bg-primary" : "bg-gray-200"}`}
               >
                 <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${isActive ? "translate-x-6" : ""}`} />
               </div>
               <span className="text-sm font-bold text-gray-700">Tampilkan Banner</span>
             </label>

             <label className="flex items-center gap-3 cursor-pointer group">
               <div 
                 onClick={() => setShowText(!showText)}
                 className={`w-12 h-6 rounded-full relative transition-colors ${showText ? "bg-primary" : "bg-gray-200"}`}
               >
                 <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${showText ? "translate-x-6" : ""}`} />
               </div>
               <span className="text-sm font-bold text-gray-700">Tampilkan Teks Overlay</span>
             </label>
             
             <button
               type="submit"
               disabled={isSubmitting}
               className="ml-auto bg-primary text-white px-10 py-3 rounded-xl font-bold hover:bg-primary-dark transition-all disabled:opacity-50 shadow-md flex items-center gap-2"
             >
               {isSubmitting ? <><FiLoader className="animate-spin" /> Menyimpan...</> : editingId ? "Update Banner" : "Simpan Banner"}
             </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-400 font-medium">
          <FiLoader size={32} className="animate-spin text-primary" />
          <p className="animate-pulse">Menghubungkan ke server...</p>
        </div>
      ) : banners.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-100 shadow-sm">
           <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
             <FiImage size={32} className="text-gray-200" />
           </div>
           <p className="text-gray-500 font-bold">Belum ada banner aktif</p>
           <p className="text-xs text-gray-400 mt-1 max-w-[200px] mx-auto">Mulai promosi pertamamu untuk menarik pelanggan!</p>
           <button onClick={() => setShowAddForm(true)} className="bg-primary/10 text-primary font-black text-xs px-6 py-2 rounded-full hover:bg-primary/20 transition-all mt-6 uppercase tracking-wider">
              Buat Banner Sekarang
           </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {banners.map((banner) => (
            <div key={banner.id} className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all group">
              <div className="flex flex-col sm:flex-row items-stretch">
                <div className={`relative h-32 sm:w-56 bg-gray-100 shrink-0 ${!banner.imageUrl ? banner.bgGradient : ""}`}>
                  {banner.imageUrl ? (
                    <Image src={banner.imageUrl} alt={banner.title} fill className="object-cover" />
                  ) : (
                    <div className={`flex items-center justify-center h-full w-full ${banner.contentColor} font-black text-3xl italic opacity-20`}>
                      GROSUR
                    </div>
                  )}
                  {!banner.isActive && (
                    <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center backdrop-blur-[2px]">
                       <span className="text-[10px] font-black text-white uppercase tracking-[0.2em] bg-black/30 px-3 py-1 rounded shadow-lg border border-white/20">Draf</span>
                    </div>
                  )}
                </div>
                
                <div className="flex-1 p-5 flex flex-col justify-center gap-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-black text-gray-900 text-lg leading-tight uppercase group-hover:text-primary transition-colors">{banner.title}</h3>
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-1 font-medium">{banner.subtitle || "Tampilkan promo eksklusif untuk pelanggan setia."}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                         onClick={() => handleEdit(banner)}
                         className="p-2.5 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-all"
                         title="Edit Banner"
                      >
                         <FiEdit2 size={18} />
                      </button>
                      <button 
                        onClick={() => toggleShowText(banner)}
                        className={`p-2.5 rounded-xl transition-all ${banner.showText ? "text-primary bg-primary/5" : "text-gray-400 hover:bg-gray-100"}`}
                        title={banner.showText ? "Sembunyikan Teks" : "Tampilkan Teks"}
                      >
                         <FiType size={18} />
                      </button>
                      <button 
                        onClick={() => toggleActive(banner)}
                        className={`p-2.5 rounded-xl transition-all ${banner.isActive ? "text-[#00997a] bg-[#00997a]/5" : "text-gray-400 hover:bg-gray-100"}`}
                        title={banner.isActive ? "Sembunyikan dari User" : "Tampilkan ke User"}
                      >
                        {banner.isActive ? <FiCheck size={20} /> : <FiX size={20} />}
                      </button>
                      <button 
                        onClick={() => handleDelete(banner.id)}
                        className="p-2.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                        title="Hapus Permanen"
                      >
                        <FiTrash2 size={18} />
                      </button>
                    </div>
                  </div>
                  {banner.linkUrl && (
                    <div className="mt-3 flex items-center gap-2 text-[10px] font-bold text-gray-400 tracking-wide border-t border-gray-50 pt-3">
                      <FiLink size={12} className="text-gray-300" />
                      <span className="truncate max-w-[200px]">{banner.linkUrl}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
