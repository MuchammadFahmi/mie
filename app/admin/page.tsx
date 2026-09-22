"use client";

import { useState, useEffect } from "react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import {
  LayoutDashboard,
  UtensilsCrossed,
  Users,
  LogOut,
  TrendingUp,
  ShoppingBag,
  Clock,
  CheckCircle2,
  ChefHat,
  ArrowRight,
  Monitor,
} from "lucide-react";

interface Stats {
  today: {
    total_pesanan_hari_ini: number;
    pendapatan_hari_ini: number;
    pesanan_pending: number;
    pesanan_diproses: number;
    pesanan_selesai: number;
  };
  overall: {
    total_semua_pesanan: number;
    total_pendapatan: number;
  };
  staff: number;
  menu: number;
  recent_orders: {
    id: number;
    order_code: string;
    customer_name: string;
    order_type: string;
    total_price: number;
    status: string;
    created_at: string;
  }[];
}

const STATUS_BADGES: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800 border-amber-200",
  diproses: "bg-blue-100 text-blue-800 border-blue-200",
  selesai: "bg-emerald-100 text-emerald-800 border-emerald-200",
  dibatalkan: "bg-rose-100 text-rose-800 border-rose-200",
};

export default function AdminPage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then((d) => {
        setStats(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* Sidebar */}
      <aside className="fixed top-0 left-0 h-screen w-64 bg-white border-r border-slate-200 flex flex-col z-40 hidden lg:flex">
        {/* Brand */}
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#E6007E] text-white flex items-center justify-center font-bold">
              <ChefHat size={22} />
            </div>
            <div>
              <h1 className="font-bold text-slate-900 text-base leading-tight">Admin Gacoan</h1>
              <p className="text-xs text-slate-500">Panel Kelola Resto</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          <Link
            href="/admin"
            className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-100 text-slate-900 font-semibold text-sm"
          >
            <LayoutDashboard size={18} className="text-[#E6007E]" /> Dashboard
          </Link>
          <Link
            href="/admin/menu"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-50 text-sm font-medium transition-colors"
          >
            <UtensilsCrossed size={18} /> Kelola Menu
          </Link>
          <Link
            href="/admin/users"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-50 text-sm font-medium transition-colors"
          >
            <Users size={18} /> Kelola Pengguna
          </Link>
          <Link
            href="/kasir"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-50 text-sm font-medium transition-colors"
          >
            <Monitor size={18} /> Kasir / POS
          </Link>
        </nav>

        {/* User Info & Logout */}
        <div className="p-4 border-t border-slate-100 bg-slate-50">
          <div className="mb-3 px-2">
            <p className="text-sm font-bold text-slate-800 truncate">{session?.user?.name || "Administrator"}</p>
            <p className="text-xs text-slate-500 truncate">{session?.user?.email || "admin@gacoan.com"}</p>
          </div>
          <button
            id="admin-logout"
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-rose-600 hover:bg-rose-50 font-medium text-xs transition-colors"
          >
            <LogOut size={16} /> Keluar dari Sistem
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="lg:ml-64 p-6 sm:p-8 max-w-7xl">
        {/* Mobile Header Navigation */}
        <div className="lg:hidden flex items-center justify-between pb-4 mb-6 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <ChefHat className="text-[#E6007E]" size={24} />
            <span className="font-bold text-slate-900 text-lg">Admin Panel</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/kasir" className="text-xs font-semibold text-[#17B8CF]">POS Kasir</Link>
            <button onClick={() => signOut({ callbackUrl: "/login" })} className="text-xs text-rose-600 font-semibold">
              Keluar
            </button>
          </div>
        </div>

        {/* Header Title */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Ringkasan Restoran</h2>
            <p className="text-sm text-slate-500 mt-1">
              {new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>

          <div className="flex gap-2">
            <Link
              href="/admin/menu"
              className="px-4 py-2.5 bg-[#0F2A33] text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition-colors inline-flex items-center gap-2"
            >
              <UtensilsCrossed size={14} /> Kelola Menu
            </Link>
            <Link
              href="/kasir"
              className="px-4 py-2.5 bg-[#E6007E] text-white rounded-xl text-xs font-semibold hover:bg-[#D00070] transition-colors inline-flex items-center gap-2"
            >
              <Monitor size={14} /> Buka POS Kasir
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : stats ? (
          <div className="space-y-8">
            {/* Stat Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between text-slate-500 mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider">Pesanan Hari Ini</span>
                  <ShoppingBag size={18} className="text-blue-600" />
                </div>
                <p className="text-3xl font-bold text-slate-900">{stats.today.total_pesanan_hari_ini}</p>
                <p className="text-xs text-slate-500 mt-1">Total masuk hari ini</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between text-slate-500 mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider">Omzet Hari Ini</span>
                  <TrendingUp size={18} className="text-emerald-600" />
                </div>
                <p className="text-2xl sm:text-3xl font-bold text-emerald-600">
                  Rp {(stats.today.pendapatan_hari_ini || 0).toLocaleString("id-ID")}
                </p>
                <p className="text-xs text-slate-500 mt-1">Total pendapatan hari ini</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between text-slate-500 mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider">Pesanan Pending</span>
                  <Clock size={18} className="text-amber-500" />
                </div>
                <p className="text-3xl font-bold text-amber-600">{stats.today.pesanan_pending}</p>
                <p className="text-xs text-slate-500 mt-1">Belum diproses kasir/dapur</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between text-slate-500 mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider">Total Menu & Staf</span>
                  <UtensilsCrossed size={18} className="text-purple-600" />
                </div>
                <p className="text-3xl font-bold text-slate-900">{stats.menu} <span className="text-sm font-normal text-slate-500">Menu</span></p>
                <p className="text-xs text-slate-500 mt-1">{stats.staff} Pengguna terdaftar</p>
              </div>
            </div>

            {/* Recent Orders Section */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">Pesanan Terbaru</h3>
                  <p className="text-xs text-slate-500">Daftar transaksi pesanan masuk terakhir</p>
                </div>
                <Link
                  href="/kasir"
                  className="text-xs font-bold text-[#E6007E] hover:underline flex items-center gap-1"
                >
                  Lihat Semua di POS <ArrowRight size={14} />
                </Link>
              </div>

              {stats.recent_orders.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-sm">
                  Belum ada transaksi pesanan tercatat.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-700">
                    <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-100">
                      <tr>
                        <th className="py-3 px-5">Kode / ID</th>
                        <th className="py-3 px-5">Nama Pelanggan</th>
                        <th className="py-3 px-5">Tipe</th>
                        <th className="py-3 px-5">Total</th>
                        <th className="py-3 px-5">Status</th>
                        <th className="py-3 px-5">Waktu</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {stats.recent_orders.map((o) => (
                        <tr key={o.id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-3.5 px-5 font-bold text-slate-900">{o.order_code}</td>
                          <td className="py-3.5 px-5 font-medium">{o.customer_name}</td>
                          <td className="py-3.5 px-5 capitalize">{o.order_type}</td>
                          <td className="py-3.5 px-5 font-bold text-slate-900">
                            Rp {o.total_price.toLocaleString("id-ID")}
                          </td>
                          <td className="py-3.5 px-5">
                            <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold border uppercase tracking-wider ${STATUS_BADGES[o.status] || "bg-slate-100 text-slate-700 border-slate-200"}`}>
                              {o.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-5 text-slate-500">
                            {new Date(o.created_at).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        ) : null}
      </main>
    </div>
  );
}
