import { useState, useEffect, useRef, useCallback } from "react";
import { debounce } from "lodash";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CharacterMultiSelect } from "@/components/CharacterMultiSelect";
import { 
  BookOpen, 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  Filter,
  Eye,
  Calendar,
  Clock,
  Heart,
  Star,
  ArrowLeft,
  Save,
  X,
  Upload,
  Image as ImageIcon,
  ArrowUp,
  ArrowDown
} from "lucide-react";
import storyService from "../services/storyService.js";
import categoryService from "../services/categoryService.js";
import uploadService from "../services/uploadService.js";
import illustrationService from "../services/illustrationService.js";
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
  is_new?: boolean;
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
}

interface Illustration {
  id?: string;
  imageUrl: string;
  position_horizontal: 'left' | 'right';
  position_vertical: 'top' | 'bottom';
  caption?: string;
  order?: number;
}

// Константы для ограничений
const MAX_ILLUSTRATIONS = 5;
const ILLUSTRATION_SIZE = {
  width: 300,
  height: 200
};

const AdminStories = () => {
  const { darkMode, toggleTheme } = useTheme();
  const [stories, setStories] = useState<Story[]>([]);
  const [categories, setCategories] = useState<Array<{id: string, name: string}>>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingStory, setEditingStory] = useState<Story | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Состояние для иллюстраций
  const [illustrations, setIllustrations] = useState<Illustration[]>([]);
  const [selectedIllustrationImage, setSelectedIllustrationImage] = useState<File | null>(null);
  const [illustrationImagePreview, setIllustrationImagePreview] = useState<string | null>(null);
  const [uploadingIllustration, setUploadingIllustration] = useState(false);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [rateLimitCountdown, setRateLimitCountdown] = useState(0);
  
  // Состояние для формы добавления иллюстрации
  const [illustrationForm, setIllustrationForm] = useState({
    position_horizontal: 'left' as 'left' | 'right',
    position_vertical: 'top' as 'top' | 'bottom',
    caption: ''
  });
  const illustrationFileInputRef = useRef<HTMLInputElement>(null);

  // Состояние для персонажей
  const [selectedCharacterIds, setSelectedCharacterIds] = useState<string[]>([]);

  // Функция загрузки данных
  const fetchData = async () => {
    try {
      setLoading(true);
      
      const [storiesResponse, categoriesResponse] = await Promise.all([
        storyService.getStories({ 
          limit: 50,
          sortBy: 'createdAt',
          sortOrder: 'desc'
          // Убираем параметр status полностью для админки
        }),
        categoryService.getCategories()
      ]);
      
      setStories(storiesResponse.data || []);
      setCategories(categoriesResponse.data || []);
    } catch (err) {
      setError('Ошибка при загрузке данных');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Загрузка историй и категорий при монтировании компонента
  useEffect(() => {
    fetchData();
  }, []);

  // Дебаунс для предотвращения частых запросов
  const debouncedFetchData = useCallback(
    debounce(async () => {
      await fetchData();
    }, 500),
    []
  );

  // Проверяем системные настройки темы при загрузке
  useEffect(() => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    // setDarkMode(prefersDark); // This line is removed as per the new_code
  }, []);

  // Переключение темы
  // const toggleTheme = () => { // This function is removed as per the new_code
  //   setDarkMode(!darkMode);
  // };

  // Применяем класс dark к body
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);



  // Отслеживаем rate limiting
  useEffect(() => {
    if (isRateLimited && rateLimitCountdown > 0) {
      const timer = setTimeout(() => {
        setRateLimitCountdown(prev => {
          if (prev <= 1) {
            setIsRateLimited(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [isRateLimited, rateLimitCountdown]);

  // Дебаунсированный поиск
  const debouncedSearch = useCallback(
    debounce((term: string) => {
      // Поиск будет реализован позже
    }, 300),
    []
  );

  const filteredStories = stories.filter(story => {
    const matchesSearch = story.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         story.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || story.category?.id === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const ageGroups = ["2-4 лет", "4-6 лет", "5-7 лет", "6-8 лет", "7-9 лет"];

  const handleDelete = async (id: string) => {
    if (confirm("Вы уверены, что хотите удалить эту сказку?")) {
      try {
        await storyService.deleteStory(id);
        setStories(stories.filter(story => story.id !== id));
      } catch (err) {
        console.error('Error deleting story:', err);
        alert('Ошибка при удалении сказки');
      }
    }
  };

  const handleEdit = async (story: Story) => {
    // Дебаунс для предотвращения частых переключений
    if (editingStory?.id === story.id) {
      return;
    }
    
    setEditingStory(story);
    setImagePreview(story.image || null);
    setSelectedImage(null);
    setShowAddForm(true);
    
    // Загружаем выбранных персонажей
    const characterIds = story.characters?.map(c => c.character.id) || [];
    setSelectedCharacterIds(characterIds);
    
    // Загружаем иллюстрации для сказки с задержкой
    setTimeout(async () => {
      try {
        const illustrationsResponse = await illustrationService.getStoryIllustrations(story.id);
        const loadedIllustrations = illustrationsResponse.data || [];
        setIllustrations(loadedIllustrations);
      } catch (error) {
        console.error('Error loading illustrations:', error);
        setIllustrations([]);
      }
    }, 100); // Задержка 100ms
    
    // Принудительно обновляем состояние изображения
    setTimeout(() => {
      if (story.image) {
        setImagePreview(story.image);
      }
    }, 50);
  };

  const handleSave = async (storyData: Partial<Story>) => {
    try {
      setSaving(true);
      
      // Если есть выбранное изображение, загружаем его
      let imageUrl = storyData.image;
      if (selectedImage) {
        try {
          setUploadingImage(true);
          const uploadResponse = await uploadService.uploadFile(selectedImage);
          imageUrl = uploadResponse.data.url;
        } catch (err) {
          console.error('Error uploading image:', err);
          alert('Ошибка при загрузке изображения: ' + err.message);
          return;
        } finally {
          setUploadingImage(false);
        }
      }

      const finalStoryData = {
        ...storyData,
        image: imageUrl,
        characterIds: selectedCharacterIds
      };

      // Обновляем превью изображения если оно было загружено
      if (imageUrl && imageUrl !== storyData.image) {
        setImagePreview(imageUrl);
      }

      let storyId: string;
      
      if (editingStory) {
        // Обновление существующей сказки
        await storyService.updateStory(editingStory.id, finalStoryData);
        storyId = editingStory.id;
        setStories(stories.map(story => 
          story.id === editingStory.id ? { ...story, ...finalStoryData } : story
        ));
        setEditingStory(null);
        alert('Сказка успешно обновлена!');
      } else {
        // Добавление новой сказки
        const createResponse = await storyService.createStory(finalStoryData);
        storyId = createResponse.data.id;
        // Перезагружаем данные с сервера
        await fetchData();
        alert('Сказка успешно создана!');
      }

      // Сохраняем иллюстрации с оптимизированными batch операциями
      if (illustrations.length > 0) {
        try {
          // Подготавливаем данные иллюстраций
          const preparedIllustrations = illustrations.map((illustration, index) => ({
            imageUrl: illustration.imageUrl,
            position_vertical: illustration.position_vertical,
            position_horizontal: illustration.position_horizontal,
            caption: illustration.caption,
            order: illustration.order || index + 1
          }));

          // Используем оптимизированный метод для замены иллюстраций
          const result = await illustrationService.replaceStoryIllustrations(storyId, preparedIllustrations);
          
          // После сохранения обновляем иллюстрации с полученными ID
          if (result.success) {
            // Принудительно загружаем обновленные иллюстрации с сервера
            try {
              const updatedIllustrationsResponse = await illustrationService.getStoryIllustrations(storyId);
              const updatedIllustrations = updatedIllustrationsResponse.data || [];
              
              // Обновляем состояние иллюстраций
              setIllustrations(updatedIllustrations);
              
            } catch (reloadError) {
              console.error('Error reloading illustrations:', reloadError);
            }
          }
        } catch (error) {
          console.error('Error saving illustrations:', error);
          alert('Сказка сохранена, но произошла ошибка при сохранении иллюстраций');
        }
      } else if (editingStory) {
        // Если иллюстраций нет, но редактируем сказку, удаляем все старые иллюстрации
        try {
          const existingIllustrations = await illustrationService.getStoryIllustrations(storyId);
          if (existingIllustrations.data && existingIllustrations.data.length > 0) {
            const deleteIds = existingIllustrations.data.map(ill => ill.id);
            await illustrationService.batchDeleteIllustrations(storyId, deleteIds);
            console.log('Old illustrations deleted successfully');
          }
        } catch (error) {
          console.error('Error deleting old illustrations:', error);
        }
      }
      
      // Очищаем состояние изображения
      setSelectedImage(null);
      setImagePreview(null);
      setSelectedCharacterIds([]);
      setShowAddForm(false);
      
      // НЕ очищаем иллюстрации здесь - они будут загружены при следующем редактировании
      // setIllustrations([]);
      
      // Принудительно обновляем данные
      setTimeout(() => {
        fetchData();
      }, 100);
    } catch (err: any) {
      console.error('Error saving story:', err);
      
      // Проверяем на rate limiting
      if (err.message?.includes('429') || err.message?.includes('Превышен лимит')) {
        setIsRateLimited(true);
        setRateLimitCountdown(30); // 30 секунд блокировки
        alert('Превышен лимит запросов. Подождите 30 секунд перед повторной попыткой.');
      } else {
        alert('Ошибка при сохранении сказки: ' + err.message);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Проверяем тип файла
      if (!file.type.startsWith('image/')) {
        alert('Пожалуйста, выберите изображение');
        return;
      }
      
      // Проверяем размер файла (5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Размер файла не должен превышать 5MB');
        return;
      }

      setSelectedImage(file);
      
      // Создаем превью
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUpload = () => {
    fileInputRef.current?.click();
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Функции для работы с иллюстрациями
  const handleIllustrationImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Файл слишком большой. Максимальный размер: 5MB');
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        alert('Пожалуйста, выберите изображение');
        return;
      }

      setSelectedIllustrationImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setIllustrationImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleIllustrationImageUpload = () => {
    illustrationFileInputRef.current?.click();
  };

  const removeIllustrationImage = () => {
    setSelectedIllustrationImage(null);
    setIllustrationImagePreview(null);
    // Сбрасываем форму к значениям по умолчанию
    setIllustrationForm({
      position_horizontal: 'left',
      position_vertical: 'top',
      caption: ''
    });
  };

  const addIllustration = async () => {
    if (!selectedIllustrationImage) {
      alert('Пожалуйста, выберите изображение');
      return;
    }

    // Проверяем лимит иллюстраций
    if (illustrations.length >= MAX_ILLUSTRATIONS) {
      alert(`Можно добавить не более ${MAX_ILLUSTRATIONS} иллюстраций к одной сказке`);
      return;
    }

    try {
      setUploadingIllustration(true);
      const uploadResponse = await uploadService.uploadFile(selectedIllustrationImage);
      
      // Используем значения из состояния формы
      const { position_horizontal, position_vertical, caption } = illustrationForm;
      
      const newIllustration: Illustration = {
        id: `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, // Временный ID
        imageUrl: uploadResponse.data.url,
        position_vertical,
        position_horizontal,
        caption: caption.trim() || undefined,
        order: illustrations.length + 1
      };



      setIllustrations([...illustrations, newIllustration]);
      setSelectedIllustrationImage(null);
      setIllustrationImagePreview(null);
      
      // Сбрасываем форму к значениям по умолчанию
      setIllustrationForm({
        position_horizontal: 'left',
        position_vertical: 'top',
        caption: ''
      });
    } catch (err: any) {
      alert('Ошибка при загрузке изображения: ' + err.message);
    } finally {
      setUploadingIllustration(false);
    }
  };

  const updateIllustration = (index: number, field: keyof Illustration, value: any) => {
    const updatedIllustrations = [...illustrations];
    // Если поле caption и значение пустая строка, устанавливаем undefined
    const finalValue = field === 'caption' && value === '' ? undefined : value;
    updatedIllustrations[index] = { ...updatedIllustrations[index], [field]: finalValue };
    setIllustrations(updatedIllustrations);
  };

  const removeIllustration = async (index: number) => {
    const illustrationToRemove = illustrations[index];
    
    // Если иллюстрация уже сохранена в базе (имеет id и не временная), удаляем её из базы
    if (illustrationToRemove.id && !illustrationToRemove.id.startsWith('temp_') && editingStory) {
      let retryCount = 0;
      const maxRetries = 3;
      
      while (retryCount < maxRetries) {
        try {
          await illustrationService.deleteStoryIllustration(editingStory.id, illustrationToRemove.id);
          // Добавляем небольшую задержку после удаления
          await new Promise(resolve => setTimeout(resolve, 100));
          break; // Успешно удалено
        } catch (error) {
          retryCount++;
          console.error(`Error deleting illustration from database (attempt ${retryCount}):`, error);
          
          if (retryCount >= maxRetries) {
            console.error(`Failed to delete illustration after ${maxRetries} attempts`);
            // Показываем пользователю ошибку
            alert(`Не удалось удалить иллюстрацию из базы данных: ${error.message}`);
          } else {
            // Ждем перед повторной попыткой
            await new Promise(resolve => setTimeout(resolve, 200 * retryCount));
          }
        }
      }
    } else {
      console.log('Illustration has no ID, removing from local state only');
    }

    // Удаляем иллюстрацию из локального состояния в любом случае
    const updatedIllustrations = illustrations.filter((_, i) => i !== index);
    // Обновляем порядок
    updatedIllustrations.forEach((ill, i) => {
      ill.order = i + 1;
    });
    setIllustrations(updatedIllustrations);
  };

  const moveIllustration = (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === illustrations.length - 1)) {
      return;
    }

    const updatedIllustrations = [...illustrations];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    
    [updatedIllustrations[index], updatedIllustrations[newIndex]] = 
    [updatedIllustrations[newIndex], updatedIllustrations[index]];
    
    // Обновляем порядок
    updatedIllustrations.forEach((ill, i) => {
      ill.order = i + 1;
    });
    
    setIllustrations(updatedIllustrations);
  };

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      <Header darkMode={darkMode} onThemeToggle={toggleTheme} />
      
      <main>
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              {/* Rate Limiting предупреждение */}
              {isRateLimited && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    <p className="text-sm text-red-800">
                      Превышен лимит запросов. Подождите {rateLimitCountdown} секунд перед повторной попыткой.
                    </p>
                  </div>
                </div>
              )}

              {/* Заголовок и навигация */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <Link 
                    to="/admin" 
                    className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors font-body"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Назад к админке
                  </Link>
                  <div>
                    <h1 className="text-3xl font-heading font-bold text-foreground">
                      Управление сказками
                    </h1>
                    <p className="text-muted-foreground font-body">
                      Всего сказок: {loading ? '...' : stories.length}
                    </p>
                  </div>
                </div>
                <Button 
                  className="magic-button group"
                  onClick={() => setShowAddForm(true)}
                  disabled={isRateLimited}
                >
                  <Plus className="w-5 h-5 mr-2 group-hover:animate-gentle-bounce" />
                  Добавить сказку
                </Button>
              </div>

              {/* Фильтры и поиск */}
              <Card className="p-6 mb-8 bg-card border border-primary/10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Поиск сказок..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-3 py-2 border border-input rounded-md bg-background text-foreground"
                  >
                    <option value="all">Все категории</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Filter className="w-4 h-4" />
                    Фильтры
                  </Button>
                </div>
              </Card>

              {/* Список сказок */}
              {loading ? (
                <div className="text-center py-12">
                  <p className="text-lg text-muted-foreground">Загрузка историй...</p>
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <p className="text-lg text-red-500">{error}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredStories.map((story) => (
                    <Card key={story.id} className="bg-card border border-primary/10 hover:shadow-glow transition-all duration-300">
                      <div className="relative h-48 mb-4 rounded-t-lg overflow-hidden">
                        <img
                          src={story.image || "/placeholder.svg"}
                          alt={story.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2 right-2 flex gap-1">
                          <Badge variant={story.status === 'PUBLISHED' ? 'default' : 'secondary'}>
                            {story.status === 'PUBLISHED' ? 'Опубликовано' : 'Черновик'}
                          </Badge>
                          {story.isNew && (
                            <Badge variant="destructive">Новинка</Badge>
                          )}
                        </div>
                      </div>

                      <div className="p-4">
                        <h3 className="text-lg font-heading font-semibold text-foreground mb-2">
                          {story.title}
                        </h3>
                        <p className="text-muted-foreground font-body text-sm mb-3 line-clamp-2">
                          {story.description}
                        </p>

                        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {story.readTime}
                          </div>
                          <div className="flex items-center gap-1">
                            <Heart className="w-3 h-3" />
                            {story.totalLikes}
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3" />
                            {story.averageRating.toFixed(1)}
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-1 mb-4">
                          <Badge variant="outline" className="text-xs">
                            {story.category?.name || 'Без категории'}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {story.ageGroup}
                          </Badge>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(story)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(story.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                          <Link to={`/story/${story.id}`}>
                            <Button variant="outline" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
              
              {!loading && !error && filteredStories.length === 0 && (
                <div className="text-center py-12">
                  <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Сказки не найдены</h3>
                  <p className="text-muted-foreground">
                    {searchTerm ? "Попробуйте изменить поисковый запрос" : "Добавьте первую сказку"}
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Модальное окно добавления/редактирования */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-heading font-bold text-foreground">
                    {editingStory ? 'Редактировать сказку' : 'Добавить новую сказку'}
                  </h2>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setShowAddForm(false);
                      setEditingStory(null);
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="title">Название сказки</Label>
                      <Input
                        id="title"
                        defaultValue={editingStory?.title}
                        placeholder="Введите название сказки"
                      />
                    </div>

                    <div>
                      <Label htmlFor="description">Краткое описание</Label>
                      <Textarea
                        id="description"
                        defaultValue={editingStory?.description}
                        placeholder="Краткое описание сказки"
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label htmlFor="content">Полный текст сказки</Label>
                      <Textarea
                        id="content"
                        defaultValue={editingStory?.content}
                        placeholder="Полный текст сказки с HTML разметкой"
                        rows={10}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                                             <div>
                         <Label htmlFor="category">Категория</Label>
                         <select
                           id="category"
                           defaultValue={editingStory?.category?.id || ""}
                           className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
                         >
                           <option value="">Выберите категорию</option>
                           {categories.map(category => (
                             <option key={category.id} value={category.id}>{category.name}</option>
                           ))}
                         </select>
                       </div>

                       <div>
                         <Label htmlFor="ageGroup">Возрастная группа</Label>
                         <select
                           id="ageGroup"
                           defaultValue={editingStory?.ageGroup || "4-6 лет"}
                           className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
                         >
                           {ageGroups.map(age => (
                             <option key={age} value={age}>{age}</option>
                           ))}
                         </select>
                       </div>
                    </div>

                    <div>
                      <Label htmlFor="author">Автор</Label>
                      <Input
                        id="author"
                        defaultValue={editingStory?.author?.email}
                        placeholder="Автор сказки"
                        disabled
                      />
                    </div>

                                         <div>
                       <Label htmlFor="readTime">Время чтения</Label>
                       <Input
                         id="readTime"
                         defaultValue={editingStory?.readTime || "5 мин"}
                         placeholder="5 мин"
                       />
                     </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label>Обложка сказки</Label>
                      <div className="mt-2 border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                        {imagePreview ? (
                          <div className="space-y-4">
                            <img 
                              src={imagePreview} 
                              alt="Preview" 
                              className="w-32 h-32 object-cover rounded-lg mx-auto"
                            />
                            <div className="flex gap-2 justify-center">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={handleImageUpload}
                                disabled={uploadingImage}
                              >
                                <Upload className="w-4 h-4 mr-2" />
                                {uploadingImage ? 'Загрузка...' : 'Изменить'}
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={removeImage}
                                disabled={uploadingImage}
                              >
                                <X className="w-4 h-4 mr-2" />
                                Удалить
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <ImageIcon className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                            <Button 
                              variant="outline" 
                              className="mb-2"
                              onClick={handleImageUpload}
                              disabled={uploadingImage}
                            >
                              <Upload className="w-4 h-4 mr-2" />
                              {uploadingImage ? 'Загрузка...' : 'Загрузить изображение'}
                            </Button>
                            <p className="text-sm text-muted-foreground">
                              PNG, JPG до 5MB
                            </p>
                          </>
                        )}
                      </div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageSelect}
                        className="hidden"
                      />
                    </div>

                    <div>
                      <Label htmlFor="characters">Персонажи</Label>
                      <CharacterMultiSelect
                        value={selectedCharacterIds}
                        onChange={setSelectedCharacterIds}
                        placeholder="Выберите персонажей сказки..."
                      />
                    </div>

                    <div>
                      <Label htmlFor="status">Статус</Label>
                      <select
                        id="status"
                        defaultValue={editingStory?.status || 'DRAFT'}
                        className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
                      >
                        <option value="DRAFT">Черновик</option>
                        <option value="PUBLISHED">Опубликовано</option>
                        <option value="ARCHIVED">Архив</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="is_new"
                        defaultChecked={editingStory?.is_new}
                        className="rounded"
                      />
                      <Label htmlFor="is_new">Отметить как новинку</Label>
                    </div>
                  </div>
                </div>

                {/* Секция иллюстраций */}
                <div className="mt-6 pt-6 border-t">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <Label className="text-lg font-semibold">Иллюстрации к сказке</Label>
                      <p className="text-sm text-muted-foreground">
                        {illustrations.length} из {MAX_ILLUSTRATIONS} иллюстраций
                      </p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleIllustrationImageUpload}
                      disabled={uploadingIllustration || illustrations.length >= MAX_ILLUSTRATIONS}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {uploadingIllustration ? 'Загрузка...' : 'Добавить иллюстрацию'}
                    </Button>
                  </div>

                  {/* Уведомление о лимите */}
                  {illustrations.length >= MAX_ILLUSTRATIONS && (
                    <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                      <p className="text-sm text-yellow-800">
                        Достигнут лимит иллюстраций ({MAX_ILLUSTRATIONS}). Удалите одну из существующих иллюстраций, чтобы добавить новую.
                      </p>
                    </div>
                  )}

                  {/* Загрузка новой иллюстрации */}
                  {illustrationImagePreview && (
                    <Card className="p-4 mb-4">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <img 
                            src={illustrationImagePreview} 
                            alt="Preview" 
                            className="w-24 h-16 object-cover rounded border"
                            style={{
                              width: ILLUSTRATION_SIZE.width / 4,
                              height: ILLUSTRATION_SIZE.height / 4
                            }}
                          />
                          <div className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs px-1 rounded">
                            {ILLUSTRATION_SIZE.width}x{ILLUSTRATION_SIZE.height}
                          </div>
                        </div>
                        <div className="flex-1 space-y-3">
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <Label>Горизонтальное положение</Label>
                              <select
                                value={illustrationForm.position_horizontal}
                                onChange={(e) => setIllustrationForm(prev => ({
                                  ...prev,
                                  position_horizontal: e.target.value as 'left' | 'right'
                                }))}
                                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground mt-1"
                              >
                                <option value="left">Слева</option>
                                <option value="right">Справа</option>
                              </select>
                            </div>
                            <div>
                              <Label>Вертикальное положение</Label>
                              <select
                                value={illustrationForm.position_vertical}
                                onChange={(e) => setIllustrationForm(prev => ({
                                  ...prev,
                                  position_vertical: e.target.value as 'top' | 'bottom'
                                }))}
                                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground mt-1"
                              >
                                <option value="top">Сверху</option>
                                <option value="bottom">Снизу</option>
                              </select>
                            </div>
                          </div>
                          
                          {/* Интерактивная мини-сетка для выбора позиции */}
                          <div className="mt-4">
                            <Label className="block mb-2">Выберите позицию</Label>
                            <div className="grid grid-cols-2 gap-2 w-32 h-32">
                              {/* Top-Left */}
                              <button
                                type="button"
                                onClick={() => setIllustrationForm(prev => ({
                                  ...prev,
                                  position_vertical: 'top',
                                  position_horizontal: 'left'
                                }))}
                                className={`p-2 text-xs border rounded transition-colors ${
                                  illustrationForm.position_vertical === 'top' && illustrationForm.position_horizontal === 'left'
                                    ? 'bg-primary text-primary-foreground border-primary'
                                    : 'bg-background border-input hover:bg-accent'
                                }`}
                                aria-label="Позиция: сверху слева"
                              >
                                TL
                              </button>
                              
                              {/* Top-Right */}
                              <button
                                type="button"
                                onClick={() => setIllustrationForm(prev => ({
                                  ...prev,
                                  position_vertical: 'top',
                                  position_horizontal: 'right'
                                }))}
                                className={`p-2 text-xs border rounded transition-colors ${
                                  illustrationForm.position_vertical === 'top' && illustrationForm.position_horizontal === 'right'
                                    ? 'bg-primary text-primary-foreground border-primary'
                                    : 'bg-background border-input hover:bg-accent'
                                }`}
                                aria-label="Позиция: сверху справа"
                              >
                                TR
                              </button>
                              
                              {/* Bottom-Left */}
                              <button
                                type="button"
                                onClick={() => setIllustrationForm(prev => ({
                                  ...prev,
                                  position_vertical: 'bottom',
                                  position_horizontal: 'left'
                                }))}
                                className={`p-2 text-xs border rounded transition-colors ${
                                  illustrationForm.position_vertical === 'bottom' && illustrationForm.position_horizontal === 'left'
                                    ? 'bg-primary text-primary-foreground border-primary'
                                    : 'bg-background border-input hover:bg-accent'
                                }`}
                                aria-label="Позиция: снизу слева"
                              >
                                BL
                              </button>
                              
                              {/* Bottom-Right */}
                              <button
                                type="button"
                                onClick={() => setIllustrationForm(prev => ({
                                  ...prev,
                                  position_vertical: 'bottom',
                                  position_horizontal: 'right'
                                }))}
                                className={`p-2 text-xs border rounded transition-colors ${
                                  illustrationForm.position_vertical === 'bottom' && illustrationForm.position_horizontal === 'right'
                                    ? 'bg-primary text-primary-foreground border-primary'
                                    : 'bg-background border-input hover:bg-accent'
                                }`}
                                aria-label="Позиция: снизу справа"
                              >
                                BR
                              </button>
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">
                              T = Top (сверху), B = Bottom (снизу), L = Left (слева), R = Right (справа)
                            </p>
                          </div>
                          <div>
                            <Label>Подпись (необязательно)</Label>
                            <Input
                              value={illustrationForm.caption}
                              onChange={(e) => setIllustrationForm(prev => ({
                                ...prev,
                                caption: e.target.value
                              }))}
                              placeholder="Краткое описание иллюстрации"
                              className="mt-1"
                            />
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={addIllustration}
                            disabled={uploadingIllustration}
                          >
                            Добавить
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={removeIllustrationImage}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  )}

                  {/* Список иллюстраций */}
                  {illustrations.length > 0 && (
                    <div className="space-y-4">
                      {illustrations.map((illustration, index) => (
                        <Card key={index} className="p-4">
                          <div className="flex items-start gap-4">
                            <div className="relative">
                              <img 
                                src={illustration.imageUrl} 
                                alt={`Illustration ${index + 1}`} 
                                className="object-cover rounded border"
                                style={{
                                  width: ILLUSTRATION_SIZE.width / 3,
                                  height: ILLUSTRATION_SIZE.height / 3
                                }}
                              />
                              <div className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs px-1 rounded">
                                {index + 1}
                              </div>
                            </div>
                            <div className="flex-1 space-y-3">
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <Label>Горизонтальное положение</Label>
                                  <select
                                    value={illustration.position_horizontal}
                                    onChange={(e) => {
                                      const position_horizontal = e.target.value as 'left' | 'right';
                                      updateIllustration(index, 'position_horizontal', position_horizontal);
                                    }}
                                    className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground mt-1"
                                  >
                                    <option value="left">Слева</option>
                                    <option value="right">Справа</option>
                                  </select>
                                </div>
                                <div>
                                  <Label>Вертикальное положение</Label>
                                  <select
                                    value={illustration.position_vertical}
                                    onChange={(e) => {
                                      const position_vertical = e.target.value as 'top' | 'bottom';
                                      updateIllustration(index, 'position_vertical', position_vertical);
                                    }}
                                    className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground mt-1"
                                  >
                                    <option value="top">Сверху</option>
                                    <option value="bottom">Снизу</option>
                                  </select>
                                </div>
                              </div>
                              <div>
                                <Label>Подпись (необязательно)</Label>
                                <Input
                                  value={illustration.caption || ''}
                                  onChange={(e) => {
                                    const value = e.target.value.trim();
                                    updateIllustration(index, 'caption', value === '' ? undefined : value);
                                  }}
                                  placeholder="Краткое описание иллюстрации (необязательно)"
                                  className="mt-1"
                                />
                              </div>
                              <div className="flex items-center gap-2">
                                <Label className="text-sm">Порядок:</Label>
                                <div className="flex gap-1">
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => moveIllustration(index, 'up')}
                                    disabled={index === 0}
                                  >
                                    ↑
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => moveIllustration(index, 'down')}
                                    disabled={index === illustrations.length - 1}
                                  >
                                    ↓
                                  </Button>
                                </div>
                                <span className="text-sm text-muted-foreground">
                                  {index + 1} из {illustrations.length}
                                </span>
                              </div>
                            </div>
                            <div className="flex flex-col gap-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => removeIllustration(index)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}

                  <input
                    ref={illustrationFileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleIllustrationImageSelect}
                    className="hidden"
                  />
                </div>

                <div className="flex items-center justify-end gap-4 mt-6 pt-6 border-t">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowAddForm(false);
                      setEditingStory(null);
                      setSelectedImage(null);
                      setImagePreview(null);
                      setIllustrations([]);
                      setSelectedCharacterIds([]);
                    }}
                  >
                    Отмена
                  </Button>
                  <Button 
                    className="magic-button"
                    disabled={saving}
                    onClick={() => {
                      // Собираем данные из формы
                      const title = (document.getElementById('title') as HTMLInputElement)?.value;
                      const description = (document.getElementById('description') as HTMLTextAreaElement)?.value;
                      const content = (document.getElementById('content') as HTMLTextAreaElement)?.value;
                      const categoryId = (document.getElementById('category') as HTMLSelectElement)?.value;
                      const ageGroup = (document.getElementById('ageGroup') as HTMLSelectElement)?.value;
                      const readTime = (document.getElementById('readTime') as HTMLInputElement)?.value;
                      const status = (document.getElementById('status') as HTMLSelectElement)?.value as 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
                      const is_new = (document.getElementById('is_new') as HTMLInputElement)?.checked;

                      // Валидация
                      if (!title || title.trim().length < 3) {
                        alert('Название сказки должно содержать минимум 3 символа');
                        return;
                      }

                      if (!description || description.trim().length < 10) {
                        alert('Описание должно содержать минимум 10 символов');
                        return;
                      }

                      if (!content || content.trim().length < 50) {
                        alert('Содержание сказки должно содержать минимум 50 символов');
                        return;
                      }

                      if (!categoryId) {
                        alert('Выберите категорию');
                        return;
                      }

                      if (!ageGroup) {
                        alert('Выберите возрастную группу');
                        return;
                      }

                      if (!readTime) {
                        alert('Укажите время чтения');
                        return;
                      }

                      const formData = {
                        title: title.trim(),
                        description: description.trim(),
                        content: content.trim(),
                        categoryId,
                        ageGroup,
                        readTime: readTime.trim(),
                        status,
                        is_new
                      };

                      handleSave(formData);
                    }}
                  >
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        {editingStory ? 'Сохранение...' : 'Создание...'}
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        {editingStory ? 'Сохранить изменения' : 'Добавить сказку'}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default AdminStories; 