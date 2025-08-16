import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save,
  X,
  Tag,
  RefreshCw
} from "lucide-react";
import categoryService from "../services/categoryService.js";
import { useTheme } from "@/hooks/use-theme";

interface Category {
  id: string;
  name: string;
  description: string;
  color: string;
  createdAt: string;
}

export default function AdminCategories() {
  const { darkMode, toggleTheme } = useTheme();
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#3b82f6'
  });

  // Загружаем категории
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await categoryService.getCategories();
      setCategories(response.data || []);
    } catch (err) {
      console.error('Error loading categories:', err);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить категории",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingCategory) {
        await categoryService.updateCategory(editingCategory.id, formData);
        toast({
          title: "Успех",
          description: "Категория успешно обновлена"
        });
      } else {
        await categoryService.createCategory(formData);
        toast({
          title: "Успех",
          description: "Категория успешно создана"
        });
      }
      
      // Принудительно обновляем список категорий
      await fetchCategories();
      
      // Сбрасываем форму
      setFormData({ name: '', description: '', color: '#3b82f6' });
      setEditingCategory(null);
      setShowForm(false);
    } catch (err) {
      console.error('Error saving category:', err);
      toast({
        title: "Ошибка",
        description: err.response?.data?.error || "Не удалось сохранить категорию",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description,
      color: category.color
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Вы уверены, что хотите удалить эту категорию?')) {
      try {
        await categoryService.deleteCategory(id);
        setCategories(categories.filter(cat => cat.id !== id));
        toast({
          title: "Успех",
          description: "Категория успешно удалена"
        });
      } catch (err) {
        console.error('Error deleting category:', err);
        toast({
          title: "Ошибка",
          description: err.response?.data?.error || "Не удалось удалить категорию",
          variant: "destructive"
        });
      }
    }
  };

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      <Header darkMode={darkMode} onThemeToggle={toggleTheme} />
      
      <main className="container mx-auto px-4 py-8">
        {/* Заголовок */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-heading font-bold text-primary mb-2">
              Управление категориями
            </h1>
            <p className="text-muted-foreground">
              Создавайте и редактируйте категории для сказок
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Добавить категорию
            </Button>
            <Button 
              variant="outline" 
              onClick={fetchCategories} 
              disabled={loading}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Обновить
            </Button>
          </div>
        </div>

        {/* Форма добавления/редактирования */}
        {showForm && (
          <Card className="p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-foreground">
                {editingCategory ? 'Редактировать категорию' : 'Новая категория'}
              </h2>
              <Button variant="ghost" size="sm" onClick={() => {
                setShowForm(false);
                setEditingCategory(null);
                setFormData({ name: '', description: '', color: '#3b82f6' });
              }}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Название</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Введите название категории"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="color">Цвет</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="color"
                      type="color"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      className="w-16 h-10"
                    />
                    <Input
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      placeholder="#3b82f6"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Описание</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Краткое описание категории"
                  rows={3}
                />
              </div>

              <div className="flex items-center gap-2">
                <Button type="submit" className="flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  {editingCategory ? 'Сохранить' : 'Создать'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    setEditingCategory(null);
                    setFormData({ name: '', description: '', color: '#3b82f6' });
                  }}
                >
                  Отмена
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Список категорий */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground mt-4">Загружаем категории...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => (
              <Card key={category.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-8 h-8 rounded-full"
                      style={{ backgroundColor: category.color }}
                    ></div>
                    <div>
                      <h3 className="font-semibold text-foreground">
                        {category.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {category.description}
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {new Date(category.createdAt).toLocaleDateString()}
                  </Badge>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(category)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(category.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {!loading && categories.length === 0 && (
          <div className="text-center py-12">
            <Tag className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Категории не найдены
            </h3>
            <p className="text-muted-foreground">
              Создайте первую категорию для сказок
            </p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
} 