"use client";

import * as React from "react";
import { 
  TrendingUp, 
  ShoppingCart, 
  DollarSign, 
  ArrowRight,
  Package,
  ArrowUpRight
} from "lucide-react";
import Link from "next/link";
import { salesService, SalesSummary, MonthlyTrend } from "@/services/salesService";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminDashboard() {
  const [summary, setSummary] = React.useState<SalesSummary | null>(null);
  const [trends, setTrends] = React.useState<MonthlyTrend[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await salesService.getSalesReport({
          year: new Date().getFullYear(),
          limit: 1,
        });

        if (response.success) {
          setSummary(response.data.summary);
          setTrends(response.data.trends);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground mt-1">
            Selamat datang kembali! Berikut ringkasan performa toko Anda hari ini.
          </p>
        </div>
        <Link href="/admin/sales">
          <Button className="bg-[#00997a] hover:bg-[#00856a] text-white shadow-lg shadow-[#00997a]/20 group">
            Lihat Laporan Lengkap
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard 
          title="Total Pendapatan" 
          value={formatCurrency(summary?.totalRevenue || 0)} 
          icon={<DollarSign className="h-5 w-5 text-[#00997a]" />}
          description="+12% dari bulan lalu"
          trend="up"
        />
        <StatsCard 
          title="Total Pesanan" 
          value={summary?.totalOrders || 0} 
          icon={<ShoppingCart className="h-5 w-5 text-blue-500" />}
          description="Rata-rata order harian stabil"
        />
        <StatsCard 
          title="Rata-rata Nilai Order" 
          value={formatCurrency(summary?.averageOrderValue || 0)} 
          icon={<Package className="h-5 w-5 text-orange-500" />}
          description="Sesuai target penjualan"
        />
        <StatsCard 
          title="Diskon Diberikan" 
          value={formatCurrency(summary?.totalDiscount || 0)} 
          icon={<TrendingUp className="h-5 w-5 text-purple-500" />}
          description="Promosi aktif berjalan"
          trend="up"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-none shadow-xl bg-white/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Tren Pendapatan</CardTitle>
            <CardDescription>Grafik pendapatan bulanan sepanjang tahun ini</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[350px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trends}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00997a" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#00997a" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="month" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#94a3b8', fontSize: 12}}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#94a3b8', fontSize: 12}}
                    tickFormatter={(value) => `Rp ${value / 1000000}jt`}
                  />
                  <Tooltip 
                    cursor={{fill: '#f8fafc'}}
                    contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                    formatter={(value) => [formatCurrency(Number(value))]}
                  />
                  <Bar 
                    dataKey="revenue" 
                    fill="url(#colorRevenue)" 
                    radius={[6, 6, 0, 0]} 
                    barSize={40}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions / Info */}
        <Card className="border-none shadow-xl bg-[#1a1a1a] text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <TrendingUp className="h-32 w-32" />
          </div>
          <CardHeader>
            <CardTitle className="text-white">Tips Hari Ini</CardTitle>
            <CardDescription className="text-gray-400">Tingkatkan penjualan Anda</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 relative z-10">
            <div className="p-4 rounded-xl bg-white/10 border border-white/10">
              <h4 className="font-bold flex items-center gap-2">
                <ArrowUpRight className="h-4 w-4 text-[#00ffcc]" />
                Optimasi Stok
              </h4>
              <p className="text-sm text-gray-400 mt-1">
                3 produk terlaris Anda hampir habis. Lakukan restock segera.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-white/10 border border-white/10">
              <h4 className="font-bold flex items-center gap-2">
                <ArrowUpRight className="h-4 w-4 text-[#00ffcc]" />
                Promo Baru
              </h4>
              <p className="text-sm text-gray-400 mt-1">
                Diskon persentase meningkatkan konversi di akhir pekan sebesar 20%.
              </p>
            </div>
            <Button variant="outline" className="w-full border-white/20 hover:bg-white/10 hover:text-white transition-colors">
              Lihat Detail Inventory
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatsCard({ title, value, icon, description, trend }: any) {
  return (
    <Card className="border-none shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden bg-white group">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="p-2.5 rounded-xl bg-slate-50 group-hover:bg-slate-100 transition-colors">
            {icon}
          </div>
          {trend && (
            <div className={`text-xs font-bold px-2 py-1 rounded-full ${trend === 'up' ? 'text-emerald-600 bg-emerald-50' : 'text-rose-600 bg-rose-50'}`}>
              {trend === 'up' ? '↑' : '↓'}
            </div>
          )}
        </div>
        <div className="mt-4">
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <h3 className="text-2xl font-bold tracking-tight text-slate-900 mt-1">{value}</h3>
          <p className="text-xs text-slate-400 mt-1.5 flex items-center gap-1">
            {description}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </div>
        <Skeleton className="h-12 w-40" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-32 w-full rounded-xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Skeleton className="lg:col-span-2 h-[450px] rounded-xl" />
        <Skeleton className="h-[450px] rounded-xl" />
      </div>
    </div>
  );
}
