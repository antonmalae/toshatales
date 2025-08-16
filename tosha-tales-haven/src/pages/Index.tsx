import { useEffect } from "react";
import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { StoriesSection } from "@/components/StoriesSection";
import { CharactersSection } from "@/components/CharactersSection";
import { Footer } from "@/components/Footer";
import { useTheme } from "@/hooks/use-theme";

const Index = () => {
  const { darkMode, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      <Header darkMode={darkMode} onThemeToggle={toggleTheme} />
      <main>
        <HeroSection />
        <StoriesSection />
        <CharactersSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
