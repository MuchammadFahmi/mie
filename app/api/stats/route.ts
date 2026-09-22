import { NextResponse } from "next/server";
import supabase from "@/lib/db";
import { auth } from "@/lib/auth";

// GET /api/stats — Statistik ringkas untuk admin
export async function GET() {
  const session = await auth();
  if (!session || session.user?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

    // Today's stats
    const { data: todayOrders } = await supabase
      .from("orders")
      .select("status, total_price")
      .gte("created_at", `${today}T00:00:00`)
      .lte("created_at", `${today}T23:59:59`);

    const todayStats = {
      total_pesanan_hari_ini: todayOrders?.length ?? 0,
      pendapatan_hari_ini: todayOrders?.filter(o => o.status === "selesai").reduce((s, o) => s + o.total_price, 0) ?? 0,
      pesanan_pending: todayOrders?.filter(o => o.status === "pending").length ?? 0,
      pesanan_diproses: todayOrders?.filter(o => o.status === "diproses").length ?? 0,
      pesanan_selesai: todayOrders?.filter(o => o.status === "selesai").length ?? 0,
    };

    // Overall stats
    const { data: allOrders } = await supabase
      .from("orders")
      .select("status, total_price");

    const overallStats = {
      total_semua_pesanan: allOrders?.length ?? 0,
      total_pendapatan: allOrders?.filter(o => o.status === "selesai").reduce((s, o) => s + o.total_price, 0) ?? 0,
    };

    // Staff count
    const { count: staffCount } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true })
      .eq("is_active", 1);

    // Menu count
    const { count: menuCount } = await supabase
      .from("menu_items")
      .select("*", { count: "exact", head: true })
      .eq("is_active", 1);

    // Recent orders
    const { data: recentOrders } = await supabase
      .from("orders")
      .select("id, order_code, customer_name, order_type, total_price, status, created_at")
      .order("created_at", { ascending: false })
      .limit(5);

    return NextResponse.json({
      today: todayStats,
      overall: overallStats,
      staff: staffCount ?? 0,
      menu: menuCount ?? 0,
      recent_orders: recentOrders ?? [],
    });
  } catch {
    return NextResponse.json({ error: "Gagal memuat statistik" }, { status: 500 });
  }
}
