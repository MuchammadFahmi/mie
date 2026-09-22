"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  UtensilsCrossed,
  LayoutDashboard,
  Users,
  Plus,
  Pencil,
  Trash2,
  X,
  ChefHat,
  LogOut,
  Upload,
  Image as ImageIcon,
  Monitor,
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";

interface MenuItem {
  id: number;
  name: string;
  category: string;
  subtitle: string;
  price: number;
  image: string;
  badge: string;
  is_active: number;
}

const CATEGORIES = ["mie", "dimsum", "minuman", "paket"];

export default function AdminMenuPage() {
  const { data: session } = useSession();
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<MenuItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [form, setForm] = useState({
    name: "",
    category: "mie",
    subtitle: "",
    price: "",
    image: "",
    badge: "",
  });

  const loadMenu = async () => {
    try {
      const res = await fetch("/api/menu");
      const data = await res.json();
      setItems(Array.isArray(data) ? data : (data.menu || []));
    } catch (e) {
      console.error(e);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMenu();
  }, []);

  const openAdd = () => {
    setEditItem(null);
    setForm({ name: "", category: "mie", subtitle: "", price: "", image: "", badge: "" });
    setModalOpen(true);
  };

  const openEdit = (item: MenuItem) => {
    setEditItem(item);
    setForm({
      name: item.name,
      category: item.category,
      subtitle: item.subtitle || "",
      price: String(item.price),
      image: item.image || "",
      badge: item.badge || "",
    });
    setModalOpen(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.url) {
        setForm((prev) => ({ ...prev, image: data.url }));
      } else {
        alert(data.error || "Gagal mengunggah file gambar.");
      }
    } catch (err) {
      alert("Terjadi kesalahan saat mengunggah file.");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!form.name || !form.price) {
      alert("Nama dan Harga wajib diisi!");
      return;
    }

    setSaving(true);
    try {
      const url = editItem ? `/api/menu/${editItem.id}` : "/api/menu";
      const method = editItem ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          category: form.category,
          subtitle: form.subtitle,
          price: parseInt(form.price),
          image: form.image || "/assets/miegacoan.webp",
          badge: form.badge,
        }),
      });

      if (res.ok) {
        setModalOpen(false);
        loadMenu();
      } else {
        const err = await res.json();
        alert(err.error || "Gagal menyimpan menu.");
      }
    } catch (e) {
      alert("Terjadi kesalahan.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item: MenuItem) => {
    if (!confirm(`Hapus menu "${item.name}"?`)) return;

    try {
      const res = await fetch(`/api/menu/${item.id}`, { method: "DELETE" });
      if (res.ok) loadMenu();
    } catch (e) {
      alert("Gagal menghapus.");
    }
  };

  const safeItems = Array.isArray(items) ? items : [];
  const filtered = filterCategory === "all"
    ? safeItems
    : safeItems.filter((i) => i.category === filterCategory);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
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
            className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-100 text-slate-900 font-semibold text-sm"
          >
            <UtensilsCrossed size={18} className="text-[#E6007E]" /> Kelola Menu
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
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Manajemen Menu</h1>
            <p className="text-sm text-slate-500 mt-1">Kelola daftar menu, harga, dan foto makanan/minuman</p>
          </div>

          <button
            id="admin-add-menu-btn"
            onClick={openAdd}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#E6007E] hover:bg-[#D00070] text-white text-xs uppercase tracking-wider font-bold shadow-sm transition-all"
          >
            <Plus size={16} /> Tambah Menu Baru
          </button>
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {["all", ...CATEGORIES].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors ${
                filterCategory === cat
                  ? "bg-[#0F2A33] text-white"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
              }`}
            >
              {cat === "all" ? "Semua Menu" : cat}
            </button>
          ))}
        </div>

        {/* List of Menu */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {filtered.map((item) => (
              <div key={item.id} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col justify-between hover:border-slate-300 transition-all">
                <div>
                  <div className="flex items-start gap-4">
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                      <Image
                        src={item.image || "/assets/miegacoan.webp"}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[11px] font-bold text-[#17B8CF] uppercase tracking-wider">{item.category}</span>
                      <h3 className="font-bold text-slate-900 text-base leading-snug truncate">{item.name}</h3>
                      {item.badge && (
                        <span className="inline-block text-[10px] bg-rose-50 text-[#E6007E] border border-rose-200 font-semibold px-2 py-0.5 rounded-md mt-1">
                          {item.badge}
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-slate-500 text-xs mt-3 line-clamp-2">{item.subtitle}</p>
                </div>

                <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
                  <span className="text-[#E6007E] font-bold text-base">
                    Rp {item.price.toLocaleString("id-ID")}
                  </span>

                  <div className="flex gap-2">
                    <button
                      onClick={() => openEdit(item)}
                      className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 border border-slate-200 transition-colors"
                      title="Edit Menu"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      onClick={() => handleDelete(item)}
                      className="p-2 rounded-lg text-rose-600 hover:bg-rose-50 border border-slate-200 transition-colors"
                      title="Hapus Menu"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modal Add / Edit Menu */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-lg shadow-2xl border border-slate-200 my-8">
            <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-100">
              <h2 className="text-slate-900 text-lg font-bold">
                {editItem ? "Edit Menu" : "Tambah Menu Baru"}
              </h2>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-700 text-xs font-bold uppercase tracking-wider block mb-1">
                    Nama Menu *
                  </label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 text-xs focus:outline-none focus:border-[#E6007E]"
                    placeholder="Contoh: Mie Gacoan Lv 1"
                  />
                </div>
                <div>
                  <label className="text-slate-700 text-xs font-bold uppercase tracking-wider block mb-1">
                    Kategori *
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 text-xs focus:outline-none focus:border-[#E6007E]"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c.toUpperCase()}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-700 text-xs font-bold uppercase tracking-wider block mb-1">
                  Deskripsi Singkat
                </label>
                <input
                  value={form.subtitle}
                  onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 text-xs focus:outline-none focus:border-[#E6007E]"
                  placeholder="Pedas gurih khas Gacoan..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-700 text-xs font-bold uppercase tracking-wider block mb-1">
                    Harga (Rp) *
                  </label>
                  <input
                    type="number"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 text-xs focus:outline-none focus:border-[#E6007E]"
                    placeholder="10500"
                  />
                </div>
                <div>
                  <label className="text-slate-700 text-xs font-bold uppercase tracking-wider block mb-1">
                    Badge / Tag
                  </label>
                  <input
                    value={form.badge}
                    onChange={(e) => setForm({ ...form, badge: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 text-xs focus:outline-none focus:border-[#E6007E]"
                    placeholder="Terlaris, Best Seller..."
                  />
                </div>
              </div>

              {/* Photo Input & File Picker */}
              <div>
                <label className="text-slate-700 text-xs font-bold uppercase tracking-wider block mb-1">
                  Foto Menu (Pilih File)
                </label>

                <div className="flex items-center gap-3 mb-2">
                  <div className="relative w-14 h-14 rounded-xl border border-slate-200 overflow-hidden bg-slate-100 flex items-center justify-center shrink-0">
                    {form.image ? (
                      <Image src={form.image} alt="Preview" fill className="object-cover" />
                    ) : (
                      <ImageIcon size={20} className="text-slate-400" />
                    )}
                  </div>

                  <div className="flex-1">
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <button
                      type="button"
                      disabled={uploading}
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 text-xs font-semibold rounded-xl flex items-center gap-2 transition-colors disabled:opacity-50"
                    >
                      <Upload size={14} />
                      <span>{uploading ? "Mengunggah..." : "Pilih File dari Komputer"}</span>
                    </button>
                    <p className="text-[10px] text-slate-500 mt-1">Format: JPG, PNG, WEBP</p>
                  </div>
                </div>

                <input
                  type="text"
                  value={form.image}
                  onChange={(e) => setForm({ ...form, image: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-slate-900 text-xs focus:outline-none focus:border-[#E6007E]"
                  placeholder="Atau ketik URL / path gambar..."
                />
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
                id="menu-save-btn"
                onClick={handleSave}
                disabled={saving || !form.name || !form.price}
                className="flex-1 py-3 rounded-xl bg-[#E6007E] hover:bg-[#D00070] text-white text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-50"
              >
                {saving ? "Menyimpan..." : (editItem ? "Simpan Perubahan" : "Tambahkan Menu")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
