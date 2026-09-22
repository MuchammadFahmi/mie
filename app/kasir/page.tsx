"use client";

import { useState, useEffect, useCallback } from "react";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import {
  ClipboardList,
  Clock,
  CheckCircle2,
  XCircle,
  ChefHat,
  LogOut,
  RefreshCw,
  Utensils,
  ShoppingBag,
  Search,
  Check,
  X,
  Printer,
  CreditCard,
  Eye,
  FileCheck,
  AlertCircle,
} from "lucide-react";

interface Order {
  id: number;
  order_code: string;
  customer_name: string;
  order_type: "dine_in" | "takeaway";
  table_number: string | null;
  total_price: number;
  status: "pending" | "diproses" | "selesai" | "dibatalkan";
  payment_method?: string;
  payment_proof?: string | null;
  payment_status?: "pending" | "verified" | "rejected";
  notes: string | null;
  items_summary: string;
  created_at: string;
}

const STATUS_CONFIG = {
  pending: {
    label: "Menunggu",
    color: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    dot: "bg-amber-400",
    icon: Clock,
  },
  diproses: {
    label: "Diproses / Dapur",
    color: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    dot: "bg-blue-400",
    icon: ChefHat,
  },
  selesai: {
    label: "Selesai",
    color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    dot: "bg-emerald-400",
    icon: CheckCircle2,
  },
  dibatalkan: {
    label: "Dibatalkan",
    color: "bg-rose-500/20 text-rose-300 border-rose-500/30",
    dot: "bg-rose-400",
    icon: XCircle,
  },
};

const NEXT_STATUS: Record<string, string> = {
  pending: "diproses",
  diproses: "selesai",
};

export default function KasirPage() {
  const { data: session } = useSession();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  // Modal States
  const [selectedProofUrl, setSelectedProofUrl] = useState<string | null>(null);
  const [selectedPrintOrder, setSelectedPrintOrder] = useState<Order | null>(null);

  const fetchOrders = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const res = await fetch("/api/orders?limit=100");
      const data = await res.json();
      setOrders(data.orders || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
    // Auto-refresh setiap 15 detik
    const interval = setInterval(() => fetchOrders(true), 15000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  // Handler Konfirmasi Pembayaran Kasir
  const handleVerifyPayment = async (orderId: number) => {
    setUpdatingId(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          payment_status: "verified",
          status: "diproses",
        }),
      });
      if (!res.ok) throw new Error(`Gagal konfirmasi pembayaran (${res.status})`);
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId
            ? { ...o, payment_status: "verified", status: "diproses" }
            : o
        )
      );
    } catch (error) {
      alert(error instanceof Error ? error.message : "Terjadi kesalahan saat konfirmasi pembayaran");
    } finally {
      setUpdatingId(null);
    }
  };

  // Handler Update Status Order
  const handleUpdateStatus = async (orderId: number, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error(`Gagal memperbarui status pesanan (${res.status})`);
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId ? { ...o, status: newStatus as Order["status"] } : o
        )
      );
    } catch (error) {
      alert(error instanceof Error ? error.message : "Terjadi kesalahan saat memperbarui status");
    } finally {
      setUpdatingId(null);
    }
  };

  // Handler Batalkan Order
  const handleCancel = async (orderId: number) => {
    if (!confirm("Batalkan pesanan ini?")) return;
    setUpdatingId(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "dibatalkan", payment_status: "rejected" }),
      });
      if (!res.ok) throw new Error(`Gagal membatalkan pesanan (${res.status})`);
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId ? { ...o, status: "dibatalkan", payment_status: "rejected" } : o
        )
      );
    } catch (error) {
      alert(error instanceof Error ? error.message : "Terjadi kesalahan saat membatalkan pesanan");
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = orders.filter((o) => {
    let matchStatus = true;
    if (filterStatus === "unverified") {
      matchStatus = o.payment_status === "pending" || !o.payment_status;
    } else if (filterStatus !== "all") {
      matchStatus = o.status === filterStatus;
    }

    const matchSearch =
      search === "" ||
      o.order_code.toLowerCase().includes(search.toLowerCase()) ||
      o.customer_name.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const counts = {
    unverified: orders.filter((o) => o.payment_status === "pending" || !o.payment_status).length,
    pending: orders.filter((o) => o.status === "pending").length,
    diproses: orders.filter((o) => o.status === "diproses").length,
    selesai: orders.filter((o) => o.status === "selesai").length,
  };

  return (
    <div className="min-h-screen bg-[#0F2A33]">
      {/* Header POS Kasir */}
      <header className="bg-[#0a1f28] border-b border-white/10 sticky top-0 z-40 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#E6007E] text-white flex items-center justify-center font-bold shadow-md">
              <ChefHat size={22} />
            </div>
            <div>
              <h1 className="text-white font-bold text-lg leading-tight">POS & Antrean Kasir</h1>
              <p className="text-white/40 text-xs">Petugas Kasir: {session?.user?.name || "Kasir Utama"}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchOrders(true)}
              disabled={refreshing}
              className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 text-xs font-semibold flex items-center gap-2 border border-white/10 transition-colors"
            >
              <RefreshCw size={15} className={refreshing ? "animate-spin text-[#17B8CF]" : ""} />
              <span>Refresh</span>
            </button>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-semibold border border-rose-500/20 transition-colors"
            >
              <LogOut size={15} />
              <span>Keluar</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Stat Counter Tabs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div
            onClick={() => setFilterStatus(filterStatus === "unverified" ? "all" : "unverified")}
            className={`bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 cursor-pointer hover:bg-amber-500/20 transition-all ${
              filterStatus === "unverified" ? "ring-2 ring-amber-400" : ""
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-amber-300 text-xs font-bold uppercase tracking-wider">Perlu Konfirmasi</span>
              <AlertCircle size={16} className="text-amber-400" />
            </div>
            <p className="text-3xl font-bold text-white">{counts.unverified}</p>
            <p className="text-[11px] text-amber-200/60 mt-1">Cek transfer / QRIS</p>
          </div>

          <div
            onClick={() => setFilterStatus(filterStatus === "diproses" ? "all" : "diproses")}
            className={`bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4 cursor-pointer hover:bg-blue-500/20 transition-all ${
              filterStatus === "diproses" ? "ring-2 ring-blue-400" : ""
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-blue-300 text-xs font-bold uppercase tracking-wider">Diproses Dapur</span>
              <ChefHat size={16} className="text-blue-400" />
            </div>
            <p className="text-3xl font-bold text-white">{counts.diproses}</p>
            <p className="text-[11px] text-blue-200/60 mt-1">Sedang dimasak</p>
          </div>

          <div
            onClick={() => setFilterStatus(filterStatus === "selesai" ? "all" : "selesai")}
            className={`bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 cursor-pointer hover:bg-emerald-500/20 transition-all ${
              filterStatus === "selesai" ? "ring-2 ring-emerald-400" : ""
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-emerald-300 text-xs font-bold uppercase tracking-wider">Pesanan Selesai</span>
              <CheckCircle2 size={16} className="text-emerald-400" />
            </div>
            <p className="text-3xl font-bold text-white">{counts.selesai}</p>
            <p className="text-[11px] text-emerald-200/60 mt-1">Sudah disajikan</p>
          </div>

          <div
            onClick={() => setFilterStatus("all")}
            className={`bg-white/5 border border-white/10 rounded-2xl p-4 cursor-pointer hover:bg-white/10 transition-all ${
              filterStatus === "all" ? "ring-2 ring-white/30" : ""
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-white/60 text-xs font-bold uppercase tracking-wider">Total Antrean</span>
              <ClipboardList size={16} className="text-[#17B8CF]" />
            </div>
            <p className="text-3xl font-bold text-white">{orders.length}</p>
            <p className="text-[11px] text-white/40 mt-1">Semua status hari ini</p>
          </div>
        </div>

        {/* Search & Filter Controls */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              type="text"
              placeholder="Cari kode pesanan (GCN-...) atau nama pelanggan..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#17B8CF] text-xs"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {[
              { id: "all", label: "Semua" },
              { id: "unverified", label: "Perlu Konfirmasi Bayar" },
              { id: "diproses", label: "Diproses Dapur" },
              { id: "selesai", label: "Selesai" },
            ].map((st) => (
              <button
                key={st.id}
                onClick={() => setFilterStatus(st.id)}
                className={`px-3.5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
                  filterStatus === st.id
                    ? "bg-[#17B8CF] text-white shadow-md"
                    : "bg-white/5 text-white/50 hover:bg-white/10 border border-white/10"
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>

        {/* Orders Card Grid List */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-2 border-[#17B8CF] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/10 p-8">
            <ClipboardList size={48} className="text-white/20 mx-auto mb-3" />
            <p className="text-white/60 font-bold text-base">Tidak ada pesanan ditemukan</p>
            <p className="text-white/30 text-xs mt-1">Coba sesuaikan filter atau pencarian Anda.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((order) => {
              const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
              const StatusIcon = cfg.icon;
              const nextStatus = NEXT_STATUS[order.status];
              const isUpdating = updatingId === order.id;
              const isPaymentVerified = order.payment_status === "verified";

              return (
                <div
                  key={order.id}
                  className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:border-white/20 transition-all flex flex-col md:flex-row md:items-center justify-between gap-5"
                >
                  {/* Left Column: Info & Items Summary */}
                  <div className="flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[#17B8CF] font-bold text-sm font-mono tracking-wider bg-white/5 px-3 py-1 rounded-lg border border-white/10">
                        {order.order_code}
                      </span>

                      {/* Status Badges */}
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border uppercase ${cfg.color}`}>
                        <span className={`w-2 h-2 rounded-full ${cfg.dot} animate-pulse`} />
                        {cfg.label}
                      </span>

                      {/* Order Type Tag */}
                      <span className="inline-flex items-center gap-1 bg-white/10 text-white/80 text-xs px-2.5 py-1 rounded-lg">
                        {order.order_type === "dine_in" ? (
                          <><Utensils size={12} className="text-[#E6007E]" /> Dine In {order.table_number ? `(${order.table_number})` : ""}</>
                        ) : (
                          <><ShoppingBag size={12} className="text-[#17B8CF]" /> Takeaway</>
                        )}
                      </span>

                      {/* Payment Status Badge */}
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold border ${
                          isPaymentVerified
                            ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                            : "bg-amber-500/20 text-amber-300 border-amber-500/30"
                        }`}
                      >
                        <CreditCard size={12} />
                        {isPaymentVerified
                          ? `LUNAS (${order.payment_method || "QRIS"})`
                          : `BELUM VERIFIKASI (${order.payment_method || "QRIS"})`}
                      </span>
                    </div>

                    <div className="pt-1">
                      <p className="text-white font-bold text-base">{order.customer_name}</p>
                      <p className="text-white/70 text-xs sm:text-sm mt-0.5 leading-relaxed">{order.items_summary}</p>
                      {order.notes && (
                        <p className="text-amber-300 text-xs mt-1 bg-amber-500/10 px-3 py-1 rounded-lg inline-block border border-amber-500/20">
                          📝 Catatan: {order.notes}
                        </p>
                      )}
                    </div>

                    <p className="text-white/30 text-[11px]">
                      Dibuat pada: {new Date(order.created_at).toLocaleString("id-ID", {
                        day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit"
                      })}
                    </p>
                  </div>

                  {/* Right Column: Price, Proof & Actions */}
                  <div className="flex flex-col sm:flex-row md:flex-col items-start sm:items-center md:items-end justify-between gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-white/10">
                    <div className="text-left sm:text-right">
                      <span className="text-[10px] text-white/40 uppercase tracking-widest block">Total Bayar</span>
                      <span className="text-xl font-bold text-[#E6007E]">
                        Rp {order.total_price.toLocaleString("id-ID")}
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                      {/* Button View Payment Proof */}
                      {order.payment_proof && (
                        <button
                          onClick={() => setSelectedProofUrl(order.payment_proof || null)}
                          className="px-3 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/30 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                          title="Lihat Bukti Pembayaran"
                        >
                          <Eye size={14} />
                          <span>Resi Bayar</span>
                        </button>
                      )}

                      {/* Button Konfirmasi Pembayaran Kasir */}
                      {!isPaymentVerified && order.status !== "dibatalkan" && (
                        <button
                          disabled={isUpdating}
                          onClick={() => handleVerifyPayment(order.id)}
                          className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50 flex items-center gap-1.5 shadow-lg shadow-emerald-600/20"
                        >
                          <FileCheck size={14} />
                          <span>Konfirmasi Bayar</span>
                        </button>
                      )}

                      {/* Button Next Progress */}
                      {nextStatus && isPaymentVerified && (
                        <button
                          onClick={() => handleUpdateStatus(order.id, nextStatus)}
                          disabled={isUpdating}
                          className="px-3.5 py-2 bg-[#17B8CF] hover:bg-[#1AA7C4] text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50 shadow-md shadow-[#17B8CF]/20"
                        >
                          {isUpdating ? "..." : nextStatus === "diproses" ? "Masak di Dapur ▶" : "Sajikan / Selesai ✓"}
                        </button>
                      )}

                      {/* Button Print Receipt Struk */}
                      <button
                        onClick={() => setSelectedPrintOrder(order)}
                        className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs transition-colors border border-white/10"
                        title="Cetak Struk"
                      >
                        <Printer size={16} />
                      </button>

                      {/* Button Cancel */}
                      {order.status !== "selesai" && order.status !== "dibatalkan" && (
                        <button
                          onClick={() => handleCancel(order.id)}
                          disabled={isUpdating}
                          className="p-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 rounded-xl text-xs border border-rose-500/20 transition-colors"
                          title="Batalkan Pesanan"
                        >
                          <X size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* MODAL 1: View Payment Proof Image Modal */}
      {selectedProofUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="bg-[#0a1f28] border border-white/20 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative text-center">
            <button
              onClick={() => setSelectedProofUrl(null)}
              className="absolute top-4 right-4 text-white/50 hover:text-white p-2 rounded-full bg-white/10"
            >
              <X size={20} />
            </button>
            <h3 className="text-white font-bold text-lg mb-4 flex items-center justify-center gap-2">
              <CreditCard size={18} className="text-[#17B8CF]" /> Bukti Transfer / Resi Pelanggan
            </h3>
            <div className="relative w-full h-80 rounded-2xl overflow-hidden bg-black/40 border border-white/10 mb-4">
              <Image src={selectedProofUrl} alt="Bukti Transfer" fill className="object-contain" />
            </div>
            <button
              onClick={() => setSelectedProofUrl(null)}
              className="w-full py-3 bg-[#17B8CF] text-white font-bold rounded-xl text-xs uppercase tracking-wider"
            >
              Tutup Pratinjau
            </button>
          </div>
        </div>
      )}

      {/* MODAL 2: Struk / Receipt Thermal Print Modal */}
      {selectedPrintOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="bg-white text-slate-900 rounded-3xl max-w-sm w-full p-6 shadow-2xl relative font-mono text-xs">
            <button
              onClick={() => setSelectedPrintOrder(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5"
            >
              <X size={18} />
            </button>

            <div className="text-center pb-3 border-b border-dashed border-slate-300">
              <h2 className="font-bold text-base text-slate-900">MIE GACOAN RESTO</h2>
              <p className="text-[10px] text-slate-500">Struk Resi Pembayaran Resmi</p>
              <p className="text-[10px] text-slate-400 mt-1">{selectedPrintOrder.order_code}</p>
            </div>

            <div className="py-3 space-y-1.5 border-b border-dashed border-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-500">Pelanggan:</span>
                <span className="font-bold">{selectedPrintOrder.customer_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Tipe / Meja:</span>
                <span className="font-bold">{selectedPrintOrder.order_type.toUpperCase()} {selectedPrintOrder.table_number ? `(${selectedPrintOrder.table_number})` : ""}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Metode Bayar:</span>
                <span className="font-bold">{selectedPrintOrder.payment_method || "QRIS"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Status Bayar:</span>
                <span className="font-bold text-emerald-600">{selectedPrintOrder.payment_status === "verified" ? "LUNAS" : "BELUM LUNAS"}</span>
              </div>
            </div>

            <div className="py-3 space-y-2 border-b border-dashed border-slate-300">
              <p className="font-bold text-slate-700 uppercase">Item Pesanan:</p>
              <p className="text-slate-800 leading-relaxed whitespace-pre-wrap">{selectedPrintOrder.items_summary}</p>
            </div>

            <div className="pt-3 pb-2 flex justify-between font-bold text-sm text-slate-900">
              <span>TOTAL BIAYA:</span>
              <span className="text-[#E6007E]">Rp {selectedPrintOrder.total_price.toLocaleString("id-ID")}</span>
            </div>

            <div className="pt-3 flex gap-2">
              <button
                onClick={() => window.print()}
                className="flex-1 py-3 bg-[#0F2A33] text-white font-bold rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-1.5"
              >
                <Printer size={14} /> Cetak Struk
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
