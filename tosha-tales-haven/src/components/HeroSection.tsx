import { Button } from "@/components/ui/button";
import { BookOpen, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

export const HeroSection = () => {
  return (
    <section className="bg-gradient-soft py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center justify-between max-w-6xl mx-auto">
          {/* Левая часть - текст */}
          <div className="lg:w-1/2 space-y-6 text-center lg:text-left">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-foreground leading-tight">
                Добро пожаловать в мир{" "}
                <span className="text-primary bg-gradient-hero bg-clip-text text-transparent">
                  Крокодила Тоши
                </span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground font-body max-w-lg mx-auto lg:mx-0">
                Волшебные сказки о добром крокодиле и его друзьях. 
                Истории, которые учат дружбе, доброте и смелости.
              </p>
            </div>

            {/* Кнопки действий */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link to="/stories">
                <Button className="magic-button group">
                  <BookOpen className="w-5 h-5 mr-2 group-hover:animate-gentle-bounce" />
                  Читать сказки
                </Button>
              </Link>
              <Link to="/characters">
                <Button variant="outline" className="story-button">
                  <Sparkles className="w-5 h-5 mr-2" />
                  Познакомиться с Тошей
                </Button>
              </Link>
            </div>

            {/* Статистика */}
            <div className="flex justify-center lg:justify-start gap-8 pt-8">
              <div className="text-center">
                <div className="text-2xl font-heading font-bold text-primary">20+</div>
                <div className="text-sm text-muted-foreground font-body">Сказок</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-heading font-bold text-accent">10+</div>
                <div className="text-sm text-muted-foreground font-body">Персонажей</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-heading font-bold text-azure">1000+</div>
                <div className="text-sm text-muted-foreground font-body">Читателей</div>
              </div>
            </div>
          </div>

          {/* Правая часть - иллюстрация Тоши */}
          <div className="lg:w-1/2 mt-12 lg:mt-0 flex justify-center">
            <div className="relative">
              {/* Фоновый круг с градиентом */}
              <div className="absolute inset-0 w-80 h-80 md:w-96 md:h-96 bg-gradient-warm rounded-full opacity-20 animate-gentle-glow"></div>
              
              {/* Основное изображение Тоши */}
              <div className="relative w-80 h-80 md:w-96 md:h-96 rounded-full overflow-hidden shadow-glow border-4 border-primary/20">
                <img
                  src="/lovable-uploads/feacc9db-2db0-4c54-b4bf-1d71a13c1b46.png"
                  alt="Крокодил Тоша на пляже с морской звездой"
                  className="w-full h-full object-cover animate-gentle-bounce"
                />
              </div>

              {/* Декоративные элементы */}
              <div className="absolute -top-4 -right-4 w-12 h-12 bg-sunshine rounded-full animate-gentle-bounce delay-300 flex items-center justify-center">
                <span className="text-2xl">⭐</span>
              </div>
              <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-azure rounded-full animate-gentle-bounce delay-700 flex items-center justify-center">
                <span className="text-3xl">💙</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};