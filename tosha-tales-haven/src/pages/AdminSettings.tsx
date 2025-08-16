import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Settings as SettingsIcon, 
  Shield, 
  Database, 
  Bell,
  Key,
  Globe,
  Palette
} from "lucide-react";
import { useTheme } from "@/hooks/use-theme";

const AdminSettings = () => {
  const { darkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const settingsSections = [
    {
      id: "users",
      title: "Пользователи",
      description: "Управление пользователями системы, роли и права доступа",
      icon: Users,
      href: "/admin/settings/users",
      color: "bg-blue-500",
      features: ["Создание пользователей", "Управление ролями", "Сброс паролей", "Аудит действий"]
    },
    {
      id: "security",
      title: "Безопасность",
      description: "Настройки безопасности и аутентификации",
      icon: Shield,
      href: "/admin/settings/security",
      color: "bg-red-500",
      features: ["Политика паролей", "Двухфакторная аутентификация", "Сессии", "Блокировка аккаунтов"],
      comingSoon: true
    },
    {
      id: "database",
      title: "База данных",
      description: "Управление базой данных и резервными копиями",
      icon: Database,
      href: "/admin/settings/database",
      color: "bg-green-500",
      features: ["Резервные копии", "Миграции", "Оптимизация", "Мониторинг"],
      comingSoon: true
    },
    {
      id: "notifications",
      title: "Уведомления",
      description: "Настройки уведомлений и оповещений",
      icon: Bell,
      href: "/admin/settings/notifications",
      color: "bg-yellow-500",
      features: ["Email уведомления", "Push уведомления", "Расписание", "Шаблоны"],
      comingSoon: true
    },
    {
      id: "api",
      title: "API",
      description: "Управление API ключами и настройками",
      icon: Key,
      href: "/admin/settings/api",
      color: "bg-purple-500",
      features: ["API ключи", "Rate limiting", "Документация", "Мониторинг"],
      comingSoon: true
    },
    {
      id: "localization",
      title: "Локализация",
      description: "Настройки языка и региональных параметров",
      icon: Globe,
      href: "/admin/settings/localization",
      color: "bg-indigo-500",
      features: ["Языки", "Форматы дат", "Валюты", "Часовые пояса"],
      comingSoon: true
    },
    {
      id: "appearance",
      title: "Внешний вид",
      description: "Настройки интерфейса и темы",
      icon: Palette,
      href: "/admin/settings/appearance",
      color: "bg-pink-500",
      features: ["Темы", "Цвета", "Шрифты", "Макет"],
      comingSoon: true
    }
  ];

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      <Header darkMode={darkMode} onThemeToggle={toggleTheme} />
      
      <main className="container mx-auto px-4 py-8">
        {/* Хлебные крошки */}
        <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-6">
          <span onClick={() => navigate('/admin')} className="cursor-pointer hover:text-primary">
            Админ
          </span>
          <span>/</span>
          <span className="text-primary">Настройки</span>
        </nav>

        {/* Заголовок */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-heading font-bold text-primary mb-4">
            Настройки системы
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Управление настройками, пользователями и конфигурацией системы
          </p>
        </div>

        {/* Секции настроек */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {settingsSections.map((section) => (
            <Card key={section.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className={`h-2 ${section.color}`} />
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`p-2 rounded-lg ${section.color} text-white`}>
                    <section.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-primary">
                      {section.title}
                    </h3>
                    {section.comingSoon && (
                      <Badge variant="secondary" className="text-xs">
                        Скоро
                      </Badge>
                    )}
                  </div>
                </div>
                
                <p className="text-muted-foreground text-sm mb-4">
                  {section.description}
                </p>
                
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-primary mb-2">Возможности:</h4>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    {section.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <Button
                  onClick={() => navigate(section.href)}
                  disabled={section.comingSoon}
                  className="w-full"
                  variant={section.comingSoon ? "outline" : "default"}
                >
                  {section.comingSoon ? "Скоро будет доступно" : "Открыть"}
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {/* Быстрые действия */}
        <div className="mt-12">
          <h2 className="text-2xl font-heading font-bold text-primary mb-6">
            Быстрые действия
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button 
              onClick={() => navigate('/admin/settings/users')}
              className="flex items-center gap-2"
            >
              <Users className="w-4 h-4" />
              Управление пользователями
            </Button>
            
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              disabled
            >
              <Shield className="w-4 h-4" />
              Настройки безопасности
            </Button>
            
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              disabled
            >
              <Database className="w-4 h-4" />
              База данных
            </Button>
            
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              disabled
            >
              <Bell className="w-4 h-4" />
              Уведомления
            </Button>
          </div>
        </div>

        {/* Информация о системе */}
        <div className="mt-12">
          <h2 className="text-2xl font-heading font-bold text-primary mb-6">
            Информация о системе
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">v1.0.0</div>
              <div className="text-sm text-muted-foreground">Версия системы</div>
            </Card>
            
            <Card className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">ru-RU</div>
              <div className="text-sm text-muted-foreground">Язык интерфейса</div>
            </Card>
            
            <Card className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">PostgreSQL</div>
              <div className="text-sm text-muted-foreground">База данных</div>
            </Card>
            
            <Card className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">Node.js</div>
              <div className="text-sm text-muted-foreground">Backend</div>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AdminSettings;
