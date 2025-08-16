import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Heart, 
  BookOpen, 
  Users, 
  Sparkles, 
  Shield, 
  Globe,
  Mail,
  Github
} from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import { Link } from "react-router-dom";

const About = () => {
  const { darkMode, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      <Header darkMode={darkMode} onThemeToggle={toggleTheme} />
      
      <main className="container mx-auto px-4 py-8">
        {/* Заголовок страницы */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-heading font-bold text-primary mb-4">
            О проекте
          </h1>
          <p className="text-lg text-muted-foreground font-body max-w-3xl mx-auto">
            Добро пожаловать в мир сказок про Крокодила Тошу - платформу, созданную для развития 
            воображения и воспитания добрых качеств у детей всех возрастов.
          </p>
        </div>

        {/* Основная информация */}
        <div className="max-w-4xl mx-auto space-y-12">
          
          {/* Миссия проекта */}
          <Card className="p-8">
            <div className="text-center mb-6">
              <Sparkles className="w-16 h-16 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-heading font-bold text-foreground mb-4">
                Наша миссия
              </h2>
            </div>
            <p className="text-muted-foreground font-body leading-relaxed text-lg text-center">
              Мы создаем увлекательные истории, которые не только развлекают, но и учат детей 
              важным жизненным ценностям: дружбе, взаимопомощи, ответственности и любви к природе. 
              Каждая сказка - это маленькое приключение, которое помогает ребенку развиваться 
              и познавать мир.
            </p>
          </Card>

          {/* Особенности проекта */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="p-6 text-center">
              <BookOpen className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-heading font-semibold text-foreground mb-3">
                Увлекательные истории
              </h3>
              <p className="text-muted-foreground font-body">
                Коллекция оригинальных сказок с яркими персонажами и захватывающими сюжетами
              </p>
            </Card>

            <Card className="p-6 text-center">
              <Users className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-heading font-semibold text-foreground mb-3">
                Развитие личности
              </h3>
              <p className="text-muted-foreground font-body">
                Истории, которые помогают формировать характер и развивать эмоциональный интеллект
              </p>
            </Card>

            <Card className="p-6 text-center">
              <Shield className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-heading font-semibold text-foreground mb-3">
                Безопасный контент
              </h3>
              <p className="text-muted-foreground font-body">
                Все материалы тщательно отбираются и подходят для детей всех возрастов
              </p>
            </Card>

            <Card className="p-6 text-center">
              <Globe className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-heading font-semibold text-foreground mb-3">
                Доступность
              </h3>
              <p className="text-muted-foreground font-body">
                Бесплатный доступ к качественному контенту для всех семей
              </p>
            </Card>

            <Card className="p-6 text-center">
              <Heart className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-heading font-semibold text-foreground mb-3">
                Создано с любовью
              </h3>
              <p className="text-muted-foreground font-body">
                Каждая история создается с заботой о детях и их развитии
              </p>
            </Card>

            <Card className="p-6 text-center">
              <Sparkles className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-heading font-semibold text-foreground mb-3">
                Постоянное развитие
              </h3>
              <p className="text-muted-foreground font-body">
                Регулярно добавляются новые истории и улучшается функциональность
              </p>
            </Card>
          </div>

          {/* Технологии */}
          <Card className="p-8">
            <h2 className="text-2xl font-heading font-bold text-foreground mb-6 text-center">
              Технологии проекта
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <Badge variant="secondary" className="text-sm font-body">
                  React
                </Badge>
              </div>
              <div className="text-center">
                <Badge variant="secondary" className="text-sm font-body">
                  TypeScript
                </Badge>
              </div>
              <div className="text-center">
                <Badge variant="secondary" className="text-sm font-body">
                  Tailwind CSS
                </Badge>
              </div>
              <div className="text-center">
                <Badge variant="secondary" className="text-sm font-body">
                  Node.js
                </Badge>
              </div>
              <div className="text-center">
                <Badge variant="secondary" className="text-sm font-body">
                  PostgreSQL
                </Badge>
              </div>
              <div className="text-center">
                <Badge variant="secondary" className="text-sm font-body">
                  Prisma
                </Badge>
              </div>
              <div className="text-center">
                <Badge variant="secondary" className="text-sm font-body">
                  Express.js
                </Badge>
              </div>
              <div className="text-center">
                <Badge variant="secondary" className="text-sm font-body">
                  Vite
                </Badge>
              </div>
            </div>
          </Card>

          {/* Команда */}
          <Card className="p-8">
            <h2 className="text-2xl font-heading font-bold text-foreground mb-6 text-center">
              Наша команда
            </h2>
            <p className="text-muted-foreground font-body leading-relaxed text-center mb-6">
              Проект создается командой энтузиастов, которые верят в силу хороших историй 
              и их влияние на развитие детей.
            </p>
            <div className="text-center">
              <Badge variant="outline" className="text-sm font-body">
                Разработчики
              </Badge>
              <Badge variant="outline" className="text-sm font-body ml-2">
                Дизайнеры
              </Badge>
              <Badge variant="outline" className="text-sm font-body ml-2">
                Писатели
              </Badge>
              <Badge variant="outline" className="text-sm font-body ml-2">
                Педагоги
              </Badge>
            </div>
          </Card>

          {/* Контакты */}
          <Card className="p-8">
            <h2 className="text-2xl font-heading font-bold text-foreground mb-6 text-center">
              Свяжитесь с нами
            </h2>
            <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
              <Button variant="outline" className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span>hello@tosha-tales.ru</span>
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <Github className="w-4 h-4" />
                <span>GitHub</span>
              </Button>
            </div>
          </Card>

          {/* Призыв к действию */}
          <Card className="p-8 text-center">
            <h2 className="text-2xl font-heading font-bold text-foreground mb-4">
              Готовы начать приключение?
            </h2>
            <p className="text-muted-foreground font-body mb-6">
              Откройте для себя мир увлекательных сказок и познакомьтесь с нашими героями
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/stories">
                <Button className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  Читать сказки
                </Button>
              </Link>
              <Link to="/characters">
                <Button variant="outline" className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Знакомиться с персонажами
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default About; 