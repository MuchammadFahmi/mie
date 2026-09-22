import { NextRequest, NextResponse } from "next/server";
import supabase from "@/lib/db";
import { auth } from "@/lib/auth";
import bcrypt from "bcryptjs";

// GET /api/users — List semua user (admin)
export async function GET() {
  const session = await auth();
  if (!session || session.user?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("users")
    .select("id, name, email, role, is_active, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: "Gagal memuat data pengguna" }, { status: 500 });
  }

  return NextResponse.json({ users: data });
}

// POST /api/users — Tambah akun kasir/admin (admin)
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { name, email, password, role } = body;

  if (!name || !email || !password) {
    return NextResponse.json(
      { error: "Nama, email, dan password wajib diisi" },
      { status: 400 }
    );
  }

  // Cek email duplikat
  const { data: existing } = await supabase
    .from("users")
    .select("id")
    .eq("email", email)
    .single();

  if (existing) {
    return NextResponse.json({ error: "Email sudah digunakan" }, { status: 409 });
  }

  const hashed = await bcrypt.hash(password, 12);
  const { data, error } = await supabase
    .from("users")
    .insert({
      name,
      email,
      password: hashed,
      role: role === "admin" ? "admin" : "kasir",
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: "Gagal menambah pengguna" }, { status: 500 });
  }

  return NextResponse.json({ success: true, id: data.id }, { status: 201 });
}
