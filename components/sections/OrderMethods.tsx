"use client";

import Link from "next/link";
import { Bike, QrCode, ArrowRight, CheckCircle2, Smartphone, UtensilsCrossed, ShieldCheck } from "lucide-react";

export default function OrderMethods() {
  return (
    <section id="cara-pemesanan" className="py-24 bg-gradient-to-b from-white via-[#17B8CF]/5 to-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="text-[#E6007E] text-xs uppercase tracking-widest font-medium bg-[#FFF4C2] px-4 py-1.5 rounded-full inline-flex items-center space-x-2 mb-3 shadow-sm border border-[#E6007E]/20">
            <ShieldCheck size={14} className="text-[#E6007E]" />
            <span>Fleksibel & Tanpa Ribet</span>
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-medium text-[#0F2A33] uppercase tracking-wide">
            DUA CARA PEMESANAN
          </h2>
          <p className="mt-3 text-gray-600 max-w-2xl mx-auto text-base sm:text-lg">
            Pilih metode pesan yang paling nyaman untukmu, mau pesan lewat smartphone untuk diantar atau langsung dine-in di outlet.
          </p>
        </div>

        {/* 2 Big Cards Grid */}
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {/* Card 1: Take Away */}
          <div className="bg-gradient-to-br from-[#17B8CF]/10 to-[#17B8CF]/5 border-2 border-[#17B8CF]/30 rounded-3xl p-8 sm:p-10 flex flex-col justify-between hover:border-[#17B8CF] hover:shadow-2xl hover:shadow-[#17B8CF]/20 transition-all duration-500 group relative overflow-hidden">
            {/* Corner Decorative Badge */}
            <div className="absolute top-0 right-0 bg-[#17B8CF] text-white text-xs font-medium uppercase px-4 py-1.5 rounded-bl-2xl shadow-sm">
              Bawa Pulang
            </div>

            <div>
              <div className="w-16 h-16 bg-[#17B8CF] text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-[#17B8CF]/30 transform group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                <Bike size={32} />
              </div>

              <h3 className="text-2xl sm:text-3xl font-medium text-[#0F2A33] uppercase tracking-wide mb-3 flex items-center space-x-2">
                <span>TAKE AWAY</span>
                <span className="text-xs bg-[#E6007E] text-white px-2.5 py-0.5 rounded-full font-normal">Bawa Pulang</span>
              </h3>

              <p className="text-gray-600 mb-8 leading-relaxed text-sm sm:text-base">
                Pesan dari smartphone untuk dibawa pulang! Bebas pilih menu favorit, bayar digital, dan makanan siap diambil atau diantar.
              </p>

              {/* Step Checklist with step numbers */}
              <div className="space-y-4 mb-8">
                <div className="flex items-start space-x-3.5 bg-white/70 p-3.5 rounded-2xl border border-white/80 shadow-sm">
                  <span className="w-6 h-6 rounded-full bg-[#17B8CF] text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    1
                  </span>
                  <div>
                    <h4 className="text-sm font-medium text-[#0F2A33]">Pilih Menu & Level Pedas</h4>
                    <p className="text-xs text-gray-500">Sesuaikan tingkat kepedasan sesuai selera.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3.5 bg-white/70 p-3.5 rounded-2xl border border-white/80 shadow-sm">
                  <span className="w-6 h-6 rounded-full bg-[#17B8CF] text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    2
                  </span>
                  <div>
                    <h4 className="text-sm font-medium text-[#0F2A33]">Bayar Digital via QRIS / E-Wallet</h4>
                    <p className="text-xs text-gray-500">Transaksi cepat & praktis tanpa antre tunai.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3.5 bg-white/70 p-3.5 rounded-2xl border border-white/80 shadow-sm">
                  <span className="w-6 h-6 rounded-full bg-[#17B8CF] text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    3
                  </span>
                  <div>
                    <h4 className="text-sm font-medium text-[#0F2A33]">Ambil / Delivery Bawa Pulang</h4>
                    <p className="text-xs text-gray-500">Pesanan dikemas rapi & siap dinikmati di mana saja.</p>
                  </div>
                </div>
              </div>
            </div>

            <Link
              href="/menu"
              className="w-full py-4 bg-[#E6007E] hover:bg-[#D00070] text-white rounded-2xl text-center uppercase tracking-wider font-medium shadow-lg hover:shadow-pink-500/30 transition-all flex items-center justify-center space-x-2 group-hover:translate-x-1"
            >
              <span>PESAN TAKE AWAY SEKARANG</span>
              <ArrowRight size={18} />
            </Link>
          </div>

          {/* Card 2: Dine In */}
          <div className="bg-gradient-to-br from-[#FFF4C2]/60 to-[#FFF4C2]/20 border-2 border-[#FFF4C2] rounded-3xl p-8 sm:p-10 flex flex-col justify-between hover:border-[#E6007E]/50 hover:shadow-2xl hover:shadow-orange-500/10 transition-all duration-500 group relative overflow-hidden">
            {/* Corner Decorative Badge */}
            <div className="absolute top-0 right-0 bg-[#0F2A33] text-white text-xs font-medium uppercase px-4 py-1.5 rounded-bl-2xl shadow-sm">
              Makan di Tempat
            </div>

            <div>
              <div className="w-16 h-16 bg-[#E6007E] text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-[#E6007E]/30 transform group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300">
                <QrCode size={32} />
              </div>

              <h3 className="text-2xl sm:text-3xl font-medium text-[#0F2A33] uppercase tracking-wide mb-3 flex items-center space-x-2">
                <span>DINE IN</span>
                <span className="text-xs bg-[#0F2A33] text-white px-2.5 py-0.5 rounded-full font-normal">Makan di Tempat</span>
              </h3>

              <p className="text-gray-600 mb-8 leading-relaxed text-sm sm:text-base">
                Sensasi nongkrong seru bareng teman di outlet. Bebas pilih tempat duduk dan scan QR meja atau pesan di kasir.
              </p>

              {/* Step Checklist with step numbers */}
              <div className="space-y-4 mb-8">
                <div className="flex items-start space-x-3.5 bg-white/70 p-3.5 rounded-2xl border border-white/80 shadow-sm">
                  <span className="w-6 h-6 rounded-full bg-[#E6007E] text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    1
                  </span>
                  <div>
                    <h4 className="text-sm font-medium text-[#0F2A33]">Duduk di Meja Favoritmu</h4>
                    <p className="text-xs text-gray-500">Pilih spot paling nyaman di outlet.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3.5 bg-white/70 p-3.5 rounded-2xl border border-white/80 shadow-sm">
                  <span className="w-6 h-6 rounded-full bg-[#E6007E] text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    2
                  </span>
                  <div>
                    <h4 className="text-sm font-medium text-[#0F2A33]">Scan QR Meja / Pesan di Kasir</h4>
                    <p className="text-xs text-gray-500">Pesan dari HP atau konter kasir terdekat.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3.5 bg-white/70 p-3.5 rounded-2xl border border-white/80 shadow-sm">
                  <span className="w-6 h-6 rounded-full bg-[#E6007E] text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    3
                  </span>
                  <div>
                    <h4 className="text-sm font-medium text-[#0F2A33]">Nikmati Makanan Hangat</h4>
                    <p className="text-xs text-gray-500">Pesanan diantar langsung ke mejamu.</p>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => alert("Fitur Scan QR Meja Dine In akan aktif secara otomatis saat kamu berada di outlet!")}
              className="w-full py-4 bg-[#0F2A33] hover:bg-[#1a4452] text-white rounded-2xl text-center uppercase tracking-wider font-medium shadow-lg transition-all flex items-center justify-center space-x-2 active:scale-95"
            >
              <QrCode size={18} />
              <span>SCAN QR MEJA DINE IN</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
