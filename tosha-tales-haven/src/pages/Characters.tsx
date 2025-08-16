import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, Star, Users, Loader2 } from "lucide-react";
import characterService from "@/services/characterService.js";
import { useTheme } from "@/hooks/use-theme";

interface Character {
  id: string;
  name: string;
  description: string;
  personality?: string[];
  likes?: number;
  rating?: number;
  image?: string;
  role?: {
    id: string;
    name: string;
    description?: string;
  };
  stories?: string[];
  _count?: {
    stories: number;
    likes: number;
  };
}

// Удаляем моковые данные - теперь будем загружать из API

const CharacterCard = ({ character }: { character: Character }) => {
  return (
    <Link to={`/character/${character.id}`}>
      <Card className="character-card group cursor-pointer overflow-hidden h-full">
      <div className="relative h-48 mb-4 rounded-2xl overflow-hidden">
        <img
          src={character.image}
          alt={character.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-3 left-3 bg-card/90 backdrop-blur-sm text-card-foreground text-xs font-body px-2 py-1 rounded-full">
          {character.role?.name || 'Без роли'}
        </div>
      </div>

      <div className="space-y-4 flex flex-col h-full">
        <div>
          <h3 className="text-xl font-heading font-semibold text-foreground group-hover:text-primary transition-colors mb-2">
            {character.name}
          </h3>
          <p className="text-muted-foreground font-body leading-relaxed text-sm">
            {character.description}
          </p>
        </div>

        <div className="space-y-3 flex-grow">
          {character.personality && character.personality.length > 0 && (
            <div>
              <h4 className="text-sm font-heading font-semibold text-foreground mb-2">Характер:</h4>
              <div className="flex flex-wrap gap-1">
                {character.personality.map((trait, index) => (
                  <Badge key={index} variant="secondary" className="text-xs font-body">
                    {trait}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div>
            <h4 className="text-sm font-heading font-semibold text-foreground mb-2">Участвует в сказках:</h4>
            <p className="text-xs text-muted-foreground font-body">
              {character._count?.stories || character.stories?.length || 0} сказок
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-primary/10 mt-auto">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Heart className="w-4 h-4 text-red-400" />
              <span className="font-body">{character._count?.likes || character.likes || 0}</span>
            </div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              <span className="font-body">{character.rating || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
    </Link>
  );
};

const Characters = () => {
  const { darkMode, toggleTheme } = useTheme();
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Загружаем персонажей из API
  useEffect(() => {
    const loadCharacters = async () => {
      try {
        setLoading(true);
        const response = await characterService.getCharacters();
        console.log('API Response:', response); // Для отладки
        // Проверяем разные возможные форматы ответа
        const charactersData = response.data || response.characters || response || [];
        setCharacters(charactersData);
        setError(null);
      } catch (err) {
        console.error('Error loading characters:', err);
        setError('Не удалось загрузить персонажей');
      } finally {
        setLoading(false);
      }
    };

    loadCharacters();
  }, []);

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      <Header darkMode={darkMode} onThemeToggle={toggleTheme} />
      
      <main className="container mx-auto px-4 py-8">
        {/* Заголовок страницы */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-heading font-bold text-primary mb-4">
            Персонажи сказок
          </h1>
          <p className="text-lg text-muted-foreground font-body max-w-2xl mx-auto">
            Познакомьтесь с героями сказок про Крокодила Тошу. Каждый персонаж имеет свой характер и историю.
          </p>
        </div>

        {/* Состояние загрузки */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground mt-4">Загружаем персонажей...</p>
          </div>
        )}

        {/* Отладочная информация */}
        {!loading && (
          <div className="text-center py-4 text-sm text-muted-foreground">
            Загружено персонажей: {characters.length}
          </div>
        )}

        {/* Состояние ошибки */}
        {error && (
          <div className="text-center py-12">
            <p className="text-destructive">{error}</p>
            <Button onClick={() => window.location.reload()} className="mt-4">
              Попробовать снова
            </Button>
          </div>
        )}

        {/* Список персонажей */}
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {characters.map((character) => (
              <CharacterCard key={character.id} character={character} />
            ))}
          </div>
        )}

        {/* Сообщение если нет персонажей */}
        {!loading && !error && characters.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Персонажи не найдены
            </h3>
            <p className="text-muted-foreground">
              Попробуйте обновить страницу или вернитесь позже
            </p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Characters;