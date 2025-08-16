import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import StoryContent from "../components/StoryContent";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Heart, 
  Star, 
  Clock, 
  BookOpen, 
  ArrowLeft, 
  Play, 
  Pause,
  Volume2,
  VolumeX,
  SkipBack,
  SkipForward,
  RotateCcw
} from "lucide-react";
import storyService from "../services/storyService.js";
import { useTheme } from "@/hooks/use-theme";

interface Story {
  id: string;
  title: string;
  description: string;
  content: string;
  readTime: string;
  totalLikes: number;
  averageRating: number;
  image?: string;
  isNew?: boolean;
  category?: {
    id: string;
    name: string;
    color: string;
  };
  ageGroup: string;
  author?: {
    id: string;
    email: string;
  };
  createdAt: string;
  characters?: Array<{
    character: {
      id: string;
      name: string;
      image?: string;
    };
  }>;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  illustrations?: Array<{
    id: string;
    imageUrl: string;
    position_horizontal: 'left' | 'right';
    position_vertical: 'top' | 'bottom';
    caption?: string;
    order: number;
  }>;
  audio?: {
    url: string;
    duration: number;
  };
}

const Story = () => {
  const { id } = useParams();
  const { darkMode, toggleTheme } = useTheme();
  const [story, setStory] = useState<Story | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

  // Загружаем сказку из API
  useEffect(() => {
    const fetchStory = async () => {
      try {
        setLoading(true);
        const response = await storyService.getStory(id!);
        setStory(response.data || response);
        setError(null);
      } catch (err) {
        console.error('Error loading story:', err);
        setError('Не удалось загрузить сказку');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchStory();
    }
  }, [id]);

  const handleLike = async () => {
    if (!story) return;
    
    try {
      if (isLiked) {
        await storyService.unlikeStory(story.id);
      } else {
        await storyService.likeStory(story.id);
      }
      setIsLiked(!isLiked);
    } catch (err) {
      console.error('Error toggling like:', err);
    }
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderContentWithIllustrations = () => {
    if (!story) return null;
    
    return (
      <StoryContent
        content={story.content}
        illustrations={story.illustrations || []}
        className="mb-8"
      />
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background transition-colors duration-300">
        <Header darkMode={darkMode} onThemeToggle={toggleTheme} />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground mt-4">Загружаем сказку...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !story) {
    return (
      <div className="min-h-screen bg-background transition-colors duration-300">
        <Header darkMode={darkMode} onThemeToggle={toggleTheme} />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <p className="text-destructive mb-4">{error || 'Сказка не найдена'}</p>
            <Link to="/stories">
              <Button>Вернуться к сказкам</Button>
            </Link>
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
          <Link to="/stories">
            <Button variant="ghost" className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Назад к сказкам
            </Button>
          </Link>
        </div>

        {/* Основная информация о сказке */}
        <div className="max-w-4xl mx-auto">
          {/* Заголовок */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-heading font-bold text-primary mb-4">
              {story.title}
            </h1>
          </div>

          {/* Обложка и описание */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Обложка */}
            {story.image && (
              <div className="order-1 lg:order-1">
                <img
                  src={story.image}
                  alt={story.title}
                  className="w-full h-96 object-cover rounded-2xl shadow-lg"
                />
              </div>
            )}

            {/* Описание и метаданные */}
            <div className="order-2 lg:order-2 space-y-6">
              {/* Описание */}
              <div>
                <h2 className="text-xl font-semibold text-foreground mb-3">Описание</h2>
                <p className="text-muted-foreground leading-relaxed">
                  {story.description}
                </p>
              </div>

              {/* Метаданные */}
              <div className="space-y-4">
                {/* Категория */}
                {story.category && (
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant="secondary" 
                      style={{ backgroundColor: story.category.color }}
                      className="text-white"
                    >
                      {story.category.name}
                    </Badge>
                  </div>
                )}

                {/* Возрастная группа */}
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Возраст: {story.ageGroup}
                  </span>
                </div>

                {/* Время чтения */}
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Время чтения: {story.readTime}
                  </span>
                </div>

                {/* Дата создания */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    Создано: {new Date(story.createdAt).toLocaleDateString('ru-RU')}
                  </span>
                </div>
              </div>

              {/* Кнопки действий */}
              <div className="flex gap-3 pt-4">
                <Button 
                  onClick={handleLike}
                  variant={isLiked ? "default" : "outline"}
                  className="flex items-center gap-2"
                >
                  <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                  {isLiked ? 'Нравится' : 'Нравится'}
                </Button>

                {story.audio && (
                  <Button 
                    onClick={handlePlayPause}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    {isPlaying ? 'Пауза' : 'Слушать'}
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Аудиоплеер */}
          {story.audio && (
            <Card className="p-6 mb-8">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">Аудиоверсия</h3>
                
                {/* Прогресс-бар */}
                <div className="space-y-2">
                  <Progress value={(currentTime / duration) * 100} className="w-full" />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                </div>

                {/* Контролы */}
                <div className="flex items-center justify-center gap-4">
                  <Button variant="ghost" size="sm">
                    <SkipBack className="w-4 h-4" />
                  </Button>
                  
                  <Button variant="ghost" size="sm">
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                  
                  <Button variant="ghost" size="sm">
                    <SkipForward className="w-4 h-4" />
                  </Button>
                </div>

                {/* Громкость */}
                <div className="flex items-center gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setIsMuted(!isMuted)}
                  >
                    {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </Button>
                  <Progress value={isMuted ? 0 : 100} className="w-24" />
                </div>
              </div>
            </Card>
          )}

          {/* Персонажи */}
          {story.characters && story.characters.length > 0 && (
            <Card className="p-6 mb-8">
              <h3 className="text-lg font-semibold text-foreground mb-4">Персонажи</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {story.characters.map((char) => (
                  <div key={char.character.id} className="text-center">
                    {char.character.image ? (
                      <img
                        src={char.character.image}
                        alt={char.character.name}
                        className="w-16 h-16 rounded-full mx-auto mb-2 object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full mx-auto mb-2 bg-muted flex items-center justify-center">
                        <BookOpen className="w-8 h-8 text-muted-foreground" />
                      </div>
                    )}
                    <p className="text-sm font-medium text-foreground">
                      {char.character.name}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Контент сказки с иллюстрациями */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-6">Сказка</h3>
            {renderContentWithIllustrations()}
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Story;
