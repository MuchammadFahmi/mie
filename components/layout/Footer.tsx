"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { MapPin, Phone, Mail, Send, CheckCircle2 } from "lucide-react";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail("");
      setTimeout(() => setSubscribed(false), 4000);
    }
  };

  return (
    <footer className="bg-[#0F2A33] text-white pt-20 pb-8 border-t border-white/10 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Newsletter Subscription Card */}
        <div className="bg-gradient-to-r from-[#17B8CF]/20 via-white/5 to-[#E6007E]/20 border border-white/15 rounded-3xl p-8 sm:p-10 mb-16 flex flex-col lg:flex-row items-center justify-between gap-6 backdrop-blur-md">
          <div className="space-y-2 text-center lg:text-left">
            <span className="text-xs uppercase tracking-widest text-[#FFF4C2] font-medium bg-white/10 px-3 py-1 rounded-full inline-block">
              Promo Eksklusif
            </span>
            <h3 className="text-2xl sm:text-3xl font-medium uppercase tracking-wide">
              Dapatkan Voucher Gacoan Gratis!
            </h3>
            <p className="text-gray-300 text-sm max-w-xl">
              Daftarkan email kamu untuk mendapatkan info promo khusus mahasiswa, rilis menu baru, dan voucher diskon bulanan.
            </p>
          </div>

          <form onSubmit={handleSubscribe} className="w-full lg:w-auto flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Masukkan email kamu..."
              required
              className="px-5 py-3.5 bg-white/10 border border-white/20 rounded-full text-white placeholder-gray-400 text-sm focus:outline-none focus:border-[#17B8CF] min-w-[280px]"
            />
            <button
              type="submit"
              className="px-7 py-3.5 bg-[#E6007E] hover:bg-[#D00070] text-white rounded-full text-sm uppercase tracking-wider font-medium shadow-lg transition-all flex items-center justify-center space-x-2 shrink-0 active:scale-95"
            >
              {subscribed ? (
                <>
                  <CheckCircle2 size={16} />
                  <span>TERDAFTAR!</span>
                </>
              ) : (
                <>
                  <Send size={16} />
                  <span>BERLANGGANAN</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Main Footer Links */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-white/10">
          {/* Column 1: Brand & Logo */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center space-x-3">
              <div className="relative w-12 h-12">
                <Image
                  src="/assets/logogacoan.png"
                  alt="Mie Gacoan Logo"
                  fill
                  className="object-contain"
                />
              </div>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Jaringan restoran mie pedas No. 1 di Indonesia. Tempat nongkrong asyik anak muda dengan sajian nikmat, halal & terjangkau.
            </p>
            <div className="pt-2">
              <span className="text-xs text-[#FFF4C2] font-medium tracking-widest uppercase bg-black/30 px-3 py-1.5 rounded-full border border-white/10">
                "MIE DULU BARU SKRIPSI"
              </span>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 className="text-base font-medium uppercase tracking-wider text-white mb-4 border-b border-[#17B8CF] pb-2 inline-block">
              NAVIGASI
            </h4>
            <ul className="space-y-2.5 text-sm text-gray-300">
              <li>
                <Link href="/" className="hover:text-[#17B8CF] transition-colors">
                  HOME
                </Link>
              </li>
              <li>
                <Link href="/menu" className="hover:text-[#17B8CF] transition-colors">
                  MENU
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[#17B8CF] transition-colors">
                  CONTACT
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Contact Info */}
          <div>
            <h4 className="text-base font-medium uppercase tracking-wider text-white mb-4 border-b border-[#17B8CF] pb-2 inline-block">
              KONTAK & ALAMAT
            </h4>
            <ul className="space-y-3 text-sm text-gray-300">
              <li className="flex items-start space-x-3">
                <MapPin size={18} className="text-[#17B8CF] shrink-0 mt-0.5" />
                <span>Jl. Cendrawasih No. 88, Kota Malang, Jawa Timur</span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone size={18} className="text-[#17B8CF] shrink-0" />
                <span>+62 812-3456-7890</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail size={18} className="text-[#17B8CF] shrink-0" />
                <span>halo@miegacoan.co.id</span>
              </li>
            </ul>
          </div>

          {/* Column 4: Social Media */}
          <div>
            <h4 className="text-base font-medium uppercase tracking-wider text-white mb-4 border-b border-[#17B8CF] pb-2 inline-block">
              IKUTI KAMI
            </h4>
            <p className="text-gray-400 text-sm mb-4">
              Dapatkan promo menarik & info terbaru di media sosial kami:
            </p>
            <div className="flex space-x-3">
              {/* Instagram Icon SVG */}
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-[#E6007E] flex items-center justify-center text-white transition-all transform hover:scale-110"
                aria-label="Instagram"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>

              {/* TikTok Icon SVG */}
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-[#17B8CF] flex items-center justify-center text-white transition-all transform hover:scale-110"
                aria-label="TikTok"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.82.56-1.36 1.49-1.41 2.49-.06.94.33 1.9 1.03 2.53.74.67 1.79.94 2.76.77 1.05-.16 1.97-.88 2.37-1.85.29-.69.36-1.46.35-2.21.02-4.57.01-9.14.01-13.71z"/>
                </svg>
              </a>

              {/* Facebook Icon SVG */}
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-[#17B8CF] flex items-center justify-center text-white transition-all transform hover:scale-110"
                aria-label="Facebook"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 text-center text-xs text-gray-400 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} Mie Gacoan. All rights reserved.</p>
          <div className="flex space-x-6">
            <span className="hover:text-gray-300 cursor-pointer">Kebijakan Privasi</span>
            <span className="hover:text-gray-300 cursor-pointer">Syarat & Ketentuan</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
