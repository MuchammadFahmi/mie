"use client";

import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  MessageSquare,
  ChevronDown,
  CheckCircle2,
  Search,
  Sparkles,
  Building2,
  HelpCircle,
} from "lucide-react";

const contactCards = [
  {
    icon: MapPin,
    title: "KANTOR PUSAT",
    desc: "Jl. Cendrawasih No. 88, Lowokwaru, Kota Malang, Jawa Timur 65141",
    sub: "Operational Headquarter",
    color: "bg-[#17B8CF]",
  },
  {
    icon: Phone,
    title: "CUSTOMER SERVICE & WA",
    desc: "+62 812-3456-7890",
    sub: "Senin - Minggu (08.00 - 22.00 WIB)",
    color: "bg-[#E6007E]",
  },
  {
    icon: Mail,
    title: "EMAIL KEMITRAAN & CARE",
    desc: "halo@miegacoan.co.id",
    sub: "Respon cepat 1x24 Jam Kerja",
    color: "bg-[#17B8CF]",
  },
  {
    icon: Clock,
    title: "JAM OPERASIONAL OUTLET",
    desc: "10.00 - 23.00 WIB",
    sub: "Buka Setiap Hari (Termasuk Libur)",
    color: "bg-[#E6007E]",
  },
];

const faqItems = [
  {
    q: "Apakah seluruh outlet Mie Gacoan sudah tersertifikasi Halal?",
    a: "Ya! Mie Gacoan telah mengantongi Sertifikat Halal MUI secara komprehensif untuk seluruh bahan baku, saus, mi, dimsum, hingga fasilitas dapu dan penyajiannya.",
  },
  {
    q: "Bagaimana cara melakukan pemesanan Dine-In lewat QR Meja?",
    a: "Datang ke outlet Mie Gacoan terdekat, pilih tempat duduk yang tersedia, pindaikan kode QR yang tertera di sudut mejamu menggunakan kamera smartphone, lalu pilih menu dan selesaikan pembayaran secara digital!",
  },
  {
    q: "Apakah Mie Gacoan membuka peluang Kemitraan / Franchise?",
    a: "Untuk saat ini seluruh cabang Mie Gacoan dikelola secara penuh oleh manajemen pusat untuk menjamin standar kualitas & rasa. Hati-hati terhadap penipuan penawaran franchise ilegal.",
  },
  {
    q: "Berapa lama estimasi pengantaran untuk Pesanan Online?",
    a: "Proses penyiapan di dapur membutuhkan waktu sekitar 10-15 menit, ditambah durasi pengantaran oleh kurir tergantung jarak lokasi pengantaranmu.",
  },
];

const sampleOutlets = [
  { city: "Malang", name: "Mie Gacoan Cendrawasih", address: "Jl. Cendrawasih No. 88" },
  { city: "Surabaya", name: "Mie Gacoan Gubeng", address: "Jl. Raya Gubeng No. 45" },
  { city: "Jakarta", name: "Mie Gacoan Tebet", address: "Jl. Tebet Raya No. 12" },
  { city: "Bandung", name: "Mie Gacoan Dago", address: "Jl. Ir. H. Juanda No. 90" },
  { city: "Yogyakarta", name: "Mie Gacoan Gejayan", address: "Jl. Gejayan No. 22" },
];

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "saran",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(0);
  const [outletSearch, setOutletSearch] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: "", email: "", phone: "", subject: "saran", message: "" });
    }, 4000);
  };

  const filteredOutlets = sampleOutlets.filter(
    (o) =>
      o.city.toLowerCase().includes(outletSearch.toLowerCase()) ||
      o.name.toLowerCase().includes(outletSearch.toLowerCase()) ||
      o.address.toLowerCase().includes(outletSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col justify-between bg-white text-[#0F2A33]">
      <Navbar />

      <main className="flex-1 pt-24 pb-20">
        {/* Top Header Banner */}
        <section className="bg-gradient-to-r from-[#17B8CF] via-[#1AA7C4] to-[#17B8CF] text-white py-14 px-4 relative overflow-hidden">
          <div className="max-w-7xl mx-auto text-center relative z-10">
            <span className="text-[#FFF4C2] text-xs uppercase tracking-widest font-medium bg-white/20 px-4 py-1.5 rounded-full inline-block mb-3 border border-white/20">
              Layanan Pelanggan
            </span>
            <h1 className="text-3xl sm:text-5xl font-medium uppercase tracking-wide">
              HUBUNGI KAMI
            </h1>
            <p className="mt-2 text-white/90 text-sm sm:text-base max-w-xl mx-auto">
              Ada pertanyaan, masukan, atau kritik saran? Tim Customer Care kami siap membantumu dengan senang hati!
            </p>
          </div>
        </section>

        {/* 4 Contact Cards */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactCards.map((card, index) => {
              const IconComponent = card.icon;
              return (
                <div
                  key={index}
                  className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100 text-center flex flex-col items-center justify-between hover:border-[#17B8CF] transition-all transform hover:-translate-y-1"
                >
                  <div>
                    <div
                      className={`w-14 h-14 ${card.color} text-white rounded-2xl flex items-center justify-center mb-4 shadow-md`}
                    >
                      <IconComponent size={26} />
                    </div>
                    <h3 className="text-sm font-medium uppercase tracking-wider text-[#0F2A33] mb-2">
                      {card.title}
                    </h3>
                    <p className="text-gray-700 font-medium text-sm mb-1">{card.desc}</p>
                    <p className="text-gray-400 text-xs">{card.sub}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Form & Outlet Finder Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20">
          <div className="grid lg:grid-cols-12 gap-12">
            {/* Left: Contact Form */}
            <div className="lg:col-span-7 bg-gray-50/70 border border-gray-100 rounded-3xl p-8 sm:p-10 shadow-sm">
              <span className="text-[#E6007E] text-xs uppercase tracking-widest font-medium bg-[#FFF4C2] px-3.5 py-1.5 rounded-full inline-block mb-3 border border-[#E6007E]/20">
                Formulir Pesan
              </span>
              <h2 className="text-2xl sm:text-3xl font-medium uppercase tracking-wide text-[#0F2A33] mb-6">
                KIRIM PESAN & KRITIK SARAN
              </h2>

              {submitted ? (
                <div className="bg-[#17B8CF]/10 border border-[#17B8CF] rounded-2xl p-8 text-center animate-fade-in">
                  <CheckCircle2 size={48} className="text-[#17B8CF] mx-auto mb-3 animate-bounce" />
                  <h3 className="text-xl font-medium uppercase text-[#0F2A33]">Pesan Terkirim!</h3>
                  <p className="text-gray-600 text-sm mt-2">
                    Terima kasih atas pesan dan masukan yang kamu berikan. Tim Customer Care kami akan segera merespon via email.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs uppercase tracking-widest font-medium text-gray-700 mb-2">
                        Nama Lengkap *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Contoh: Budi Santoso"
                        className="w-full px-4 py-3 rounded-2xl bg-white border border-gray-200 text-sm focus:outline-none focus:border-[#17B8CF]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs uppercase tracking-widest font-medium text-gray-700 mb-2">
                        Email Aktif *
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="nama@email.com"
                        className="w-full px-4 py-3 rounded-2xl bg-white border border-gray-200 text-sm focus:outline-none focus:border-[#17B8CF]"
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs uppercase tracking-widest font-medium text-gray-700 mb-2">
                        Nomor HP / WhatsApp
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="081234567890"
                        className="w-full px-4 py-3 rounded-2xl bg-white border border-gray-200 text-sm focus:outline-none focus:border-[#17B8CF]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs uppercase tracking-widest font-medium text-gray-700 mb-2">
                        Kategori Pesan
                      </label>
                      <select
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        className="w-full px-4 py-3 rounded-2xl bg-white border border-gray-200 text-sm focus:outline-none focus:border-[#17B8CF]"
                      >
                        <option value="saran">Kritik & Saran</option>
                        <option value="pelayanan">Keluhan Pelayanan Outlet</option>
                        <option value="kemitraan">Informasi Umum</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-widest font-medium text-gray-700 mb-2">
                      Pesan Kamu *
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Tuliskan pengalaman atau pertanyaanmu secara detail di sini..."
                      className="w-full px-4 py-3 rounded-2xl bg-white border border-gray-200 text-sm focus:outline-none focus:border-[#17B8CF]"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-4 bg-[#E6007E] hover:bg-[#D00070] text-white rounded-2xl text-sm uppercase tracking-wider font-medium shadow-lg transition-all flex items-center justify-center space-x-2 active:scale-95"
                  >
                    <Send size={16} />
                    <span>KIRIM PESAN SEKARANG</span>
                  </button>
                </form>
              )}
            </div>

            {/* Right: Outlet Finder & Map Visual */}
            <div className="lg:col-span-5 space-y-8">
              {/* Outlet Finder */}
              <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-md">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 rounded-2xl bg-[#17B8CF]/10 text-[#17B8CF] flex items-center justify-center">
                    <Building2 size={20} />
                  </div>
                  <h3 className="text-xl font-medium uppercase tracking-wide text-[#0F2A33]">
                    CARI OUTLET TERDEKAT
                  </h3>
                </div>

                <div className="relative mb-4">
                  <input
                    type="text"
                    value={outletSearch}
                    onChange={(e) => setOutletSearch(e.target.value)}
                    placeholder="Ketik kota (Malang, Surabaya, Jakarta...)"
                    className="w-full pl-10 pr-4 py-2.5 rounded-full bg-gray-100 text-sm text-[#0F2A33] focus:outline-none focus:ring-2 focus:ring-[#17B8CF]"
                  />
                  <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>

                <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                  {filteredOutlets.length === 0 ? (
                    <p className="text-xs text-gray-400 text-center py-4">Outlet tidak ditemukan</p>
                  ) : (
                    filteredOutlets.map((outlet, i) => (
                      <div
                        key={i}
                        className="p-3 bg-gray-50 rounded-2xl border border-gray-100 flex items-start space-x-3 hover:border-[#17B8CF] transition-colors"
                      >
                        <MapPin size={16} className="text-[#E6007E] shrink-0 mt-1" />
                        <div>
                          <h4 className="text-xs font-bold text-[#0F2A33] uppercase">{outlet.name}</h4>
                          <p className="text-[11px] text-gray-500">{outlet.address}, {outlet.city}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Map Illustration Visual Card */}
              <div className="relative h-60 rounded-3xl overflow-hidden shadow-lg border border-gray-200 bg-slate-900 flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-br from-[#17B8CF]/30 to-[#0F2A33] backdrop-blur-md flex flex-col items-center justify-center text-white text-center p-6">
                  <MapPin size={40} className="text-[#E6007E] animate-bounce mb-2" />
                  <h4 className="font-medium text-lg uppercase tracking-wide">PETA LOKASI OUTLET</h4>
                  <p className="text-xs text-gray-300 mt-1">100+ Outlet tersebar di seluruh Indonesia</p>
                  <span className="mt-4 px-4 py-2 bg-white/20 border border-white/30 rounded-full text-xs font-medium uppercase tracking-wider">
                    Buka Google Maps
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Accordion Section */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-24">
          <div className="text-center mb-12">
            <span className="text-[#17B8CF] text-xs uppercase tracking-widest font-medium bg-[#17B8CF]/10 px-4 py-1.5 rounded-full inline-flex items-center space-x-2 mb-3 border border-[#17B8CF]/20">
              <HelpCircle size={14} className="text-[#17B8CF]" />
              <span>Pertanyaan Umum</span>
            </span>
            <h2 className="text-3xl font-medium uppercase tracking-wide text-[#0F2A33]">
              FREQUENTLY ASKED QUESTIONS (FAQ)
            </h2>
          </div>

          <div className="space-y-4">
            {faqItems.map((item, index) => {
              const isOpen = activeFaq === index;
              return (
                <div
                  key={index}
                  className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm transition-all"
                >
                  <button
                    onClick={() => setActiveFaq(isOpen ? null : index)}
                    className="w-full p-5 text-left flex items-center justify-between font-medium text-sm sm:text-base uppercase tracking-wider text-[#0F2A33] hover:text-[#17B8CF] transition-colors"
                  >
                    <span>{item.q}</span>
                    <ChevronDown
                      size={18}
                      className={`shrink-0 transition-transform duration-300 ${
                        isOpen ? "transform rotate-180 text-[#E6007E]" : "text-gray-400"
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-gray-600 text-sm leading-relaxed border-t border-gray-100 bg-gray-50/50">
                      {item.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
