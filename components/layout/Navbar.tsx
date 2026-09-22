"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, User, ShoppingBag, Flame, Sparkles } from "lucide-react";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 30) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "HOME", href: "/" },
    { name: "MENU", href: "/menu" },
    { name: "CONTACT", href: "/contact" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-[#17B8CF]/95 backdrop-blur-xl shadow-xl py-3 border-b border-white/20"
          : "bg-[#17B8CF]/80 backdrop-blur-md py-4"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo (Only Image as requested) */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="relative w-12 h-12 sm:w-14 sm:h-14 transition-transform duration-300 group-hover:scale-110 drop-shadow-md">
              <Image
                src="/assets/logogacoan.png"
                alt="Mie Gacoan Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-8 bg-black/10 px-6 py-2 rounded-full backdrop-blur-md border border-white/15 shadow-inner">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`text-white text-sm sm:text-base tracking-widest uppercase transition-all duration-300 relative py-1 hover:text-[#FFF4C2] font-medium ${
                    isActive ? "text-[#FFF4C2]" : "opacity-90 hover:opacity-100"
                  }`}
                >
                  {link.name}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 w-full h-[3px] bg-[#E6007E] rounded-full shadow-lg shadow-[#E6007E]/50 animate-pulse" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden md:flex items-center space-x-3 sm:space-x-4">
            {/* Promo Tag Info (Text badge style, not a button) */}
            <div className="hidden lg:flex items-center space-x-1.5 text-white/95 text-xs font-medium tracking-wide border-r border-white/20 pr-4">
              <Sparkles size={14} className="text-[#FFF4C2]" />
              <span>Promo Mahasiswa Aktif</span>
            </div>

            {/* Staff Login */}
            <Link
              href="/login"
              className="px-5 py-2 border-2 border-white/80 hover:border-white text-white rounded-full text-xs sm:text-sm uppercase tracking-wider font-medium hover:bg-white/15 transition-all flex items-center space-x-2 active:scale-95 shadow-sm"
            >
              <User size={15} />
              <span>MASUK</span>
            </Link>

            {/* Pesan Sekarang (Pink Solid with Glow) */}
            <Link
              href="/menu"
              className="px-6 py-2.5 bg-[#E6007E] hover:bg-[#D00070] text-white rounded-full text-xs sm:text-sm uppercase tracking-wider font-medium shadow-lg hover:shadow-pink-500/30 transition-all transform hover:-translate-y-0.5 active:scale-95 flex items-center space-x-2 relative group overflow-hidden"
            >
              <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              <ShoppingBag size={16} />
              <span>PESAN SEKARANG</span>
            </Link>
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-white p-2 rounded-xl bg-black/10 hover:bg-black/20 focus:outline-none border border-white/20 transition-all"
              aria-label="Toggle Navigation"
            >
              {isMobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Slide-in */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300 ${
          isMobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsMobileMenuOpen(false)}
      />

      <div
        className={`fixed top-0 right-0 h-full w-4/5 max-w-sm bg-[#17B8CF] z-50 p-6 flex flex-col justify-between shadow-2xl transition-transform duration-300 ease-in-out md:hidden border-l border-white/20 ${
          isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div>
          {/* Drawer Header */}
          <div className="flex items-center justify-between pb-6 border-b border-white/20">
            <div className="flex items-center space-x-3">
              <div className="relative w-10 h-10">
                <Image
                  src="/assets/logogacoan.png"
                  alt="Mie Gacoan Logo"
                  fill
                  className="object-contain"
                />
              </div>
            </div>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-white p-1.5 rounded-full hover:bg-white/10"
            >
              <X size={24} />
            </button>
          </div>

          {/* Drawer Links */}
          <nav className="mt-8 flex flex-col space-y-6">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`text-xl tracking-widest uppercase transition-colors flex items-center justify-between py-2 border-b border-white/10 ${
                    isActive ? "text-[#FFF4C2] font-medium" : "text-white"
                  }`}
                >
                  <span>{link.name}</span>
                  {isActive && <div className="w-2.5 h-2.5 rounded-full bg-[#E6007E] shadow-md shadow-[#E6007E]" />}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Drawer Action Buttons */}
        <div className="space-y-4 pt-6 border-t border-white/20">
          <Link
            href="/login"
            onClick={() => setIsMobileMenuOpen(false)}
            className="w-full py-3.5 border-2 border-white text-white rounded-full text-center uppercase tracking-wider text-sm font-medium flex items-center justify-center space-x-2 hover:bg-white/10 active:scale-95"
          >
            <User size={18} />
            <span>MASUK</span>
          </Link>
          <Link
            href="/menu"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block w-full py-3.5 bg-[#E6007E] text-white rounded-full text-center uppercase tracking-wider text-sm font-medium shadow-lg flex items-center justify-center space-x-2 active:scale-95"
          >
            <ShoppingBag size={18} />
            <span>PESAN SEKARANG</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
