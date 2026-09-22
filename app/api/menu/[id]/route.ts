import { NextRequest, NextResponse } from "next/server";
import supabase from "@/lib/db";
import { auth } from "@/lib/auth";

// GET /api/menu/[id]
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { data, error } = await supabase
      .from("menu_items")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "Menu tidak ditemukan" }, { status: 404 });
    }
    return NextResponse.json({ item: data });
  } catch {
    return NextResponse.json({ error: "Gagal mengambil data menu" }, { status: 500 });
  }
}

// PUT /api/menu/[id] — Update menu (admin)
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session || session.user?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const { name, category, subtitle, price, image, badge, is_active } = body;

  const { error } = await supabase
    .from("menu_items")
    .update({
      name,
      category,
      subtitle: subtitle || null,
      price,
      image: image || null,
      badge: badge || null,
      is_active: is_active !== undefined ? is_active : 1,
    })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: "Gagal mengupdate menu" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

// DELETE /api/menu/[id] — Soft delete (admin)
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session || session.user?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { error } = await supabase
    .from("menu_items")
    .update({ is_active: 0 })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: "Gagal menghapus menu" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
