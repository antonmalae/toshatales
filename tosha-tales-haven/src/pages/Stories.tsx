import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Heart, Star, Clock, BookOpen, Sparkles, ArrowRight } from "lucide-react";
import storyService from "../services/storyService.js";
import { useTheme } from "@/hooks/use-theme";

interface Story {
  id: string;
  title: string;
  description: string;
  fullDescription?: string;
  readTime: string;
  likes?: number;
  rating?: number;
  image?: string;
  isNew?: boolean;
  category: {
    id: string;
    name: string;
    color: string;
  };
  ageGroup: string;
  averageRating?: number;
  totalRatings?: number;
  totalLikes?: number;
  illustrations?: Array<{
    id: string;
    imageUrl: string;
    position: string;
    caption?: string;
    order: number;
  }>;
}

// Удаляем моковые данные - теперь будем загружать из API

const categories = ["Все", "Дружба", "Приключения", "Волшебство", "Принятие", "Экология", "Преодоление страхов"];
const ageGroups = ["Все возрасты", "4-6 лет", "5-7 лет", "4-7 лет"];

const StoryCard = ({ story }: { story: Story }) => {
  return (
    <Link to={`/story/${story.id}`}>
      <Card className="character-card group cursor-pointer overflow-hidden">
      <div className="relative h-48 mb-4 rounded-2xl overflow-hidden">
        <img
          src={story.image || '/placeholder-story.jpg'}
          alt={story.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {story.isNew && (
          <div className="absolute top-3 right-3 bg-gradient-hero text-primary-foreground text-xs font-heading font-semibold px-3 py-1 rounded-full">
            Новинка
          </div>
        )}
        <div className="absolute top-3 left-3 bg-card/90 backdrop-blur-sm text-card-foreground text-xs font-body px-2 py-1 rounded-full flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {story.readTime}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex gap-2 mb-2">
          <Badge variant="secondary" className="text-xs font-body">
            {story.category?.name || 'Без категории'}
          </Badge>
          <Badge variant="outline" className="text-xs font-body">
            {story.ageGroup}
          </Badge>
        </div>
        
        <h3 className="text-xl font-heading font-semibold text-foreground group-hover:text-primary transition-colors">
          {story.title}
        </h3>
        <p className="text-muted-foreground font-body leading-relaxed">
          {story.description}
        </p>

        <div className="flex items-center justify-between pt-3 border-t border-primary/10">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Heart className="w-4 h-4 text-red-400" />
              <span className="font-body">{story.totalLikes || 0}</span>
            </div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              <span className="font-body">{story.averageRating?.toFixed(1) || '0.0'}</span>
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

const Stories = () => {
  const { darkMode, toggleTheme } = useTheme();
  const [selectedCategory, setSelectedCategory] = useState("Все");
  const [selectedAgeGroup, setSelectedAgeGroup] = useState("Все возрасты");
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Загружаем истории из API
  useEffect(() => {
    const loadStories = async () => {
      try {
        setLoading(true);
        const response = await storyService.getStories({ 
          status: 'PUBLISHED' // Показываем только опубликованные сказки
        });
        console.log('API Response:', response); // Для отладки
        setStories(response.data || []);
        setError(null);
      } catch (err) {
        console.error('Error loading stories:', err);
        setError('Не удалось загрузить истории');
      } finally {
        setLoading(false);
      }
    };

    loadStories();
  }, []);

  const filteredStories = stories.filter(story => {
    const categoryMatch = selectedCategory === "Все" || story.category?.name === selectedCategory;
    const ageMatch = selectedAgeGroup === "Все возрасты" || story.ageGroup === selectedAgeGroup;
    return categoryMatch && ageMatch;
  });

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      <Header darkMode={darkMode} onThemeToggle={toggleTheme} />
      
      <main className="container mx-auto px-4 py-8">
        {/* Заголовок страницы */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-heading font-bold text-primary mb-4">
            Сказки про Крокодила Тошу
          </h1>
          <p className="text-lg text-muted-foreground font-body max-w-2xl mx-auto">
            Добрые истории для детей всех возрастов. Выберите сказку и отправьтесь в увлекательное приключение!
          </p>
        </div>

        {/* Фильтры */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8 justify-center">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Выберите категорию" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Все">Все категории</SelectItem>
              <SelectItem value="Приключения">Приключения</SelectItem>
              <SelectItem value="Дружба">Дружба</SelectItem>
              <SelectItem value="Семья">Семья</SelectItem>
              <SelectItem value="Природа">Природа</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedAgeGroup} onValueChange={setSelectedAgeGroup}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Выберите возраст" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Все возрасты">Все возрасты</SelectItem>
              <SelectItem value="2-4 года">2-4 года</SelectItem>
              <SelectItem value="4-6 лет">4-6 лет</SelectItem>
              <SelectItem value="6-8 лет">6-8 лет</SelectItem>
              <SelectItem value="8-12 лет">8-12 лет</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Состояние загрузки */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground mt-4">Загружаем сказки...</p>
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

        {/* Список сказок */}
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStories.map((story) => (
              <StoryCard key={story.id} story={story} />
            ))}
          </div>
        )}

        {/* Сообщение если нет сказок */}
        {!loading && !error && filteredStories.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Сказки не найдены
            </h3>
            <p className="text-muted-foreground">
              Попробуйте изменить фильтры или вернитесь позже
            </p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Stories;