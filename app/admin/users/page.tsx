"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import {
  Users,
  LayoutDashboard,
  UtensilsCrossed,
  Plus,
  Pencil,
  Trash2,
  X,
  Check,
  ChefHat,
  LogOut,
  Shield,
  Eye,
  EyeOff,
  Monitor,
} from "lucide-react";

interface User {
  id: number;
  name: string;
  email: string;
  role: "admin" | "kasir";
  is_active: number;
  created_at: string;
}

const emptyForm = { name: "", email: "", password: "", role: "kasir" };

export default function AdminUsersPage() {
  const { data: session } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [showPw, setShowPw] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/users");
      const data = await res.json();
      setUsers(data.users || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const openCreate = () => {
    setEditUser(null);
    setForm(emptyForm);
    setShowPw(false);
    setModalOpen(true);
  };

  const openEdit = (user: User) => {
    setEditUser(user);
    setForm({ name: user.name, email: user.email, password: "", role: user.role });
    setShowPw(false);
    setModalOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload: any = { ...form };
      if (editUser && !payload.password) {
        delete payload.password;
      }

      const res = editUser
        ? await fetch(`/api/users/${editUser.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...payload, is_active: 1 }),
          })
        : await fetch("/api/users", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });

      if (res.ok) {
        showToast(editUser ? "Akun berhasil diperbarui!" : "Akun berhasil dibuat!");
        setModalOpen(false);
        fetchUsers();
      } else {
        const err = await res.json();
        showToast(err.error || "Gagal menyimpan akun.", "error");
      }
    } catch (e) {
      showToast("Terjadi kesalahan.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (user: User) => {
    if (session?.user?.email === user.email) {
      showToast("Anda tidak bisa menghapus akun Anda sendiri.", "error");
      return;
    }

    if (!confirm(`Hapus akun staf "${user.name}"?`)) return;

    try {
      const res = await fetch(`/api/users/${user.id}`, { method: "DELETE" });
      if (res.ok) {
        showToast("Akun berhasil dihapus.");
        fetchUsers();
      } else {
        const err = await res.json();
        showToast(err.error || "Gagal menghapus.", "error");
      }
    } catch (e) {
      showToast("Terjadi kesalahan.", "error");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-xl border text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${
            toast.type === "success"
              ? "bg-emerald-600 text-white border-emerald-500"
              : "bg-rose-600 text-white border-rose-500"
          }`}
        >
          {toast.type === "success" && <Check size={16} />}
          <span>{toast.msg}</span>
        </div>
      )}

      {/* Sidebar */}
      <aside className="fixed top-0 left-0 h-screen w-64 bg-white border-r border-slate-200 flex flex-col z-40 hidden lg:flex">
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

        <nav className="flex-1 p-4 space-y-1">
          <Link
            href="/admin"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-50 text-sm font-medium transition-colors"
          >
            <LayoutDashboard size={18} /> Dashboard
          </Link>
          <Link
            href="/admin/menu"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-50 text-sm font-medium transition-colors"
          >
            <UtensilsCrossed size={18} /> Kelola Menu
          </Link>
          <Link
            href="/admin/users"
            className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-100 text-slate-900 font-semibold text-sm"
          >
            <Users size={18} className="text-[#E6007E]" /> Kelola Pengguna
          </Link>
          <Link
            href="/kasir"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-50 text-sm font-medium transition-colors"
          >
            <Monitor size={18} /> Kasir / POS
          </Link>
        </nav>

        <div className="p-4 border-t border-slate-100 bg-slate-50">
          <div className="mb-3 px-2">
            <p className="text-sm font-bold text-slate-800 truncate">{session?.user?.name || "Administrator"}</p>
            <p className="text-xs text-slate-500 truncate">{session?.user?.email}</p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-rose-600 hover:bg-rose-50 font-medium text-xs transition-colors"
          >
            <LogOut size={16} /> Keluar
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64 p-6 sm:p-8 max-w-7xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-slate-200">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Kelola Pengguna & Staf</h1>
            <p className="text-sm text-slate-500 mt-1">Daftar akun Admin dan Kasir yang memiliki akses ke sistem</p>
          </div>

          <button
            id="admin-add-user-btn"
            onClick={openCreate}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#E6007E] hover:bg-[#D00070] text-white text-xs uppercase tracking-wider font-bold shadow-sm transition-all"
          >
            <Plus size={16} /> Tambah Akun Staf
          </button>
        </div>

        {/* Users Table */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3.5 px-5">ID</th>
                    <th className="py-3.5 px-5">Nama Staf</th>
                    <th className="py-3.5 px-5">Email</th>
                    <th className="py-3.5 px-5">Role / Hak Akses</th>
                    <th className="py-3.5 px-5">Tanggal Dibuat</th>
                    <th className="py-3.5 px-5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-4 px-5 font-bold text-slate-900">#{u.id}</td>
                      <td className="py-4 px-5 font-bold text-slate-900">{u.name}</td>
                      <td className="py-4 px-5 text-slate-600">{u.email}</td>
                      <td className="py-4 px-5">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border ${
                            u.role === "admin"
                              ? "bg-purple-50 text-purple-700 border-purple-200"
                              : "bg-blue-50 text-blue-700 border-blue-200"
                          }`}
                        >
                          <Shield size={12} /> {u.role}
                        </span>
                      </td>
                      <td className="py-4 px-5 text-slate-500">
                        {new Date(u.created_at).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="py-4 px-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEdit(u)}
                            className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 border border-slate-200 transition-colors"
                            title="Edit User"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            onClick={() => handleDelete(u)}
                            disabled={session?.user?.email === u.email}
                            className="p-2 rounded-lg text-rose-600 hover:bg-rose-50 border border-slate-200 transition-colors disabled:opacity-40"
                            title="Hapus User"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Modal Add / Edit User */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-100">
              <h2 className="text-slate-900 text-lg font-bold">
                {editUser ? "Edit Akun Staf" : "Tambah Akun Staf Baru"}
              </h2>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-slate-700 text-xs font-bold uppercase tracking-wider block mb-1">
                  Nama Lengkap *
                </label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 text-xs focus:outline-none focus:border-[#E6007E]"
                  placeholder="Contoh: Budi Susanto"
                />
              </div>

              <div>
                <label className="text-slate-700 text-xs font-bold uppercase tracking-wider block mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 text-xs focus:outline-none focus:border-[#E6007E]"
                  placeholder="budi@gacoan.com"
                />
              </div>

              <div>
                <label className="text-slate-700 text-xs font-bold uppercase tracking-wider block mb-1">
                  Password {editUser ? "(Kosongkan jika tidak diubah)" : "*"}
                </label>
                <div className="relative">
                  <input
                    type={showPw ? "text" : "password"}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 text-xs focus:outline-none focus:border-[#E6007E] pr-10"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-slate-700 text-xs font-bold uppercase tracking-wider block mb-1">
                  Role / Hak Akses *
                </label>
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value as "admin" | "kasir" })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 text-xs focus:outline-none focus:border-[#E6007E]"
                >
                  <option value="kasir">KASIR (Akses POS & Pesanan)</option>
                  <option value="admin">ADMIN (Akses Penuh Management)</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6 pt-4 border-t border-slate-100">
              <button
                onClick={() => setModalOpen(false)}
                className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold uppercase tracking-wider transition-colors"
              >
                Batal
              </button>
              <button
                id="user-save-btn"
                onClick={handleSave}
                disabled={saving || !form.name || !form.email}
                className="flex-1 py-3 rounded-xl bg-[#E6007E] hover:bg-[#D00070] text-white text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-50"
              >
                {saving ? "Menyimpan..." : (editUser ? "Simpan Perubahan" : "Buat Akun")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
