import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import HeroSection from "@/components/hero";
import { SessionProvider } from "next-auth/react";
export default function HomePage() {
  return (
    <div className="relative min-h-screen bg-[#F8F4ED]">
      <div className="relative">
        <SessionProvider>
        <Navbar />
        </SessionProvider>
        <main className="flex-1">
          <HeroSection />
        </main>
        <Footer />
      </div>
    </div>
  );
}
