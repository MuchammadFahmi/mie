"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Utensils, ShoppingBag, ArrowRight } from "lucide-react";

const slides = [
  {
    id: 1,
    image: "/assets/makangacoan.jpg",
    alt: "Mie Gacoan Pedas Lezat",
  },
  {
    id: 2,
    image: "/assets/dimsumgacoan.jpg",
    alt: "Dimsum Mie Gacoan Gurih",
  },
  {
    id: 3,
    image: "/assets/dimsumgacoan1.png",
    alt: "Menu Favorit Mie Gacoan",
  },
];

export default function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative w-full h-screen min-h-[650px] max-h-[900px] flex items-center justify-center overflow-hidden">
      {/* Background Carousel Slides */}
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === currentSlide
              ? "opacity-100 scale-100"
              : "opacity-0 scale-105 pointer-events-none"
          }`}
        >
          <Image
            src={slide.image}
            alt={slide.alt}
            fill
            priority={index === 0}
            className="object-cover object-center"
          />
        </div>
      ))}

      {/* Teal Overlay matching visual reference */}
      <div className="absolute inset-0 bg-[#17B8CF]/75 backdrop-brightness-95" />

      {/* Hero Content Container */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 text-center text-white flex flex-col items-center justify-center pt-24 sm:pt-28 md:pt-32 pb-16">
        {/* Mie Gacoan Logo */}
        <div className="relative w-36 h-36 sm:w-48 sm:h-48 md:w-56 md:h-56 mb-3 sm:mb-5 drop-shadow-xl animate-float">
          <Image
            src="/assets/logogacoan.png"
            alt="Mie Gacoan Logo"
            fill
            className="object-contain"
            priority
          />
        </div>

        {/* Tagline Section with Strikethrough & Subtitle */}
        <div className="relative mb-6 sm:mb-8 max-w-3xl">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-medium tracking-wide uppercase leading-tight drop-shadow-md">
            MIE DULU BARU{" "}
            <span className="relative inline-block px-1">
              <span className="opacity-80">SKRIPSI</span>
              {/* Strikethrough Line (Matching exact reference screenshot) */}
              <span className="absolute left-0 top-1/2 w-full h-[5px] sm:h-[7px] bg-white rounded-full transform -rotate-2 -translate-y-1/2 shadow" />
            </span>
          </h1>

          {/* "MIE LAGI" text underneath on the right */}
          <div className="w-full flex justify-end pr-2 sm:pr-8 md:pr-16 mt-1.5">
            <span className="text-xs sm:text-sm md:text-base tracking-widest text-[#FFF4C2] font-medium uppercase drop-shadow">
              MIE LAGI
            </span>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 w-full max-w-lg mb-8 sm:mb-10">
          {/* Take Away (Pink Solid) */}
          <Link
            href="/menu"
            className="w-full sm:w-auto px-8 py-3.5 bg-[#E6007E] hover:bg-[#D00070] text-white rounded-full text-base uppercase tracking-wider font-medium shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 active:scale-95 flex items-center justify-center space-x-2.5 whitespace-nowrap group"
          >
            <ShoppingBag size={18} />
            <span>TAKE AWAY</span>
            <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
          </Link>

          {/* Dine In (Outline White) */}
          <a
            href="#cara-pemesanan"
            className="w-full sm:w-auto px-8 py-3.5 border-2 border-white hover:bg-white hover:text-[#0F2A33] text-white rounded-full text-base uppercase tracking-wider font-medium shadow-md transition-all transform hover:-translate-y-0.5 active:scale-95 flex items-center justify-center space-x-2.5 whitespace-nowrap"
          >
            <Utensils size={18} />
            <span>DINE IN</span>
          </a>
        </div>
      </div>

      {/* Carousel Dot Indicators at the bottom */}
      <div className="absolute bottom-6 sm:bottom-8 left-0 right-0 z-20 flex justify-center space-x-3">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`h-3 rounded-full transition-all duration-300 ${
              index === currentSlide
                ? "bg-[#E6007E] w-7 shadow-md"
                : "bg-white/80 hover:bg-white w-3"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
