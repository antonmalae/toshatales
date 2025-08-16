import { Search as SearchIcon, Moon, Sun, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import searchService from "../services/searchService.js";
import { SearchResults } from "./SearchResults";

interface HeaderProps {
  darkMode: boolean;
  onThemeToggle: () => void;
}

interface SearchResult {
  id: string;
  title?: string;
  name?: string;
  description?: string;
  image?: string;
  type: 'story' | 'character';
  category?: {
    name: string;
    color: string;
  };
}

export const Header = ({ darkMode, onThemeToggle }: HeaderProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchResultsRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Обработка поиска с дебаунсом
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(async () => {
      try {
        setIsSearching(true);
        setShowSearchResults(true);
        
        const response = await searchService.search(searchQuery, { limit: 10 });
        
        if (response.success) {
          const results: SearchResult[] = [];
          
          // Обрабатываем сказки
          if (response.data.results.stories) {
            response.data.results.stories.forEach((story: any) => {
              results.push({
                id: story.id,
                title: story.title,
                description: story.description,
                image: story.image,
                type: 'story',
                category: story.category
              });
            });
          }
          
          // Обрабатываем персонажей
          if (response.data.results.characters) {
            response.data.results.characters.forEach((character: any) => {
              results.push({
                id: character.id,
                name: character.name,
                description: character.description,
                image: character.image,
                type: 'character',
                category: character.role
              });
            });
          }
          
          setSearchResults(results);
        }
      } catch (error) {
        console.error('Ошибка поиска:', error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  // Закрытие результатов поиска при клике вне
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchResultsRef.current &&
        !searchResultsRef.current.contains(event.target as Node) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target as Node)
      ) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Обработка нажатия Enter в поле поиска
  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setShowSearchResults(false);
      setSearchQuery("");
    }
  };

  const closeSearchResults = () => {
    setShowSearchResults(false);
  };

  return (
    <header className="bg-gradient-soft border-b border-primary/10 sticky top-0 z-50 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Логотип и название */}
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-hero rounded-2xl flex items-center justify-center animate-gentle-glow">
              <span className="text-2xl">🐊</span>
            </div>
            <div>
              <h1 className="text-2xl font-heading font-bold text-primary">
                Сказки про Крокодила Тошу
              </h1>
              <p className="text-sm text-muted-foreground font-body">
                Добрые истории для всей семьи
              </p>
            </div>
          </div>

          {/* Поиск - скрыт на мобильных */}
          <div className="hidden md:flex flex-1 max-w-md mx-8 relative" ref={searchResultsRef}>
            <div className="relative w-full">
              <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input
                ref={searchInputRef}
                type="text"
                placeholder="Найти сказку или персонажа..."
                className="search-input pl-12"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleSearchKeyPress}
                onFocus={() => searchQuery.trim().length >= 2 && setShowSearchResults(true)}
              />
              <SearchResults
                results={searchResults}
                isVisible={showSearchResults}
                onClose={closeSearchResults}
                isLoading={isSearching}
              />
            </div>
          </div>

          {/* Навигация и переключатель темы */}
          <div className="flex items-center space-x-4">
            {/* Меню навигации - скрыто на мобильных */}
            <nav className="hidden lg:flex items-center space-x-6">
              <a href="/" className="font-body text-foreground hover:text-primary transition-colors">
                Главная
              </a>
              <a href="/stories" className="font-body text-foreground hover:text-primary transition-colors">
                Сказки
              </a>
              <a href="/characters" className="font-body text-foreground hover:text-primary transition-colors">
                Персонажи
              </a>
              <a href="/about" className="font-body text-foreground hover:text-primary transition-colors">
                О проекте
              </a>
            </nav>

            {/* Переключатель темы */}
            <Button
              variant="ghost"
              size="icon"
              onClick={onThemeToggle}
              className="rounded-full hover:bg-primary/10"
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>

            {/* Мобильное меню */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden rounded-full hover:bg-primary/10"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Menu className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Мобильная навигация */}
        {isMenuOpen && (
          <div className="lg:hidden mt-4 p-4 bg-card rounded-2xl shadow-card border border-primary/10">
            {/* Мобильный поиск */}
            <div className="relative mb-4">
              <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input
                type="text"
                placeholder="Найти сказку..."
                className="search-input pl-12"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleSearchKeyPress}
              />
            </div>
            
            {/* Мобильное меню */}
            <nav className="flex flex-col space-y-3">
              <a href="/" className="font-body text-foreground hover:text-primary transition-colors py-2">
                Главная
              </a>
              <a href="/stories" className="font-body text-foreground hover:text-primary transition-colors py-2">
                Сказки
              </a>
              <a href="/characters" className="font-body text-foreground hover:text-primary transition-colors py-2">
                Персонажи
              </a>
              <a href="/about" className="font-body text-foreground hover:text-primary transition-colors py-2">
                О проекте
              </a>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};