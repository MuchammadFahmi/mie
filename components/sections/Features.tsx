import { Wallet, Zap, CreditCard, Store, Award, Clock, HeartHandshake, ShieldCheck } from "lucide-react";

const features = [
  {
    icon: Wallet,
    metric: "Mulai 8 Ribuan",
    title: "HARGA MAHAKAN",
    desc: "Harga ramah dompet mahasiswa dan anak muda tanpa mengorbankan kualitas rasa.",
    color: "bg-[#17B8CF]",
    borderColor: "hover:border-[#17B8CF]",
  },
  {
    icon: Zap,
    metric: "~15 Menit Penyajian",
    title: "PESAN KILAT & FRESH",
    desc: "Dapur berstandar tinggi yang menyajikan mie hangat & dimsum crispy secara instan.",
    color: "bg-[#E6007E]",
    borderColor: "hover:border-[#E6007E]",
  },
  {
    icon: CreditCard,
    metric: "100% Cashless Ready",
    title: "BAYAR DENGAN MUDAH",
    desc: "Bisa bayar pakai QRIS, GoPay, OVO, ShopeePay, Debit, hingga uang tunai.",
    color: "bg-[#17B8CF]",
    borderColor: "hover:border-[#17B8CF]",
  },
  {
    icon: Store,
    metric: "100+ Cabang Kota",
    title: "BANYAK OUTLET DEKATMU",
    desc: "Tersebar luas di kota-kota besar Indonesia, tempat seru buat nongkrong kapan saja.",
    color: "bg-[#E6007E]",
    borderColor: "hover:border-[#E6007E]",
  },
];

export default function Features() {
  return (
    <section className="py-24 bg-white relative overflow-hidden">
      {/* Subtle Background Pattern */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="text-[#17B8CF] text-xs uppercase tracking-widest font-medium bg-[#17B8CF]/10 px-4 py-1.5 rounded-full inline-flex items-center space-x-2 mb-3 border border-[#17B8CF]/20">
            <Award size={14} className="text-[#17B8CF]" />
            <span>Kualitas Terjamin</span>
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-medium text-[#0F2A33] uppercase tracking-wide">
            KENAPA HARUS MIE GACOAN?
          </h2>
          <p className="mt-3 text-gray-600 max-w-2xl mx-auto text-base sm:text-lg">
            Empat alasan utama kenapa Mie Gacoan selalu dicintai jutaan pelanggan di seluruh Indonesia.
          </p>
        </div>

        {/* 4 Feature Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <div
                key={index}
                className={`p-8 bg-gradient-to-b from-[#17B8CF]/5 to-transparent border-2 border-gray-100 rounded-3xl text-center hover:bg-white hover:shadow-2xl ${item.borderColor} transition-all duration-500 transform hover:-translate-y-2 group relative overflow-hidden`}
              >
                {/* Metric Tag */}
                <span className="inline-block px-3 py-1 rounded-full bg-[#FFF4C2] text-[#0F2A33] text-[11px] font-medium uppercase tracking-wider mb-6 border border-amber-200">
                  {item.metric}
                </span>

                <div
                  className={`w-16 h-16 ${item.color} text-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-gray-200 transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}
                >
                  <IconComponent size={30} />
                </div>

                <h3 className="text-xl font-medium text-[#0F2A33] uppercase tracking-wide mb-3">
                  {item.title}
                </h3>

                <p className="text-gray-500 text-sm leading-relaxed">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
