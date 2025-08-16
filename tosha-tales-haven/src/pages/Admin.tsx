import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import MetricsCard from "@/components/MetricsCard";
import AdminSectionCard from "@/components/AdminSectionCard";
import MetricsNotification from "@/components/MetricsNotification";
import { 
  BookOpen, 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  Settings, 
  BarChart3,
  Shield,
  Database,
  Upload,
  Tag,
  Image,
  FileText,
  LogOut,
  RefreshCw
} from "lucide-react";
import authService from "../services/authService.js";
import { useTheme } from "@/hooks/use-theme";
import { useLiveMetrics } from "@/hooks/useLiveMetrics";

const Admin = () => {
  const { darkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [previousMetrics, setPreviousMetrics] = useState<Record<string, number>>({});
  const [showNotification, setShowNotification] = useState(false);
  
  const { 
    metrics, 
    loading, 
    refreshing, 
    refreshMetrics,
    isAutoRefreshActive,
    pauseAutoRefresh,
    resumeAutoRefresh
  } = useLiveMetrics({
    autoRefresh: true,
    refreshInterval: 30000, // 30 секунд
    onMetricsUpdate: (newMetrics) => {
      // Сравниваем с предыдущими метриками
      const hasChanges = Object.keys(newMetrics).some(key => 
        newMetrics[key as keyof typeof newMetrics] !== previousMetrics[key]
      );
      
      if (hasChanges && Object.keys(previousMetrics).length > 0) {
        setShowNotification(true);
      }
      
      setPreviousMetrics(newMetrics);
      console.log('Metrics updated:', newMetrics);
    }
  });

  // Функция выхода
  const handleLogout = async () => {
    try {
      await authService.logout();
      navigate('/admin/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Даже если ошибка, очищаем localStorage и перенаправляем
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      navigate('/admin/login');
    }
  };

  const adminSections = [
    {
      id: "stories",
      title: "Сказки",
      description: "Управление сказками и их содержанием",
      icon: BookOpen,
      href: "/admin/stories",
      color: "bg-blue-500",
      stats: `${metrics.stories} активных`,
      count: metrics.stories
    },
    {
      id: "characters",
      title: "Персонажи",
      description: "Создание и редактирование персонажей",
      icon: Users,
      href: "/admin/characters",
      color: "bg-green-500",
      stats: `${metrics.characters} персонажей`,
      count: metrics.characters
    },
    {
      id: "categories",
      title: "Категории",
      description: "Управление категориями сказок",
      icon: Tag,
      href: "/admin/categories",
      color: "bg-purple-500",
      stats: `${metrics.categories} категорий`,
      count: metrics.categories
    },
    {
      id: "roles",
      title: "Роли",
      description: "Управление ролями персонажей",
      icon: Shield,
      href: "/admin/roles",
      color: "bg-orange-500",
      stats: `${metrics.roles} ролей`,
      count: metrics.roles
    },
    {
      id: "media",
      title: "Медиа",
      description: "Управление изображениями и файлами",
      icon: Upload,
      href: "/admin/media",
      color: "bg-pink-500",
      stats: `${metrics.media} файлов`,
      count: metrics.media
    },
    {
      id: "analytics",
      title: "Аналитика",
      description: "Статистика и отчеты",
      icon: BarChart3,
      href: "/admin/analytics",
      color: "bg-indigo-500",
      stats: "Просмотр данных",
      count: 0
    }
  ];

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      <Header darkMode={darkMode} onThemeToggle={toggleTheme} />
      
      <main className="container mx-auto px-4 py-8">
        {/* Заголовок админки */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-heading font-bold text-primary mb-4">
            Панель администратора
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Управление контентом сайта "Сказки про Крокодила Тошу"
          </p>
        </div>

        {/* Уведомления об изменениях */}
        {showNotification && (
          <MetricsNotification
            previousMetrics={previousMetrics}
            currentMetrics={metrics}
            onClose={() => setShowNotification(false)}
          />
        )}

        {/* Кнопка обновления метрик */}
        <div className="flex justify-end mb-6 gap-2">
          <Button 
            variant="outline" 
            onClick={refreshMetrics}
            disabled={refreshing}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Обновление...' : 'Обновить метрики'}
          </Button>
          
          <Button 
            variant={isAutoRefreshActive ? "default" : "outline"}
            onClick={isAutoRefreshActive ? pauseAutoRefresh : resumeAutoRefresh}
            className="flex items-center gap-2"
          >
            <div className={`w-2 h-2 rounded-full ${isAutoRefreshActive ? 'bg-green-500' : 'bg-gray-400'}`} />
            {isAutoRefreshActive ? 'Автообновление' : 'Включить авто'}
          </Button>
        </div>

        {/* Секции админки */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {adminSections.map((section) => (
            <AdminSectionCard
              key={section.id}
              {...section}
              loading={loading}
            />
          ))}
        </div>

        {/* Быстрые действия */}
        <div className="mt-12">
          <h2 className="text-2xl font-heading font-bold text-primary mb-6">
            Быстрые действия
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Добавить сказку
            </Button>
            
            <Button variant="outline" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Создать персонажа
            </Button>
            
            <Button variant="outline" className="flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Загрузить файл
            </Button>
            
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={() => navigate('/admin/settings')}
            >
              <Settings className="w-4 h-4" />
              Настройки
            </Button>
          </div>
        </div>

        {/* Статистика */}
        <div className="mt-12">
          <h2 className="text-2xl font-heading font-bold text-primary mb-6">
            Статистика
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricsCard
              title="Всего сказок"
              value={metrics.stories}
              icon={BookOpen}
              iconColor="text-blue-500"
              loading={loading}
            />
            
            <MetricsCard
              title="Персонажей"
              value={metrics.characters}
              icon={Users}
              iconColor="text-green-500"
              loading={loading}
            />
            
            <MetricsCard
              title="Категорий"
              value={metrics.categories}
              icon={Tag}
              iconColor="text-purple-500"
              loading={loading}
            />
            
            <MetricsCard
              title="Ролей"
              value={metrics.roles}
              icon={Shield}
              iconColor="text-orange-500"
              loading={loading}
            />
          </div>
        </div>

        {/* Кнопка выхода */}
        <div className="mt-12 text-center">
          <Button 
            variant="outline" 
            onClick={handleLogout}
            className="flex items-center gap-2 mx-auto"
          >
            <LogOut className="w-4 h-4" />
            Выйти из админки
          </Button>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Admin; 