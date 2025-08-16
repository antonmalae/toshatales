import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Heart, Star, Quote, Image as ImageIcon, ArrowLeft, Play, Pause, Loader2, BookOpen, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { useTheme } from "@/hooks/use-theme";
import characterService from "@/services/characterService.js";

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
  stories?: Array<{
    story: {
      id: string;
      title: string;
      description: string;
      readTime: string;
      ageGroup: string;
      status: string;
      image?: string;
      category: {
        id: string;
        name: string;
        color: string;
      };
    };
  }>;
  _count?: {
    stories: number;
    likes: number;
  };
}

// Удаляем моковые данные - теперь будем загружать из API

const Character = () => {
  const { id } = useParams();
  const { darkMode, toggleTheme } = useTheme();
  const [character, setCharacter] = useState<Character | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Загружаем данные персонажа из API
  useEffect(() => {
    const loadCharacter = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        setError(null);
        const response = await characterService.getCharacter(id);
        console.log('Character API Response:', response); // Для отладки
        setCharacter(response.data || response);
      } catch (err) {
        console.error('Error loading character:', err);
        setError('Не удалось загрузить данные персонажа');
      } finally {
        setLoading(false);
      }
    };

    loadCharacter();
  }, [id]);

  const handleLike = () => {
    setIsLiked(!isLiked);
  };

  const openImageModal = (image: string) => {
    setSelectedImage(image);
  };

  const closeImageModal = () => {
    setSelectedImage(null);
  };

  // Показываем загрузку
  if (loading) {
    return (
      <div className="min-h-screen bg-background transition-colors duration-300">
        <Header darkMode={darkMode} onThemeToggle={toggleTheme} />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-muted-foreground">Загрузка персонажа...</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Показываем ошибку
  if (error || !character) {
    return (
      <div className="min-h-screen bg-background transition-colors duration-300">
        <Header darkMode={darkMode} onThemeToggle={toggleTheme} />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">
            <Link to="/characters">
              <Button variant="ghost" className="flex items-center gap-2 mb-4">
                <ArrowLeft className="w-4 h-4" />
                Назад к персонажам
              </Button>
            </Link>
            <Card className="p-8 max-w-md mx-auto">
              <h2 className="text-xl font-heading font-semibold text-foreground mb-4">
                Ошибка загрузки
              </h2>
              <p className="text-muted-foreground mb-4">
                {error || 'Персонаж не найден'}
              </p>
              <Link to="/characters">
                <Button>Вернуться к персонажам</Button>
              </Link>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      <Header darkMode={darkMode} onThemeToggle={toggleTheme} />
      
      <main className="container mx-auto px-4 py-8">
        {/* Кнопка назад */}
        <div className="mb-6">
          <Link to="/characters">
            <Button variant="ghost" className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Назад к персонажам
            </Button>
          </Link>
        </div>

        {/* Основная информация о персонаже */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Левая колонка - изображение и основная информация */}
          <div className="lg:col-span-1">
            <Card className="p-6">
              <div className="text-center mb-6">
                <div className="w-48 h-64 mx-auto mb-4 rounded-lg overflow-hidden bg-gradient-soft relative group">
                  <img
                    src={character.image || '/placeholder.svg'}
                    alt={character.name}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    onClick={() => openImageModal(character.image || '')}
                    style={{ cursor: 'pointer' }}
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all flex items-center justify-center">
                    <ImageIcon className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
                <h1 className="text-3xl font-heading font-bold text-primary mb-2">
                  {character.name}
                </h1>
                <Badge variant="secondary" className="mb-4">
                  {character.role?.name || 'Без роли'}
                </Badge>
              </div>

              {/* Статистика */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Heart className="w-4 h-4 text-red-500" />
                    <span className="font-semibold">{character._count?.likes || character.likes || 0}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Лайков</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span className="font-semibold">{character.rating || 0}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Рейтинг</p>
                </div>
              </div>

              {/* Кнопка лайка */}
              <Button
                onClick={handleLike}
                variant={isLiked ? "default" : "outline"}
                className="w-full mb-4"
              >
                <Heart className={`w-4 h-4 mr-2 ${isLiked ? 'fill-current' : ''}`} />
                {isLiked ? 'Лайкнуто' : 'Лайкнуть'}
              </Button>

              {/* Характер персонажа (если есть) */}
              {character.personality && character.personality.length > 0 && (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Характер</h3>
                    <div className="flex flex-wrap gap-1">
                      {character.personality.map((trait, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {trait}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </Card>
          </div>

          {/* Правая колонка - подробная информация */}
          <div className="lg:col-span-2 space-y-6">
            {/* Описание */}
            <Card className="p-6">
              <h2 className="text-2xl font-heading font-bold text-primary mb-4">
                О персонаже
              </h2>
              <div className="prose prose-sm max-w-none">
                <p className="text-muted-foreground leading-relaxed text-lg">
                  {character.description}
                </p>
              </div>
            </Card>

            {/* Сказки с участием персонажа */}
            <Card className="p-6">
              <h2 className="text-2xl font-heading font-bold text-primary mb-4">
                Сказки с участием {character.name}
              </h2>
              
              {character.stories && character.stories.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {character.stories
                    .filter(storyItem => storyItem.story.status === 'PUBLISHED')
                    .map((storyItem) => {
                      const story = storyItem.story;
                      return (
                        <Link key={story.id} to={`/story/${story.id}`}>
                          <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer group">
                            <div className="aspect-video relative overflow-hidden rounded-t-lg">
                              {story.image ? (
                                <img
                                  src={story.image}
                                  alt={story.title}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                              ) : (
                                <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                                  <BookOpen className="w-12 h-12 text-primary/50" />
                                </div>
                              )}
                              <div className="absolute top-2 right-2">
                                <Badge 
                                  variant="secondary" 
                                  className="text-xs"
                                  style={{ backgroundColor: story.category.color + '20', color: story.category.color }}
                                >
                                  {story.category.name}
                                </Badge>
                              </div>
                            </div>
                            <div className="p-4">
                              <h3 className="font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                                {story.title}
                              </h3>
                              <p className="text-sm text-muted-foreground mb-3 line-clamp-3">
                                {story.description}
                              </p>
                              <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {story.readTime}
                                </span>
                                <span>{story.ageGroup}</span>
                              </div>
                            </div>
                          </Card>
                        </Link>
                      );
                    })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-2">
                    В данный момент этот персонаж ещё не участвовал в сказках
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Сказки с участием {character.name} появятся здесь
                  </p>
                </div>
              )}
            </Card>
          </div>
        </div>
      </main>

      {/* Модальное окно для изображений */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Изображение персонажа</DialogTitle>
          </DialogHeader>
          {selectedImage && (
            <img
              src={selectedImage}
              alt="Персонаж"
              className="w-full h-auto rounded-lg"
            />
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default Character; 