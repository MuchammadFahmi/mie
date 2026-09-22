import { NextRequest, NextResponse } from "next/server";
import supabase from "@/lib/db";
import { auth } from "@/lib/auth";

// GET /api/orders/[id] — Detail pesanan
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session || !["kasir", "admin"].includes(session.user?.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("*")
    .eq("id", id)
    .single();

  if (orderError || !order) {
    return NextResponse.json({ error: "Pesanan tidak ditemukan" }, { status: 404 });
  }

  const { data: items } = await supabase
    .from("order_items")
    .select("*")
    .eq("order_id", id);

  return NextResponse.json({ order, items: items || [] });
}

// PATCH /api/orders/[id] — Update status / konfirmasi pembayaran
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session || !["kasir", "admin"].includes(session.user?.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const { status, payment_status, paymentStatus } = body;

  const finalPaymentStatus = payment_status || paymentStatus;
  const updates: Record<string, unknown> = { processed_by: session.user.id };

  if (status) {
    const validStatuses = ["pending", "diproses", "selesai", "dibatalkan"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Status pesanan tidak valid" }, { status: 400 });
    }
    updates.status = status;
  }

  if (finalPaymentStatus) {
    const validPaymentStatuses = ["pending", "verified", "rejected"];
    if (!validPaymentStatuses.includes(finalPaymentStatus)) {
      return NextResponse.json({ error: "Status pembayaran tidak valid" }, { status: 400 });
    }
    updates.payment_status = finalPaymentStatus;
  }

  if (Object.keys(updates).length === 1) {
    // hanya processed_by, tidak ada yang diupdate
    return NextResponse.json({ error: "Tidak ada data yang diperbarui" }, { status: 400 });
  }

  const { error } = await supabase
    .from("orders")
    .update(updates)
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: "Gagal memperbarui pesanan" }, { status: 500 });
  }

  return NextResponse.json({ success: true, status, payment_status: finalPaymentStatus });
}

// DELETE /api/orders/[id] — Hapus pesanan (admin only)
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session || session.user?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { error } = await supabase.from("orders").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: "Gagal menghapus pesanan" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
