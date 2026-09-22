"use client";

import { useState } from "react";
import { Flame, Sparkles, AlertCircle } from "lucide-react";

const spicyLevels = [
  {
    level: 0,
    name: "LEVEL 0",
    title: "Manis Gurih (Original)",
    desc: "Sajian khas tanpa rasa pedas sama sekali. Cocok untuk yang mau nikmati rasa manis gurih otentik Gacoan!",
    intensity: "Tanpa Pedas",
    percent: 0,
    bgColor: "from-yellow-400 to-amber-500",
    badgeColor: "bg-amber-400 text-gray-900",
    activeShadow: "shadow-amber-500/30",
    textColor: "text-amber-400",
    chiliCount: 0,
  },
  {
    level: 1,
    name: "LEVEL 1",
    title: "Pedas Santai",
    desc: "Pedas tipis-tipis menggugah selera. Pilihan pas untuk pemula yang ingin coba-coba sensasi pedas.",
    intensity: "Pedas Ringan",
    percent: 20,
    bgColor: "from-amber-500 to-orange-500",
    badgeColor: "bg-orange-400 text-gray-900",
    activeShadow: "shadow-orange-500/30",
    textColor: "text-orange-400",
    chiliCount: 1,
  },
  {
    level: 2,
    name: "LEVEL 2",
    title: "Pedas Sedang",
    desc: "Rasa pedas pas yang ramah di lidah! Teman setia pas nugas atau sekadar nongkrong bareng sahabat.",
    intensity: "Sedang",
    percent: 40,
    bgColor: "from-orange-500 to-red-500",
    badgeColor: "bg-orange-500 text-white",
    activeShadow: "shadow-orange-600/40",
    textColor: "text-orange-500",
    chiliCount: 2,
  },
  {
    level: 3,
    name: "LEVEL 3",
    title: "Semangat Skripsi",
    desc: "Mulai kerasa gigitannya! Bikin mata merem-melek dan semangat nugas langsung membara kembali.",
    intensity: "Mantap Pedas",
    percent: 60,
    bgColor: "from-red-500 to-rose-600",
    badgeColor: "bg-red-500 text-white",
    activeShadow: "shadow-red-500/40",
    textColor: "text-red-500",
    chiliCount: 3,
  },
  {
    level: 4,
    name: "LEVEL 4",
    title: "Pedas HOT Gacoan",
    desc: "Sensasi pedas nagih khas Mie Gacoan. Siap-siap lidah bergoyang dan bibir sedikit memerah!",
    intensity: "Sangat Pedas",
    percent: 75,
    bgColor: "from-rose-600 to-red-700",
    badgeColor: "bg-rose-600 text-white",
    activeShadow: "shadow-rose-600/40",
    textColor: "text-rose-500",
    chiliCount: 4,
  },
  {
    level: 6,
    name: "LEVEL 6",
    title: "Super HOT Bikin Keringetan",
    desc: "Pedasnya tidak main-main! Disarankan sedia es teh atau es gobak sodor melimpah di sampingmu.",
    intensity: "SUPER HOT",
    percent: 90,
    bgColor: "from-red-600 to-pink-700",
    badgeColor: "bg-red-700 text-white",
    activeShadow: "shadow-red-700/50",
    textColor: "text-red-600",
    chiliCount: 5,
  },
  {
    level: 8,
    name: "LEVEL 8",
    title: "Pedas Sultan Ekstrem",
    desc: "Level puncak tertinggi tanpa ampuh! Hanya untuk para pemberani yang punya jiwa petualang rasa sejati.",
    intensity: "EKSTREMLY HOT!",
    percent: 100,
    bgColor: "from-[#E6007E] to-purple-800",
    badgeColor: "bg-[#E6007E] text-white",
    activeShadow: "shadow-[#E6007E]/50",
    textColor: "text-[#E6007E]",
    chiliCount: 5,
  },
];

export default function SpicyLevel() {
  const [selectedLevel, setSelectedLevel] = useState(3);

  const current = spicyLevels.find((l) => l.level === selectedLevel) || spicyLevels[3];

  return (
    <section className="py-20 bg-[#0F2A33] text-white relative overflow-hidden">
      {/* Background Decorative Gradient Blurs */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#17B8CF]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[#E6007E]/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-12">
          <span className="text-[#FFF4C2] text-xs uppercase tracking-widest font-medium bg-white/10 px-4 py-1.5 rounded-full inline-flex items-center space-x-2 mb-3 border border-white/15">
            <Flame size={14} className="text-[#E6007E]" />
            <span>Tantang Lidahmu</span>
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-medium uppercase tracking-wide text-white">
            LEVEL PEDAS GACOAN
          </h2>
          <p className="mt-3 text-gray-300 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
            Pilih tingkat kepedasan favoritmu dari Level 0 hingga Level 8. Klik tiap level untuk melihat tingkat intensitas rasa!
          </p>
        </div>

        {/* Horizontal Level Badges Grid */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3.5 mb-10">
          {spicyLevels.map((item) => {
            const isSelected = selectedLevel === item.level;
            return (
              <button
                key={item.level}
                onClick={() => setSelectedLevel(item.level)}
                className={`px-4 sm:px-6 py-3 rounded-2xl font-medium text-xs sm:text-sm tracking-wider uppercase transition-all duration-300 flex items-center space-x-2 transform active:scale-95 ${
                  isSelected
                    ? `bg-gradient-to-r ${item.bgColor} text-white shadow-lg ${item.activeShadow} scale-105 ring-2 ring-white/50`
                    : "bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white border border-white/10"
                }`}
              >
                <Flame
                  size={16}
                  className={isSelected ? "text-white animate-pulse" : "text-gray-400"}
                />
                <span>LVL {item.level}</span>
              </button>
            );
          })}
        </div>

        {/* Selected Level Display Showcase Card */}
        <div className="max-w-3xl mx-auto bg-gradient-to-b from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
          {/* Subtle Top Accent Line */}
          <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${current.bgColor}`} />

          <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8">
            {/* Left Flame Badge Visual */}
            <div className="flex-shrink-0 text-center">
              <div
                className={`w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-br ${current.bgColor} flex flex-col items-center justify-center shadow-xl transform transition-transform duration-500 hover:rotate-6`}
              >
                <Flame size={44} className="text-white drop-shadow-md" />
                <span className="text-white font-medium text-xs sm:text-sm tracking-widest mt-1">
                  LVL {current.level}
                </span>
              </div>
            </div>

            {/* Right Details */}
            <div className="flex-1 text-center md:text-left space-y-3">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wider ${current.badgeColor}`}>
                  {current.intensity}
                </span>

                {/* Chili Icons Visual Meter */}
                <div className="flex items-center space-x-1 px-3 py-1 bg-black/30 rounded-full">
                  {[...Array(5)].map((_, i) => (
                    <Flame
                      key={i}
                      size={14}
                      className={
                        i < current.chiliCount
                          ? current.textColor
                          : "text-gray-600"
                      }
                    />
                  ))}
                </div>
              </div>

              <h3 className="text-2xl sm:text-3xl font-medium text-white uppercase tracking-wide">
                {current.name}: {current.title}
              </h3>

              <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
                {current.desc}
              </p>

              {/* Heat Intensity Gauge Bar */}
              <div className="pt-2">
                <div className="flex items-center justify-between text-xs text-gray-400 mb-1.5 uppercase tracking-wider">
                  <span>Tingkat Kepedasan</span>
                  <span className={current.textColor}>{current.percent}%</span>
                </div>
                <div className="w-full h-3 bg-black/40 rounded-full overflow-hidden p-0.5 border border-white/10">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${current.bgColor} transition-all duration-500 ease-out`}
                    style={{ width: `${current.percent}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
