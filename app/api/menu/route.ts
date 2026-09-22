import { NextRequest, NextResponse } from "next/server";
import supabase from "@/lib/db";
import { auth } from "@/lib/auth";

// GET /api/menu — Semua menu aktif (publik)
export async function GET() {
  try {
    const { data, error } = await supabase
      .from("menu_items")
      .select("*")
      .eq("is_active", 1)
      .order("category")
      .order("id");

    if (error) throw error;
    return NextResponse.json({ menu: data });
  } catch {
    return NextResponse.json(
      { error: "Gagal memuat data menu", menu: [] },
      { status: 500 }
    );
  }
}

// POST /api/menu — Tambah menu baru (admin only)
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { name, category, subtitle, price, image, badge } = body;

  if (!name || !category || !price) {
    return NextResponse.json(
      { error: "Nama, kategori, dan harga wajib diisi" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("menu_items")
    .insert({
      name,
      category,
      subtitle: subtitle || null,
      price,
      image: image || null,
      badge: badge || null,
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: "Gagal menambah menu" }, { status: 500 });
  }

  return NextResponse.json({ success: true, id: data.id }, { status: 201 });
}
