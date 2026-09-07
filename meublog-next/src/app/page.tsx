import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import ProjectsSection from "@/components/ProjectsSection";
import CareerSection from "@/components/CareerSection";
import Footer from "@/components/Footer";
import { ParallaxScene } from "@/components/ui/parallax-scene";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <AboutSection />
        <ParallaxScene />
        <ProjectsSection />
        <CareerSection />
      </main>
      <Footer />
    </>
  );
}
