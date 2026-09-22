import { NextRequest, NextResponse } from "next/server";
import supabase from "@/lib/db";
import { auth } from "@/lib/auth";
import bcrypt from "bcryptjs";

// PUT /api/users/[id] — Update akun (admin)
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
  const { name, email, password, role, is_active } = body;

  const updates: Record<string, unknown> = {
    name,
    email,
    role,
    is_active: is_active !== undefined ? is_active : 1,
  };

  if (password) {
    updates.password = await bcrypt.hash(password, 12);
  }

  const { error } = await supabase.from("users").update(updates).eq("id", id);

  if (error) {
    return NextResponse.json({ error: "Gagal mengupdate pengguna" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

// DELETE /api/users/[id] — Soft delete (admin, tidak bisa hapus diri sendiri)
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session || session.user?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  if (String(id) === String(session.user.id)) {
    return NextResponse.json(
      { error: "Tidak bisa menghapus akun sendiri" },
      { status: 400 }
    );
  }

  const { error } = await supabase
    .from("users")
    .update({ is_active: 0 })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: "Gagal menonaktifkan pengguna" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
