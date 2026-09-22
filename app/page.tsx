import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/sections/Hero";
import OrderMethods from "@/components/sections/OrderMethods";
import FavoriteMenu from "@/components/sections/FavoriteMenu";
import SpicyLevel from "@/components/sections/SpicyLevel";
import Features from "@/components/sections/Features";
import CTABanner from "@/components/sections/CTABanner";
import Footer from "@/components/layout/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <Hero />
      <OrderMethods />
      <FavoriteMenu />
      <SpicyLevel />
      <Features />
      <CTABanner />
      <Footer />
    </main>
  );
}
