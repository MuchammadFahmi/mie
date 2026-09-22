import { NextRequest, NextResponse } from "next/server";
import supabase from "@/lib/db";
import { auth } from "@/lib/auth";

function generateOrderCode(): string {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, "");
  const rand = Math.floor(Math.random() * 9000) + 1000;
  return `GCN-${date}-${rand}`;
}

const ORDER_TYPE_MAP: Record<string, "takeaway" | "dine_in"> = {
  "take away": "takeaway",
  "takeaway": "takeaway",
  "take_away": "takeaway",
  "online": "takeaway",
  "dine in": "dine_in",
  "dine_in": "dine_in",
  "dinein": "dine_in",
  "dine-in": "dine_in",
};

// GET /api/orders — Untuk kasir & admin
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session || !["kasir", "admin"].includes(session.user?.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const limit = parseInt(searchParams.get("limit") || "50");

    // Fetch orders
    let query = supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (status) {
      query = query.eq("status", status);
    }

    const { data: orders, error } = await query;
    if (error) throw error;

    // Fetch order_items untuk semua order sekaligus, lalu build items_summary
    const orderIds = orders.map((o) => o.id);
    const { data: allItems } = await supabase
      .from("order_items")
      .select("order_id, quantity, menu_item_name")
      .in("order_id", orderIds.length > 0 ? orderIds : [0]);

    const itemsByOrder: Record<number, string[]> = {};
    for (const item of allItems || []) {
      if (!itemsByOrder[item.order_id]) itemsByOrder[item.order_id] = [];
      itemsByOrder[item.order_id].push(`${item.quantity}x ${item.menu_item_name}`);
    }

    const ordersWithSummary = orders.map((o) => ({
      ...o,
      items_summary: (itemsByOrder[o.id] || []).join(", "),
    }));

    return NextResponse.json({ orders: ordersWithSummary });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: "Gagal memuat data pesanan", orders: [] },
      { status: 500 }
    );
  }
}

// POST /api/orders — Buat pesanan baru (publik)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      customer_name,
      customerName,
      order_type,
      orderType,
      table_number,
      tableNo,
      items,
      notes,
      paymentMethod,
      payment_method,
      paymentProof,
      payment_proof,
    } = body;

    const finalCustomerName = customer_name || customerName || "Pelanggan";
    const rawOrderType = (order_type || orderType || "dine_in").toLowerCase().trim();
    const finalOrderType = ORDER_TYPE_MAP[rawOrderType] ?? "dine_in";
    const finalTableNo = table_number || tableNo || null;
    const finalPaymentMethod = payment_method || paymentMethod || "QRIS";
    const finalPaymentProof = payment_proof || paymentProof || null;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "Keranjang kosong" }, { status: 400 });
    }

    const total_price = items.reduce(
      (sum: number, item: { price: number; quantity: number }) =>
        sum + item.price * item.quantity,
      0
    );

    const order_code = generateOrderCode();

    // Insert order
    const { data: newOrder, error: orderError } = await supabase
      .from("orders")
      .insert({
        order_code,
        customer_name: finalCustomerName,
        order_type: finalOrderType,
        table_number: finalTableNo,
        total_price,
        notes: notes || null,
        status: "pending",
        payment_method: finalPaymentMethod,
        payment_proof: finalPaymentProof,
        payment_status: "pending",
      })
      .select("id")
      .single();

    if (orderError || !newOrder) {
      throw orderError;
    }

    const orderId = newOrder.id;

    // Insert order items
    const orderItemsPayload = items.map((item: {
      name: string;
      id?: string;
      price: number;
      quantity: number;
      notes?: string;
    }) => ({
      order_id: orderId,
      menu_item_name: item.name,
      menu_item_id: item.id || null,
      quantity: item.quantity,
      unit_price: item.price,
      subtotal: item.price * item.quantity,
      notes: item.notes || null,
    }));

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItemsPayload);

    if (itemsError) throw itemsError;

    return NextResponse.json(
      { success: true, order_code, order_id: orderId, total_price },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating order:", error);
    const errorMessage = error?.message || error?.details || (typeof error === "object" ? JSON.stringify(error) : String(error));
    return NextResponse.json(
      { error: `Gagal membuat pesanan (${errorMessage})` },
      { status: 500 }
    );
  }
}
