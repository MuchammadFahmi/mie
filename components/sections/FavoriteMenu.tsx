"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Plus, Flame, ShoppingBag, Sparkles } from "lucide-react";

// Dummy favorite menu data with category filtering
const favoriteMenus = [
  {
    id: "1",
    name: "MIE GACOAN",
    categoryKey: "mie",
    category: "Mie Pedas Manis",
    description: "Mie olahan gurih manis pedas dengan taburan ayam cincang halus & pangsit renyah.",
    price: "Rp 10.500",
    badge: "Terlaris #1",
    badgeColor: "bg-[#E6007E]",
    spicyLevel: "Level 0 - 8",
    image: "/assets/miegacoan.webp",
  },
  {
    id: "2",
    name: "MIE HOMPIMPA",
    categoryKey: "mie",
    category: "Mie Pedas Asin",
    description: "Mie pedas asin gurih dengan bumbu rahasia gacoan, pangsit isi daging & taburan ayam.",
    price: "Rp 10.500",
    badge: "Favorit",
    badgeColor: "bg-[#17B8CF]",
    spicyLevel: "Level 0 - 8",
    image: "/assets/miehompimpa.png",
  },
  {
    id: "3",
    name: "UDANG RAMBUTAN",
    categoryKey: "dimsum",
    category: "Dimsum Crispy",
    description: "Olahan daging udang lembut dibalut olahan kulit renyah garing menyerupai rambut kelezatan.",
    price: "Rp 9.500",
    badge: "Wajib Coba",
    badgeColor: "bg-amber-500",
    spicyLevel: "Gurih Crispy",
    image: "/assets/udangrambutan.jpg",
  },
  {
    id: "4",
    name: "ES GENDERUWO",
    categoryKey: "minuman",
    category: "Minuman Segar",
    description: "Kombinasi sempurna es buah-buahan manis segar, cincau lembut, dan jeli penyegar kepedasanmu.",
    price: "Rp 8.500",
    badge: "Penyegar #1",
    badgeColor: "bg-teal-500",
    spicyLevel: "Dingin Segar",
    image: "/assets/esgenderuwo.jpg",
  },
];

const categories = [
  { key: "all", label: "SEMUA MENU" },
  { key: "mie", label: "MIE PEDAS" },
  { key: "dimsum", label: "DIMSUM" },
  { key: "minuman", label: "MINUMAN" },
];

export default function FavoriteMenu() {
  const [selectedCategory, setSelectedCategory] = useState("all");

  const filteredMenus =
    selectedCategory === "all"
      ? favoriteMenus
      : favoriteMenus.filter((item) => item.categoryKey === selectedCategory);

  return (
    <section className="py-24 bg-[#17B8CF]/5 relative overflow-hidden">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
          <div>
            <span className="text-[#E6007E] text-xs uppercase tracking-widest font-medium bg-[#FFF4C2] px-4 py-1.5 rounded-full inline-flex items-center space-x-2 mb-3 border border-[#E6007E]/20 shadow-sm">
              <Sparkles size={14} className="text-[#E6007E]" />
              <span>Paling Banyak Dipesan</span>
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-medium text-[#0F2A33] uppercase tracking-wide">
              MENU FAVORIT GACOAN
            </h2>
            <p className="mt-2 text-gray-600 text-sm sm:text-base">
              Hidangan terlaris dengan cita rasa terbaik yang selalu dirindukan!
            </p>
          </div>

          <Link
            href="/menu"
            className="mt-6 md:mt-0 inline-flex items-center space-x-2 text-[#E6007E] font-medium uppercase tracking-wider text-sm hover:text-[#D00070] transition-colors group"
          >
            <span>LIHAT KATALOG LENGKAP</span>
            <span className="transform group-hover:translate-x-1 transition-transform">→</span>
          </Link>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-12">
          {categories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setSelectedCategory(cat.key)}
              className={`px-5 py-2.5 rounded-full text-xs sm:text-sm uppercase tracking-wider font-medium transition-all duration-300 ${
                selectedCategory === cat.key
                  ? "bg-[#17B8CF] text-white shadow-md shadow-[#17B8CF]/30 scale-105"
                  : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* 4 Cards Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {filteredMenus.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-md hover:shadow-2xl hover:border-[#17B8CF]/40 transition-all duration-500 transform hover:-translate-y-2 flex flex-col justify-between group"
            >
              <div>
                {/* Image Container */}
                <div className="relative w-full h-56 overflow-hidden bg-gray-100">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover object-center group-hover:scale-110 transition-transform duration-700"
                  />

                  {/* Gradient Overlay for Image Text */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

                  {/* Top Badge */}
                  <div
                    className={`absolute top-3 left-3 ${item.badgeColor} text-white text-xs px-3 py-1 rounded-full uppercase tracking-wider font-medium shadow-md`}
                  >
                    {item.badge}
                  </div>

                  {/* Spicy Tag */}
                  <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-md text-[#FFF4C2] text-xs px-3 py-1 rounded-full flex items-center space-x-1.5 shadow-sm border border-white/10">
                    <Flame size={13} className="text-red-400 animate-pulse" />
                    <span>{item.spicyLevel}</span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <span className="text-xs text-[#17B8CF] uppercase tracking-widest font-medium">
                    {item.category}
                  </span>
                  <h3 className="text-xl font-medium text-[#0F2A33] uppercase tracking-wide mt-1 mb-2 group-hover:text-[#17B8CF] transition-colors">
                    {item.name}
                  </h3>
                  <p className="text-gray-500 text-xs sm:text-sm line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>

              {/* Bottom Price & Add Button */}
              <div className="px-6 pb-6 pt-3 flex items-center justify-between border-t border-gray-100 bg-gray-50/50">
                <div>
                  <span className="text-[10px] text-gray-400 uppercase tracking-widest block font-medium">Harga Saja</span>
                  <span className="text-lg font-medium text-[#E6007E]">
                    {item.price}
                  </span>
                </div>

                <Link
                  href="/menu"
                  className="px-4 py-2.5 bg-[#17B8CF] hover:bg-[#1AA7C4] text-white rounded-full text-xs uppercase tracking-wider font-medium shadow-sm transition-all flex items-center space-x-1.5 active:scale-90 hover:shadow-md"
                >
                  <Plus size={16} />
                  <span>TAMBAH</span>
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* View All Button */}
        <div className="mt-14 text-center">
          <Link
            href="/menu"
            className="inline-flex items-center space-x-3 px-9 py-4 bg-[#17B8CF] hover:bg-[#1AA7C4] text-white rounded-full text-base uppercase tracking-wider font-medium shadow-xl hover:shadow-2xl shadow-[#17B8CF]/30 transition-all transform hover:-translate-y-1 active:scale-95"
          >
            <ShoppingBag size={20} />
            <span>JELAJAHI KATALOG LENGKAP MENU</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
