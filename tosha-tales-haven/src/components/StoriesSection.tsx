import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Heart, Star, ArrowRight, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import storyService from "../services/storyService.js";

interface Story {
  id: string;
  title: string;
  description: string;
  readTime: string;
  totalLikes: number;
  averageRating: number;
  image?: string;
  is_new?: boolean;
  category?: {
    name: string;
    color: string;
  };
}

const StoryCard = ({ story }: { story: Story }) => {
  return (
    <Link to={`/story/${story.id}`}>
      <Card className="character-card group cursor-pointer overflow-hidden">
      {/* Изображение */}
      <div className="relative h-48 mb-4 rounded-2xl overflow-hidden">
        <img
          src={story.image}
          alt={story.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {story.is_new && (
          <div className="absolute top-3 right-3 bg-gradient-hero text-primary-foreground text-xs font-heading font-semibold px-3 py-1 rounded-full" aria-label="Новинка">
            Новинка
          </div>
        )}
        <div className="absolute top-3 left-3 bg-card/90 backdrop-blur-sm text-card-foreground text-xs font-body px-2 py-1 rounded-full flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {story.readTime}
        </div>
      </div>

      {/* Контент */}
      <div className="space-y-3">
        <h3 className="text-xl font-heading font-semibold text-foreground group-hover:text-primary transition-colors">
          {story.title}
        </h3>
        <p className="text-muted-foreground font-body leading-relaxed">
          {story.description}
        </p>

        {/* Метрики */}
        <div className="flex items-center justify-between pt-3 border-t border-primary/10">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Heart className="w-4 h-4 text-red-400" />
              <span className="font-body">{story.totalLikes}</span>
            </div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              <span className="font-body">{story.averageRating.toFixed(1)}</span>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-primary hover:text-primary-foreground hover:bg-primary rounded-full p-2"
          >
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
    </Link>
  );
};

export const StoriesSection = () => {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStories = async () => {
      try {
        setLoading(true);
        const response = await storyService.getStories({ 
          limit: 6, 
          status: 'PUBLISHED',
          sortBy: 'createdAt',
          sortOrder: 'desc'
        });
        setStories(response.data || []);
      } catch (err) {
        setError('Ошибка при загрузке историй');
        console.error('Error fetching stories:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStories();
  }, []);

  if (loading) {
    return (
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <p className="text-lg text-muted-foreground">Загрузка историй...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <p className="text-lg text-red-500">{error}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 md:py-20">
      <div className="container mx-auto px-4">
        {/* Заголовок секции */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">
            Новые сказки про Тошу
          </h2>
          <p className="text-lg text-muted-foreground font-body max-w-2xl mx-auto">
            Откройте для себя удивительные приключения доброго крокодила Тоши и его друзей
          </p>
        </div>

        {/* Сетка сказок */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {stories.map((story) => (
            <StoryCard key={story.id} story={story} />
          ))}
        </div>

        {/* Кнопка "Показать все" */}
        <div className="text-center">
          <Link to="/stories">
            <Button className="magic-button">
              <BookOpen className="w-5 h-5 mr-2" />
              Посмотреть все сказки
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};