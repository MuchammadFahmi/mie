"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import {
  Search,
  Plus,
  Minus,
  ShoppingBag,
  Flame,
  Check,
  Sparkles,
  ArrowRight,
  X,
  Bike,
  QrCode,
  ThermometerSnowflake,
  Sun,
} from "lucide-react";

// Types for items and customized cart items
interface MenuItem {
  id: string;
  name: string;
  category: "mie" | "dimsum" | "minuman" | "paket";
  subtitle: string;
  price: number;
  formattedPrice: string;
  requiresSpicyLevel?: boolean;
  requiresTeaOptions?: boolean;
  image: string;
  badge?: string;
}

interface CartItem {
  cartId: string; // Unique ID per item + options
  itemId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  spicyLevel?: number;
  teaOption?: "Iced" | "Hot";
  sugarOption?: "Normal" | "Less";
  notes?: string;
}

interface LastAddedItem {
  cartId: string;
  item: MenuItem;
  displayName: string;
  price: number;
  image: string;
}

// Menu Items Data
const noodleItems: MenuItem[] = [
  {
    id: "m1",
    name: "Mie Gacoan Lv 1–8",
    category: "mie",
    subtitle: "Pedas Manis — Level 1–8 (sesuaikan kemampuan pedas)",
    price: 10500,
    formattedPrice: "Rp 10.500",
    requiresSpicyLevel: true,
    image: "/assets/miegacoan.webp",
    badge: "Terlaris #1",
  },
  {
    id: "m2",
    name: "Mie Hompimpa Lv 1–8",
    category: "mie",
    subtitle: "Gurih Asin — Cocok buat yang suka rasa asin pedas nendang",
    price: 10500,
    formattedPrice: "Rp 10.500",
    requiresSpicyLevel: true,
    image: "/assets/miehompimpa.png",
    badge: "Favorit",
  },
  {
    id: "m3",
    name: "Mie Suit",
    category: "mie",
    subtitle: "Rasa paling \"safe\" buat repeat order (Original tanpa cabai)",
    price: 10000,
    formattedPrice: "Rp 10.000",
    image: "/assets/miesuit.webp",
    badge: "Kids Friendly",
  },
];

const dimsumItems: MenuItem[] = [
  {
    id: "d1",
    name: "Udang Rambutan",
    category: "dimsum",
    subtitle: "Daging udang lembut dibalut olahan kulit crispy renyah",
    price: 9500,
    formattedPrice: "Rp 9.500",
    image: "/assets/udangrambutan.jpg",
    badge: "Wajib Coba",
  },
  {
    id: "d2",
    name: "Udang Keju",
    category: "dimsum",
    subtitle: "Dimsum udang olahan isi keju lumer meledak gurih saat digigit",
    price: 9500,
    formattedPrice: "Rp 9.500",
    image: "/assets/udangkeju.webp",
    badge: "Best Seller",
  },
  {
    id: "d3",
    name: "Lumpia Udang",
    category: "dimsum",
    subtitle: "Lumpia goreng isi adonan udang padat dengan saus cocolan khas",
    price: 9500,
    formattedPrice: "Rp 9.500",
    image: "/assets/lumpiaudang.jpg",
  },
  {
    id: "d4",
    name: "Pangsit Goreng",
    category: "dimsum",
    subtitle: "Pangsit crispy ekstra kriuk isi daging ayam gurih (isi 3 pcs)",
    price: 9500,
    formattedPrice: "Rp 9.500",
    image: "/assets/pangsitgoreng.jpg",
  },
];

const drinkItems: MenuItem[] = [
  {
    id: "b1",
    name: "Teh Gacoan (Tea)",
    category: "minuman",
    subtitle: "Teh manis segar racikan khas Gacoan (Pilih Iced / Hot)",
    price: 6000,
    formattedPrice: "Rp 6.000",
    requiresTeaOptions: true,
    image: "/assets/teh.webp",
    badge: "Paling Segar",
  },
  {
    id: "b2",
    name: "Es Genderuwo",
    category: "minuman",
    subtitle: "Es perpaduan buah-buahan manis, cincau lembut & sirup pereda pedas",
    price: 8500,
    formattedPrice: "Rp 8.500",
    requiresTeaOptions: false,
    image: "/assets/esgenderuwo.jpg",
    badge: "Favorit #1",
  },
  {
    id: "b3",
    name: "Es Gobak Sodor",
    category: "minuman",
    subtitle: "Minuman es buah segar kombinasi jelly dan pembilas dahaga",
    price: 8500,
    formattedPrice: "Rp 8.500",
    image: "/assets/esgobaksodor.webp",
  },
];

const packageItems: MenuItem[] = [
  {
    id: "p1",
    name: "Paket Combo Fest 1",
    category: "paket",
    subtitle: "Mie Gacoan Level 1 2x, Udang Keju 1x, Udang Rambutan 1x, Es Teh 2x",
    price: 45000,
    formattedPrice: "Rp 45.000",
    image: "/assets/paketcombofest1.webp",
    badge: "Hemat 15%",
  },
  {
    id: "p2",
    name: "Paket Combo Fest 2",
    category: "paket",
    subtitle: "Mie Gacoan 1x, Lumpia Udang 1x, Es Orange 1x",
    price: 25000,
    formattedPrice: "Rp 25.000",
    image: "/assets/paketcombofest2.jpg",
    badge: "Paket Spesial",
  },
];

export default function MenuPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [cart, setCart] = useState<CartItem[]>([]);

  // Modals state
  const [activeSpicyModalItem, setActiveSpicyModalItem] = useState<MenuItem | null>(null);
  const [selectedSpicyLevel, setSelectedSpicyLevel] = useState<number>(3);
  const [spicyNotes, setSpicyNotes] = useState<string>("");

  const [activeTeaModalItem, setActiveTeaModalItem] = useState<MenuItem | null>(null);
  const [selectedTeaOption, setSelectedTeaOption] = useState<"Iced" | "Hot">("Iced");
  const [selectedSugarOption, setSelectedSugarOption] = useState<"Normal" | "Less">("Normal");

  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState<boolean>(false);
  const [isProofModalOpen, setIsProofModalOpen] = useState<boolean>(false);
  const [orderType, setOrderType] = useState<"online" | "dinein">("online");
  const [customerName, setCustomerName] = useState<string>("");
  const [tableNo, setTableNo] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<string>("QRIS");
  const [paymentProof, setPaymentProof] = useState<string>("");
  const [uploadingProof, setUploadingProof] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [orderSuccessData, setOrderSuccessData] = useState<any>(null);

  const proofInputRef = useRef<HTMLInputElement | null>(null);

  const handleProofUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingProof(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.url) {
        setPaymentProof(data.url);
      } else {
        alert(data.error || "Gagal mengunggah bukti transfer.");
      }
    } catch (err) {
      alert("Terjadi kesalahan saat mengunggah bukti transfer.");
    } finally {
      setUploadingProof(false);
    }
  };

  // Floating Added Item Window State
  const [lastAddedWindow, setLastAddedWindow] = useState<LastAddedItem | null>(null);

  const handleConfirmOrder = async () => {
    if (cart.length === 0) return;
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: customerName || (orderType === "dinein" ? "Pelanggan Dine-in" : "Pelanggan Online"),
          tableNo: orderType === "dinein" ? (tableNo || "Meja 1") : null,
          orderType: orderType === "online" ? "Take Away" : "Dine In",
          paymentMethod,
          paymentProof,
          items: cart.map((item) => ({
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            spicyLevel: item.spicyLevel || 0,
            notes: item.notes || "",
          })),
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setOrderSuccessData({
          order_code: data.order_code,
          order_id: data.order_id,
          total_price: data.total_price,
          customerName: customerName || (orderType === "dinein" ? "Pelanggan Dine-in" : "Pelanggan Online"),
          orderType: orderType === "online" ? "Take Away" : "Dine In",
          tableNo: orderType === "dinein" ? (tableNo || "Meja 1") : null,
        });
        setIsCheckoutModalOpen(false);
        setIsProofModalOpen(false);
        setCart([]);
        setLastAddedWindow(null);
        setCustomerName("");
        setTableNo("");
        setPaymentProof("");
      } else {
        alert(data.error || "Gagal membuat pesanan.");
      }
    } catch (err) {
      alert("Terjadi kesalahan jaringan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add Item Handler
  const handleItemClick = (item: MenuItem) => {
    if (item.requiresSpicyLevel) {
      setActiveSpicyModalItem(item);
      setSelectedSpicyLevel(3);
      setSpicyNotes("");
    } else if (item.requiresTeaOptions) {
      setActiveTeaModalItem(item);
      setSelectedTeaOption("Iced");
      setSelectedSugarOption("Normal");
    } else {
      // Direct Add
      const newItem: CartItem = {
        cartId: item.id,
        itemId: item.id,
        name: item.name,
        price: item.price,
        quantity: 1,
        image: item.image,
      };
      addToCart(newItem);
      setLastAddedWindow({
        cartId: item.id,
        item,
        displayName: item.name,
        price: item.price,
        image: item.image,
      });
    }
  };

  const confirmSpicyAdd = () => {
    if (!activeSpicyModalItem) return;
    const cartId = `${activeSpicyModalItem.id}_lvl${selectedSpicyLevel}_${spicyNotes}`;
    const displayName = `${activeSpicyModalItem.name} (Lvl ${selectedSpicyLevel})`;

    const newItem: CartItem = {
      cartId,
      itemId: activeSpicyModalItem.id,
      name: displayName,
      price: activeSpicyModalItem.price,
      quantity: 1,
      image: activeSpicyModalItem.image,
      spicyLevel: selectedSpicyLevel,
      notes: spicyNotes,
    };

    addToCart(newItem);
    setLastAddedWindow({
      cartId,
      item: activeSpicyModalItem,
      displayName,
      price: activeSpicyModalItem.price,
      image: activeSpicyModalItem.image,
    });
    setActiveSpicyModalItem(null);
  };

  const confirmTeaAdd = () => {
    if (!activeTeaModalItem) return;
    const cartId = `${activeTeaModalItem.id}_${selectedTeaOption}_${selectedSugarOption}`;
    const displayName = `Teh Gacoan (${selectedTeaOption} - ${selectedSugarOption} Sugar)`;

    const newItem: CartItem = {
      cartId,
      itemId: activeTeaModalItem.id,
      name: displayName,
      price: activeTeaModalItem.price,
      quantity: 1,
      image: activeTeaModalItem.image,
      teaOption: selectedTeaOption,
      sugarOption: selectedSugarOption,
    };

    addToCart(newItem);
    setLastAddedWindow({
      cartId,
      item: activeTeaModalItem,
      displayName,
      price: activeTeaModalItem.price,
      image: activeTeaModalItem.image,
    });
    setActiveTeaModalItem(null);
  };

  const addToCart = (newItem: CartItem) => {
    setCart((prev) => {
      const existingIndex = prev.findIndex((i) => i.cartId === newItem.cartId);
      if (existingIndex > -1) {
        const copy = [...prev];
        copy[existingIndex].quantity += 1;
        return copy;
      }
      return [...prev, newItem];
    });
  };

  const updateCartQuantity = (cartId: string, delta: number) => {
    setCart((prev) => {
      return prev
        .map((item) => {
          if (item.cartId === cartId) {
            const nextQty = item.quantity + delta;
            return nextQty > 0 ? { ...item, quantity: nextQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalCartPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const [liveMenu, setLiveMenu] = useState<MenuItem[]>([]);

  useEffect(() => {
    fetch("/api/menu")
      .then((r) => r.json())
      .then((data) => {
        const raw = Array.isArray(data) ? data : (data.menu || []);
        if (raw.length > 0) {
          const formatted: MenuItem[] = raw.map((item: any) => ({
            id: String(item.id),
            name: item.name,
            category: item.category,
            subtitle: item.subtitle || "",
            price: item.price,
            formattedPrice: `Rp ${item.price.toLocaleString("id-ID")}`,
            requiresSpicyLevel: item.category === "mie" && !item.name.toLowerCase().includes("suit"),
            requiresTeaOptions: item.name.toLowerCase().includes("teh"),
            image: item.image || "/assets/miegacoan.webp",
            badge: item.badge || undefined,
          }));
          setLiveMenu(formatted);
        }
      })
      .catch((e) => console.error(e));
  }, []);

  // Filter lists based on search
  const matchesSearch = (item: MenuItem) => {
    if (!searchQuery) return true;
    return (
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.subtitle.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const activeNoodles = liveMenu.length > 0 ? liveMenu.filter((i) => i.category === "mie") : noodleItems;
  const activeDimsums = liveMenu.length > 0 ? liveMenu.filter((i) => i.category === "dimsum") : dimsumItems;
  const activeDrinks = liveMenu.length > 0 ? liveMenu.filter((i) => i.category === "minuman") : drinkItems;
  const activePackages = liveMenu.length > 0 ? liveMenu.filter((i) => i.category === "paket") : packageItems;

  const filteredNoodles = activeNoodles.filter(matchesSearch);
  const filteredDimsums = activeDimsums.filter(matchesSearch);
  const filteredDrinks = activeDrinks.filter(matchesSearch);
  const filteredPackages = activePackages.filter(matchesSearch);

  const totalFilteredCount =
    filteredNoodles.length +
    filteredDimsums.length +
    filteredDrinks.length +
    filteredPackages.length;

  return (
    <div className="min-h-screen flex flex-col justify-between bg-white text-[#0F2A33]">
      <Navbar />

      <main className="flex-1 pt-20 pb-28">
        {/* Top Teal Header with Search Input Bar (Menu Highlight removed as requested) */}
        <section className="bg-[#17B8CF] text-white py-6 px-4 sm:px-8 relative overflow-hidden">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Search Input Bar */}
            <div className="w-full sm:w-8/12 md:w-6/12 relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari: mie / dimsum / es..."
                className="w-full pl-12 pr-10 py-3 rounded-full bg-white text-[#0F2A33] placeholder-gray-400 text-sm focus:outline-none focus:ring-4 focus:ring-[#E6007E]/30 shadow-md"
              />
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#17B8CF]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Status counter info */}
            <div className="text-xs tracking-wider whitespace-nowrap opacity-95">
              Menampilkan <span className="font-bold text-[#FFF4C2]">{totalFilteredCount} item</span> • Update: 21 September 2026
            </div>
          </div>
        </section>

        {/* Catalog Main Layout (Sidebar Pills + Main Category Block Sections) */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 flex flex-col md:flex-row gap-8">
          {/* Left Vertical Category Filter Pills */}
          <aside className="md:w-48 shrink-0">
            <div className="sticky top-24 flex md:flex-col gap-2 overflow-x-auto md:overflow-visible pb-2 md:pb-0">
              <button
                onClick={() => setSelectedCategory("all")}
                className={`px-6 py-3 rounded-full text-xs font-medium uppercase tracking-wider text-left transition-all ${
                  selectedCategory === "all"
                    ? "bg-[#17B8CF] text-white shadow-md font-bold"
                    : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                Semua
              </button>
              <button
                onClick={() => setSelectedCategory("mie")}
                className={`px-6 py-3 rounded-full text-xs font-medium uppercase tracking-wider text-left transition-all ${
                  selectedCategory === "mie"
                    ? "bg-[#17B8CF] text-white shadow-md font-bold"
                    : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                Mie
              </button>
              <button
                onClick={() => setSelectedCategory("dimsum")}
                className={`px-6 py-3 rounded-full text-xs font-medium uppercase tracking-wider text-left transition-all ${
                  selectedCategory === "dimsum"
                    ? "bg-[#17B8CF] text-white shadow-md font-bold"
                    : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                Dimsum
              </button>
              <button
                onClick={() => setSelectedCategory("minuman")}
                className={`px-6 py-3 rounded-full text-xs font-medium uppercase tracking-wider text-left transition-all ${
                  selectedCategory === "minuman"
                    ? "bg-[#17B8CF] text-white shadow-md font-bold"
                    : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                Minuman
              </button>
              <button
                onClick={() => setSelectedCategory("paket")}
                className={`px-6 py-3 rounded-full text-xs font-medium uppercase tracking-wider text-left transition-all ${
                  selectedCategory === "paket"
                    ? "bg-[#17B8CF] text-white shadow-md font-bold"
                    : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                Paket
              </button>
            </div>
          </aside>

          {/* Right Main Category Sections Content */}
          <div className="flex-1 space-y-16">
            {/* 1. MENU MIE BLOCK */}
            {(selectedCategory === "all" || selectedCategory === "mie") && filteredNoodles.length > 0 && (
              <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-sm">
                <div className="grid lg:grid-cols-12 gap-8 items-center">
                  <div className="lg:col-span-5 relative h-64 sm:h-80 rounded-3xl overflow-hidden shadow-lg group">
                    <Image
                      src="/assets/makangacoan.jpg"
                      alt="Menu Mie Gacoan"
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute top-4 left-4 bg-[#E6007E] text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow">
                      Pedas Nendang
                    </div>
                  </div>

                  <div className="lg:col-span-7 space-y-6">
                    <div>
                      <h2 className="text-2xl sm:text-3xl font-medium text-[#E6007E] uppercase tracking-wide">
                        MENU MIE
                      </h2>
                      <p className="text-gray-600 text-sm mt-1">
                        Pilih mie sesuai selera—yang pedas nendang atau yang aman non-pedas.
                      </p>
                    </div>

                    <div className="space-y-4">
                      {filteredNoodles.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => handleItemClick(item)}
                          className="p-4 rounded-2xl border border-gray-100 bg-gray-50/60 hover:bg-white hover:border-[#17B8CF] hover:shadow-md transition-all cursor-pointer flex items-center justify-between group"
                        >
                          <div className="pr-4">
                            <div className="flex items-center space-x-2">
                              <h3 className="font-medium text-base sm:text-lg text-[#0F2A33] uppercase group-hover:text-[#17B8CF] transition-colors">
                                {item.name}
                              </h3>
                              {item.badge && (
                                <span className="text-[10px] bg-[#E6007E] text-white px-2 py-0.5 rounded-full uppercase font-bold">
                                  {item.badge}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 mt-1">{item.subtitle}</p>
                          </div>

                          <div className="flex items-center space-x-3 shrink-0">
                            <span className="px-3.5 py-1.5 rounded-full bg-[#FFF4C2] text-[#0F2A33] text-xs font-bold shadow-sm">
                              {item.formattedPrice}
                            </span>
                            <div className="w-8 h-8 rounded-full bg-[#17B8CF] text-white flex items-center justify-center group-hover:bg-[#E6007E] transition-colors shadow-sm">
                              <Plus size={16} />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 2. MENU DIMSUM BLOCK */}
            {(selectedCategory === "all" || selectedCategory === "dimsum") && filteredDimsums.length > 0 && (
              <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-sm">
                <div className="grid lg:grid-cols-12 gap-8 items-center">
                  <div className="lg:col-span-5 relative h-64 sm:h-80 rounded-3xl overflow-hidden shadow-lg group">
                    <Image
                      src="/assets/udangrambutan.jpg"
                      alt="Menu Dimsum Gacoan"
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute top-4 left-4 bg-[#17B8CF] text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow">
                      Crispy & Gurih
                    </div>
                  </div>

                  <div className="lg:col-span-7 space-y-6">
                    <div>
                      <h2 className="text-2xl sm:text-3xl font-medium text-[#17B8CF] uppercase tracking-wide">
                        MENU DIMSUM
                      </h2>
                      <p className="text-gray-600 text-sm mt-1">
                        Olahan dimsum renyah gurih pelengkap sempurna mie pedasmu.
                      </p>
                    </div>

                    <div className="space-y-4">
                      {filteredDimsums.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => handleItemClick(item)}
                          className="p-4 rounded-2xl border border-gray-100 bg-gray-50/60 hover:bg-white hover:border-[#17B8CF] hover:shadow-md transition-all cursor-pointer flex items-center justify-between group"
                        >
                          <div className="pr-4">
                            <div className="flex items-center space-x-2">
                              <h3 className="font-medium text-base sm:text-lg text-[#0F2A33] uppercase group-hover:text-[#17B8CF] transition-colors">
                                {item.name}
                              </h3>
                              {item.badge && (
                                <span className="text-[10px] bg-amber-500 text-white px-2 py-0.5 rounded-full uppercase font-bold">
                                  {item.badge}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 mt-1">{item.subtitle}</p>
                          </div>

                          <div className="flex items-center space-x-3 shrink-0">
                            <span className="px-3.5 py-1.5 rounded-full bg-[#FFF4C2] text-[#0F2A33] text-xs font-bold shadow-sm">
                              {item.formattedPrice}
                            </span>
                            <div className="w-8 h-8 rounded-full bg-[#17B8CF] text-white flex items-center justify-center group-hover:bg-[#E6007E] transition-colors shadow-sm">
                              <Plus size={16} />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 3. MENU MINUMAN BLOCK */}
            {(selectedCategory === "all" || selectedCategory === "minuman") && filteredDrinks.length > 0 && (
              <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-sm">
                <div className="grid lg:grid-cols-12 gap-8 items-center">
                  <div className="lg:col-span-5 relative h-64 sm:h-80 rounded-3xl overflow-hidden shadow-lg group">
                    <Image
                      src="/assets/esgenderuwo.jpg"
                      alt="Menu Minuman Segar"
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute top-4 left-4 bg-[#E6007E] text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow">
                      Penyegar Pedas
                    </div>
                  </div>

                  <div className="lg:col-span-7 space-y-6">
                    <div>
                      <h2 className="text-2xl sm:text-3xl font-medium text-[#E6007E] uppercase tracking-wide">
                        MENU MINUMAN SEGAR
                      </h2>
                      <p className="text-gray-600 text-sm mt-1">
                        Minuman buah segar dan teh khas penyelamat lidah setelah makan pedas.
                      </p>
                    </div>

                    <div className="space-y-4">
                      {filteredDrinks.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => handleItemClick(item)}
                          className="p-4 rounded-2xl border border-gray-100 bg-gray-50/60 hover:bg-white hover:border-[#17B8CF] hover:shadow-md transition-all cursor-pointer flex items-center justify-between group"
                        >
                          <div className="pr-4">
                            <div className="flex items-center space-x-2">
                              <h3 className="font-medium text-base sm:text-lg text-[#0F2A33] uppercase group-hover:text-[#17B8CF] transition-colors">
                                {item.name}
                              </h3>
                              {item.badge && (
                                <span className="text-[10px] bg-[#17B8CF] text-white px-2 py-0.5 rounded-full uppercase font-bold">
                                  {item.badge}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 mt-1">{item.subtitle}</p>
                          </div>

                          <div className="flex items-center space-x-3 shrink-0">
                            <span className="px-3.5 py-1.5 rounded-full bg-[#FFF4C2] text-[#0F2A33] text-xs font-bold shadow-sm">
                              {item.formattedPrice}
                            </span>
                            <div className="w-8 h-8 rounded-full bg-[#17B8CF] text-white flex items-center justify-center group-hover:bg-[#E6007E] transition-colors shadow-sm">
                              <Plus size={16} />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 4. MENU PAKET BLOCK */}
            {(selectedCategory === "all" || selectedCategory === "paket") && filteredPackages.length > 0 && (
              <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-sm">
                <div className="grid lg:grid-cols-12 gap-8 items-center">
                  <div className="lg:col-span-5 relative h-64 sm:h-80 rounded-3xl overflow-hidden shadow-lg group">
                    <Image
                      src="/assets/dimsumgacoan1.png"
                      alt="Paket Combo Gacoan"
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute top-4 left-4 bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow">
                      Super Hemat
                    </div>
                  </div>

                  <div className="lg:col-span-7 space-y-6">
                    <div>
                      <h2 className="text-2xl sm:text-3xl font-medium text-amber-500 uppercase tracking-wide">
                        PAKET COMBO HEMAT
                      </h2>
                      <p className="text-gray-600 text-sm mt-1">
                        Paket bundel mie + dimsum + minuman lebih hemat untuk sendiri atau berdua.
                      </p>
                    </div>

                    <div className="space-y-4">
                      {filteredPackages.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => handleItemClick(item)}
                          className="p-4 rounded-2xl border border-gray-100 bg-gray-50/60 hover:bg-white hover:border-[#17B8CF] hover:shadow-md transition-all cursor-pointer flex items-center justify-between group"
                        >
                          <div className="pr-4">
                            <div className="flex items-center space-x-2">
                              <h3 className="font-medium text-base sm:text-lg text-[#0F2A33] uppercase group-hover:text-[#17B8CF] transition-colors">
                                {item.name}
                              </h3>
                              {item.badge && (
                                <span className="text-[10px] bg-[#E6007E] text-white px-2 py-0.5 rounded-full uppercase font-bold">
                                  {item.badge}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 mt-1">{item.subtitle}</p>
                          </div>

                          <div className="flex items-center space-x-3 shrink-0">
                            <span className="px-3.5 py-1.5 rounded-full bg-[#FFF4C2] text-[#0F2A33] text-xs font-bold shadow-sm">
                              {item.formattedPrice}
                            </span>
                            <div className="w-8 h-8 rounded-full bg-[#17B8CF] text-white flex items-center justify-center group-hover:bg-[#E6007E] transition-colors shadow-sm">
                              <Plus size={16} />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* FLOATING ADDED ITEM WINDOW (Jendela Mengambang Berisi Foto Menu & Tombol Tambah) */}
      {lastAddedWindow && (
        <div className="fixed bottom-24 right-4 sm:right-8 z-50 bg-[#0F2A33] text-white p-4 rounded-3xl shadow-2xl border border-white/20 max-w-sm w-full animate-bounce-short">
          <div className="flex items-start justify-between pb-2 border-b border-white/10 mb-3">
            <div className="flex items-center space-x-2 text-xs text-[#FFF4C2] font-bold uppercase tracking-wider">
              <Check size={16} className="text-[#17B8CF]" />
              <span>Berhasil Ditambahkan!</span>
            </div>
            <button
              onClick={() => setLastAddedWindow(null)}
              className="text-gray-400 hover:text-white"
            >
              <X size={16} />
            </button>
          </div>

          <div className="flex items-center space-x-3.5 mb-4">
            {/* Foto Menu Yang Ditambah */}
            <div className="relative w-16 h-16 rounded-2xl overflow-hidden shrink-0 border border-white/20 shadow-md">
              <Image
                src={lastAddedWindow.image}
                alt={lastAddedWindow.displayName}
                fill
                className="object-cover"
              />
            </div>

            {/* Info Menu */}
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-sm text-white uppercase tracking-wide truncate">
                {lastAddedWindow.displayName}
              </h4>
              <p className="text-xs text-[#E6007E] font-medium mt-0.5">
                Rp {lastAddedWindow.price.toLocaleString("id-ID")}
              </p>
              <p className="text-[10px] text-gray-300 mt-1">Item telah masuk keranjang</p>
            </div>
          </div>

          {/* Action Buttons: Tambah Lagi & Lihat Keranjang */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                updateCartQuantity(lastAddedWindow.cartId, 1);
              }}
              className="py-2.5 bg-[#17B8CF] hover:bg-[#1AA7C4] text-white rounded-xl text-xs uppercase font-bold tracking-wider transition-all flex items-center justify-center space-x-1 shadow-sm active:scale-95"
            >
              <Plus size={14} />
              <span>TAMBAH LAGI</span>
            </button>

            <button
              onClick={() => {
                setLastAddedWindow(null);
                setIsCheckoutModalOpen(true);
              }}
              className="py-2.5 bg-[#E6007E] hover:bg-[#D00070] text-white rounded-xl text-xs uppercase font-bold tracking-wider transition-all flex items-center justify-center space-x-1 shadow-sm active:scale-95"
            >
              <span>KERANJANG</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* MODAL 1: Spicy Level Option Modal */}
      {activeSpicyModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative overflow-hidden animate-fade-in border border-gray-100">
            <button
              onClick={() => setActiveSpicyModalItem(null)}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-gray-100"
            >
              <X size={20} />
            </button>

            <span className="text-xs uppercase tracking-widest font-medium bg-[#FFF4C2] text-[#0F2A33] px-3.5 py-1 rounded-full inline-block mb-3">
              Kustomisasi Pesanan
            </span>

            <h3 className="text-2xl font-medium text-[#0F2A33] uppercase tracking-wide mb-1">
              {activeSpicyModalItem.name}
            </h3>
            <p className="text-xs text-gray-500 mb-6">{activeSpicyModalItem.subtitle}</p>

            {/* Level selection */}
            <div className="mb-6">
              <label className="block text-xs uppercase tracking-widest font-bold text-[#0F2A33] mb-3 flex items-center space-x-1.5">
                <Flame size={16} className="text-[#E6007E]" />
                <span>Pilih Level Pedas (Level 1 s/d 8)</span>
              </label>

              <div className="grid grid-cols-3 gap-2.5">
                {[1, 2, 3, 4, 6, 8].map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => setSelectedSpicyLevel(lvl)}
                    className={`py-3 rounded-2xl font-bold text-xs uppercase transition-all flex items-center justify-center space-x-1 ${
                      selectedSpicyLevel === lvl
                        ? "bg-[#E6007E] text-white shadow-md scale-105"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    <Flame size={14} className={selectedSpicyLevel === lvl ? "text-yellow-300" : "text-gray-400"} />
                    <span>Level {lvl}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Special Notes input */}
            <div className="mb-6">
              <label className="block text-xs uppercase tracking-widest font-bold text-[#0F2A33] mb-2">
                Catatan Pesanan (Opsional)
              </label>
              <input
                type="text"
                value={spicyNotes}
                onChange={(e) => setSpicyNotes(e.target.value)}
                placeholder="Contoh: banyakin pangsit, tanpa bumbu gurih..."
                className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 text-xs text-[#0F2A33] focus:outline-none focus:border-[#17B8CF]"
              />
            </div>

            <button
              onClick={confirmSpicyAdd}
              className="w-full py-4 bg-[#E6007E] hover:bg-[#D00070] text-white rounded-2xl text-xs sm:text-sm uppercase tracking-wider font-bold shadow-lg transition-all active:scale-95 flex items-center justify-center space-x-2"
            >
              <span>TAMBAH KE PESANAN — {activeSpicyModalItem.formattedPrice}</span>
            </button>
          </div>
        </div>
      )}

      {/* MODAL 2: Tea Variety Options Modal */}
      {activeTeaModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative overflow-hidden animate-fade-in border border-gray-100">
            <button
              onClick={() => setActiveTeaModalItem(null)}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-gray-100"
            >
              <X size={20} />
            </button>

            <span className="text-xs uppercase tracking-widest font-medium bg-[#FFF4C2] text-[#0F2A33] px-3.5 py-1 rounded-full inline-block mb-3">
              Pilihan Suhu & Manis
            </span>

            <h3 className="text-2xl font-medium text-[#0F2A33] uppercase tracking-wide mb-1">
              {activeTeaModalItem.name}
            </h3>
            <p className="text-xs text-gray-500 mb-6">Pilih sajian teh dingin atau hangat sesuai seleramu.</p>

            {/* Suhu Options (Iced / Hot) */}
            <div className="mb-6">
              <label className="block text-xs uppercase tracking-widest font-bold text-[#0F2A33] mb-3">
                1. Pilih Suhu Penyajian
              </label>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setSelectedTeaOption("Iced")}
                  className={`p-4 rounded-2xl border-2 text-center transition-all flex flex-col items-center justify-center space-y-1 ${
                    selectedTeaOption === "Iced"
                      ? "border-[#17B8CF] bg-[#17B8CF]/10 text-[#17B8CF] font-bold shadow-sm"
                      : "border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}
                >
                  <ThermometerSnowflake size={24} className="text-[#17B8CF]" />
                  <span className="text-xs uppercase font-bold">ICED (ES SEGAR)</span>
                </button>

                <button
                  onClick={() => setSelectedTeaOption("Hot")}
                  className={`p-4 rounded-2xl border-2 text-center transition-all flex flex-col items-center justify-center space-y-1 ${
                    selectedTeaOption === "Hot"
                      ? "border-[#E6007E] bg-[#E6007E]/10 text-[#E6007E] font-bold shadow-sm"
                      : "border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}
                >
                  <Sun size={24} className="text-[#E6007E]" />
                  <span className="text-xs uppercase font-bold">HOT (HANGAT)</span>
                </button>
              </div>
            </div>

            {/* Sugar Options */}
            <div className="mb-6">
              <label className="block text-xs uppercase tracking-widest font-bold text-[#0F2A33] mb-3">
                2. Pilih Tingkat Manis (Sugar)
              </label>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setSelectedSugarOption("Normal")}
                  className={`py-3 rounded-2xl font-bold text-xs uppercase transition-all ${
                    selectedSugarOption === "Normal"
                      ? "bg-[#0F2A33] text-white shadow-sm"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Normal Sugar
                </button>

                <button
                  onClick={() => setSelectedSugarOption("Less")}
                  className={`py-3 rounded-2xl font-bold text-xs uppercase transition-all ${
                    selectedSugarOption === "Less"
                      ? "bg-[#0F2A33] text-white shadow-sm"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Less Sugar
                </button>
              </div>
            </div>

            <button
              onClick={confirmTeaAdd}
              className="w-full py-4 bg-[#17B8CF] hover:bg-[#1AA7C4] text-white rounded-2xl text-xs sm:text-sm uppercase tracking-wider font-bold shadow-lg transition-all active:scale-95 flex items-center justify-center space-x-2"
            >
              <span>TAMBAH TEH SEGAR — {activeTeaModalItem.formattedPrice}</span>
            </button>
          </div>
        </div>
      )}

      {/* Floating Sticky Cart Bar */}
      {totalCartCount > 0 && (
        <div className="fixed bottom-6 left-0 right-0 z-40 px-4">
          <div className="max-w-3xl mx-auto bg-[#0F2A33] text-white p-4 rounded-3xl shadow-2xl border border-white/20 backdrop-blur-xl flex items-center justify-between">
            <div className="flex items-center space-x-4 pl-2">
              <div className="w-12 h-12 rounded-2xl bg-[#E6007E] flex items-center justify-center text-white relative shadow-md">
                <ShoppingBag size={22} />
                <span className="absolute -top-1.5 -right-1.5 bg-[#FFF4C2] text-[#0F2A33] text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-[#0F2A33]">
                  {totalCartCount}
                </span>
              </div>
              <div>
                <span className="text-xs text-gray-300 uppercase tracking-widest block">Total Pesanan</span>
                <span className="text-xl font-bold text-[#FFF4C2]">
                  Rp {totalCartPrice.toLocaleString("id-ID")}
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsCheckoutModalOpen(true)}
              className="px-6 py-3 bg-[#E6007E] hover:bg-[#D00070] text-white rounded-2xl text-xs sm:text-sm uppercase tracking-wider font-bold shadow-lg flex items-center space-x-2 transition-all active:scale-95"
            >
              <span>LANJUTKAN PESANAN</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Checkout Order Confirmation Modal */}
      {isCheckoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative border border-gray-100 my-8">
            <button
              onClick={() => setIsCheckoutModalOpen(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-gray-100"
            >
              <X size={20} />
            </button>

            <span className="text-xs uppercase tracking-widest font-medium bg-[#FFF4C2] text-[#0F2A33] px-3.5 py-1 rounded-full inline-block mb-3">
              Rincian Pemesanan
            </span>

            <h3 className="text-2xl font-medium text-[#0F2A33] uppercase tracking-wide mb-4">
              KONFIRMASI PESANAN
            </h3>

            {/* Order Type Tabs */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <button
                type="button"
                onClick={() => setOrderType("online")}
                className={`p-3.5 rounded-2xl border-2 text-left transition-all ${
                  orderType === "online"
                    ? "border-[#17B8CF] bg-[#17B8CF]/10 text-[#0F2A33]"
                    : "border-gray-200 text-gray-500 hover:border-gray-300"
                }`}
              >
                <Bike size={22} className="text-[#17B8CF] mb-1" />
                <h4 className="font-bold text-xs uppercase">TAKE AWAY</h4>
                <p className="text-[11px] text-gray-500 mt-0.5">Pesan bawa pulang</p>
              </button>

              <button
                type="button"
                onClick={() => setOrderType("dinein")}
                className={`p-3.5 rounded-2xl border-2 text-left transition-all ${
                  orderType === "dinein"
                    ? "border-[#E6007E] bg-[#E6007E]/10 text-[#0F2A33]"
                    : "border-gray-200 text-gray-500 hover:border-gray-300"
                }`}
              >
                <QrCode size={22} className="text-[#E6007E] mb-1" />
                <h4 className="font-bold text-xs uppercase">DINE IN</h4>
                <p className="text-[11px] text-gray-500 mt-0.5">Makan di tempat</p>
              </button>
            </div>

            {/* Customer Information Inputs */}
            <div className="space-y-3 mb-4">
              <div>
                <label className="block text-xs font-bold text-[#0F2A33] uppercase tracking-wider mb-1">
                  Nama Pemesan
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Contoh: Budi Prasetyo"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#E6007E]"
                />
              </div>

              {orderType === "dinein" && (
                <div>
                  <label className="block text-xs font-bold text-[#0F2A33] uppercase tracking-wider mb-1">
                    Nomor Meja
                  </label>
                  <input
                    type="text"
                    value={tableNo}
                    onChange={(e) => setTableNo(e.target.value)}
                    placeholder="Contoh: Meja 12"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#E6007E]"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-[#0F2A33] uppercase tracking-wider mb-1">
                  Metode Pembayaran
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#E6007E] bg-white mb-2"
                >
                  <option value="QRIS">QRIS / E-Wallet</option>
                  <option value="Transfer">Transfer Bank</option>
                  <option value="Cash">Tunai di Kasir</option>
                </select>

                {/* Hint bukti */}
                {paymentMethod !== "Cash" && (
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 mt-2 flex items-center gap-2">
                    <QrCode size={14} className="text-[#17B8CF] shrink-0" />
                    <p className="text-[11px] text-slate-500">
                      Bukti transfer akan diminta di langkah berikutnya setelah klik Bayar.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Cart Itemized List */}
            <div className="bg-gray-50 rounded-2xl p-4 mb-6 max-h-48 overflow-y-auto space-y-3 border border-gray-100">
              {cart.map((item) => (
                <div key={item.cartId} className="flex items-center justify-between text-xs border-b border-gray-100 pb-2">
                  <div className="flex items-center space-x-3">
                    <div className="relative w-10 h-10 rounded-xl overflow-hidden shrink-0 border border-gray-200">
                      <Image src={item.image} alt={item.name} fill className="object-cover" />
                    </div>
                    <div>
                      <h5 className="font-bold text-[#0F2A33]">{item.name}</h5>
                      {item.notes && <p className="text-[10px] text-gray-400">Ket: {item.notes}</p>}
                      <span className="text-[10px] text-[#17B8CF] font-medium">Rp {item.price.toLocaleString("id-ID")} / item</span>
                    </div>
                  </div>

                  {/* Qty Counter */}
                  <div className="flex items-center space-x-2 bg-white px-2 py-1 rounded-xl border border-gray-200 shadow-sm">
                    <button
                      onClick={() => updateCartQuantity(item.cartId, -1)}
                      className="text-gray-500 hover:text-red-500"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="font-bold text-xs w-4 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateCartQuantity(item.cartId, 1)}
                      className="text-gray-500 hover:text-[#17B8CF]"
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                </div>
              ))}

              <div className="pt-2 flex justify-between font-bold text-sm text-[#E6007E]">
                <span>TOTAL BIAYA:</span>
                <span>Rp {totalCartPrice.toLocaleString("id-ID")}</span>
              </div>
            </div>

            <button
              disabled={isSubmitting || cart.length === 0}
              onClick={() => {
                if (paymentMethod === "Cash") {
                  handleConfirmOrder();
                } else {
                  setIsCheckoutModalOpen(false);
                  setIsProofModalOpen(true);
                }
              }}
              className="w-full py-4 bg-[#E6007E] hover:bg-[#D00070] disabled:bg-gray-400 text-white rounded-2xl text-xs sm:text-sm uppercase tracking-wider font-bold shadow-lg transition-all active:scale-95 flex items-center justify-center space-x-2"
            >
              {isSubmitting ? (
                <span>MEMPROSES PESANAN...</span>
              ) : (
                <span>KONFIRMASI & BAYAR SEKARANG</span>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Payment Proof Upload Modal */}
      {isProofModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl relative border border-gray-100 my-8">
            {/* Header */}
            <button
              onClick={() => {
                setIsProofModalOpen(false);
                setIsCheckoutModalOpen(true);
                setPaymentProof("");
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X size={18} />
            </button>

            <div className="text-center mb-5">
              <div className="w-14 h-14 rounded-2xl bg-[#17B8CF]/10 flex items-center justify-center mx-auto mb-3">
                <QrCode size={28} className="text-[#17B8CF]" />
              </div>
              <h3 className="text-lg font-bold text-[#0F2A33]">Kirim Bukti Pembayaran</h3>
              <p className="text-xs text-gray-500 mt-1">
                Upload foto bukti transfer / screenshot QRIS kamu sebelum pesanan dikonfirmasi kasir.
              </p>
            </div>

            {/* Payment summary */}
            <div className="bg-gray-50 rounded-2xl p-3 mb-4 border border-gray-100 flex justify-between items-center">
              <div>
                <p className="text-[11px] text-gray-400 uppercase tracking-wider">Total Tagihan</p>
                <p className="text-lg font-bold text-[#E6007E]">Rp {totalCartPrice.toLocaleString("id-ID")}</p>
              </div>
              <div className="text-right">
                <p className="text-[11px] text-gray-400 uppercase tracking-wider">Metode</p>
                <p className="text-sm font-bold text-[#0F2A33]">{paymentMethod}</p>
              </div>
            </div>

            {/* QRIS Code Display */}
            {paymentMethod === "QRIS" && (
              <div className="mb-4 rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
                <div className="relative w-full" style={{ aspectRatio: "400/480" }}>
                  <Image
                    src="/assets/qris-gacoan.svg"
                    alt="QRIS Mie Gacoan"
                    fill
                    className="object-contain"
                  />
                </div>
                <div className="bg-[#0F2A33] py-2 text-center">
                  <p className="text-[11px] text-[#17B8CF] font-semibold">Scan QRIS di atas, lalu upload bukti di bawah</p>
                </div>
              </div>
            )}

            {/* Transfer Bank Info */}
            {paymentMethod === "Transfer" && (
              <div className="mb-4 bg-blue-50 border border-blue-200 rounded-2xl p-4">
                <p className="text-xs font-bold text-blue-800 mb-2 uppercase tracking-wider">Info Rekening Transfer</p>
                <div className="space-y-1.5 text-xs text-blue-700">
                  <div className="flex justify-between">
                    <span className="text-blue-500">Bank</span>
                    <span className="font-bold">BCA / BNI / Mandiri</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-500">No. Rekening</span>
                    <span className="font-bold font-mono">1234-5678-9012</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-500">Atas Nama</span>
                    <span className="font-bold">Mie Gacoan Indonesia</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-500">Nominal</span>
                    <span className="font-bold text-[#E6007E]">Rp {totalCartPrice.toLocaleString("id-ID")}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Upload area */}
            <div
              onClick={() => proofInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all mb-4 ${
                paymentProof
                  ? "border-emerald-400 bg-emerald-50"
                  : "border-gray-300 bg-gray-50 hover:border-[#17B8CF] hover:bg-[#17B8CF]/5"
              }`}
            >
              <input
                type="file"
                ref={proofInputRef}
                className="hidden"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleProofUpload}
              />
              {uploadingProof ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="w-8 h-8 border-2 border-[#17B8CF] border-t-transparent rounded-full animate-spin" />
                  <p className="text-xs text-[#17B8CF] font-semibold">Mengunggah foto...</p>
                </div>
              ) : paymentProof ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="relative w-24 h-24 rounded-xl overflow-hidden border border-emerald-200 shadow-sm">
                    <Image src={paymentProof} alt="Bukti Transfer" fill className="object-cover" />
                  </div>
                  <p className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                    <Check size={13} /> Foto berhasil diunggah
                  </p>
                  <p className="text-[10px] text-gray-400">Klik untuk ganti foto</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 py-2">
                  <div className="w-12 h-12 rounded-xl bg-gray-200 flex items-center justify-center">
                    <ArrowRight size={20} className="text-gray-400 rotate-[-90deg]" />
                  </div>
                  <p className="text-sm font-semibold text-gray-700">Tap untuk pilih foto</p>
                  <p className="text-[11px] text-gray-400">JPEG, PNG, WebP • Maks. 5MB</p>
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex flex-col gap-2">
              <button
                disabled={isSubmitting || uploadingProof}
                onClick={handleConfirmOrder}
                className="w-full py-3.5 bg-[#E6007E] hover:bg-[#D00070] disabled:bg-gray-300 text-white rounded-2xl text-xs uppercase tracking-wider font-bold shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>MEMPROSES...</span>
                  </>
                ) : (
                  <span>{paymentProof ? "KIRIM PESANAN ✓" : "KIRIM TANPA BUKTI"}</span>
                )}
              </button>
              <button
                onClick={() => {
                  setIsProofModalOpen(false);
                  setIsCheckoutModalOpen(true);
                  setPaymentProof("");
                }}
                className="w-full py-2.5 text-gray-500 hover:text-gray-700 text-xs font-semibold transition-colors"
              >
                ← Kembali ke Detail Pesanan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Order Success Confirmation Modal */}
      {orderSuccessData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl text-center relative border border-gray-100 animate-scale-up">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check size={36} />
            </div>
            <h3 className="text-2xl font-bold text-[#0F2A33] mb-1">Pesanan Berhasil!</h3>
            <p className="text-xs text-gray-500 mb-4">
              Pesanan Anda telah masuk ke sistem Kasir & Dapur Gacoan.
            </p>

            <div className="bg-gray-50 rounded-2xl p-4 text-left text-xs mb-6 space-y-2 border border-gray-100">
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500">ID Pesanan:</span>
                <span className="font-bold text-[#E6007E]">{orderSuccessData.order_code}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500">Nama:</span>
                <span className="font-semibold">{orderSuccessData.customerName}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500">Tipe / Meja:</span>
                <span className="font-semibold">{orderSuccessData.orderType} {orderSuccessData.tableNo ? `(${orderSuccessData.tableNo})` : ""}</span>
              </div>
              <div className="flex justify-between pt-1">
                <span className="font-bold">Total Pembayaran:</span>
                <span className="font-bold text-[#E6007E]">Rp {orderSuccessData.total_price.toLocaleString("id-ID")}</span>
              </div>
            </div>

            <button
              onClick={() => setOrderSuccessData(null)}
              className="w-full py-3.5 bg-[#0F2A33] text-white font-bold rounded-xl text-xs uppercase tracking-wider hover:bg-[#17B8CF] transition-colors"
            >
              Selesai & Tutup
            </button>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
