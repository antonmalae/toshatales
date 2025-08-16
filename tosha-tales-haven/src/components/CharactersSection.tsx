import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";
import { useState, useEffect } from "react";
import characterService from "../services/characterService.js";

interface Character {
  id: string;
  name: string;
  description: string;
  image?: string;
  role?: {
    name: string;
    description: string;
  };
  _count?: {
    stories: number;
    likes: number;
  };
}

const CharacterCard = ({ character }: { character: Character }) => {
  return (
    <Link to={`/character/${character.id}`}>
      <Card className="character-card group text-center cursor-pointer">
      {/* Аватар персонажа */}
      <div className="w-20 h-20 bg-primary rounded-full mx-auto mb-4 flex items-center justify-center text-4xl group-hover:animate-gentle-bounce overflow-hidden">
        {character.image ? (
          <img 
            src={character.image} 
            alt={character.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-4xl">🐊</span>
        )}
      </div>

      {/* Информация о персонаже */}
      <div className="space-y-3">
        <h3 className="text-xl font-heading font-semibold text-foreground group-hover:text-primary transition-colors">
          {character.name}
        </h3>
        
        {character.role && (
          <div className="inline-block px-3 py-1 rounded-full text-xs font-heading font-medium bg-primary text-white">
            {character.role.name}
          </div>
        )}
        
        <p className="text-muted-foreground font-body text-sm leading-relaxed">
          {character.description}
        </p>
      </div>
    </Card>
    </Link>
  );
};

export const CharactersSection = () => {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCharacters = async () => {
      try {
        setLoading(true);
        const response = await characterService.getCharacters({ 
          limit: 4,
          sortBy: 'name',
          sortOrder: 'asc'
        });
        setCharacters(response.data || []);
      } catch (err) {
        setError('Ошибка при загрузке персонажей');
        console.error('Error fetching characters:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCharacters();
  }, []);

  if (loading) {
    return (
      <section className="bg-gradient-soft py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <p className="text-lg text-muted-foreground">Загрузка персонажей...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="bg-gradient-soft py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <p className="text-lg text-red-500">{error}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-gradient-soft py-16 md:py-20">
      <div className="container mx-auto px-4">
        {/* Заголовок секции */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">
            Познакомьтесь с друзьями Тоши
          </h2>
          <p className="text-lg text-muted-foreground font-body max-w-2xl mx-auto">
            Каждый персонаж особенный и учит детей важным жизненным ценностям
          </p>
        </div>

        {/* Сетка персонажей */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {characters.map((character) => (
            <CharacterCard key={character.id} character={character} />
          ))}
        </div>

        {/* Кнопка "Узнать больше" */}
        <div className="text-center">
          <Link to="/characters">
            <Button className="story-button">
              <Users className="w-5 h-5 mr-2" />
              Энциклопедия персонажей
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};