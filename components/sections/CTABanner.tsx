import Link from "next/link";
import { ShoppingBag, ArrowRight, Tag, Sparkles } from "lucide-react";

export default function CTABanner() {
  return (
    <section className="py-20 bg-gradient-to-r from-[#17B8CF] via-[#1AA7C4] to-[#17B8CF] relative overflow-hidden text-white">
      {/* Background Decorative Polka Pattern */}
      <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#fff_1.5px,transparent_1.5px)] [background-size:20px_20px]" />

      {/* Decorative Glow Orbs */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-white/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-[#E6007E]/30 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="bg-white/10 backdrop-blur-xl border border-white/30 rounded-3xl p-8 sm:p-12 md:p-16 text-center flex flex-col items-center justify-center shadow-2xl relative overflow-hidden">
          {/* Promo Tag Ribbon */}
          <div className="inline-flex items-center space-x-2 text-[#FFF4C2] text-xs uppercase tracking-widest font-medium bg-white/20 border border-white/25 px-5 py-2 rounded-full mb-6 backdrop-blur-md shadow-sm">
            <Tag size={14} className="text-[#FFF4C2]" />
            <span>KODE PROMO: GACOANFUN (-20%)</span>
          </div>

          <h2 className="text-3xl sm:text-5xl md:text-6xl font-medium uppercase tracking-wide mb-6 leading-tight drop-shadow-md">
            LAPAR NUGAS? MIE DULU!
          </h2>

          <p className="text-white/90 text-base sm:text-xl max-w-2xl mb-8 leading-relaxed">
            Jangan biarkan perut kosong merusak konsentrasi dan mood nugasmu. Pesan Mie Gacoan lezatmu secara online atau mampir ke outlet terdekat sekarang!
          </p>

          <Link
            href="/menu"
            className="px-10 py-4 bg-[#E6007E] hover:bg-[#D00070] text-white rounded-full text-lg uppercase tracking-wider font-medium shadow-xl hover:shadow-pink-500/40 transition-all transform hover:-translate-y-1 active:scale-95 flex items-center space-x-3 group relative overflow-hidden"
          >
            <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            <ShoppingBag size={22} />
            <span>PESAN ONLINE SEKARANG</span>
            <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}
