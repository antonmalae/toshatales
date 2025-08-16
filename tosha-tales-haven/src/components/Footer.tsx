import { Heart, Mail, BookOpen, Users } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-gradient-soft border-t border-primary/10 py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* О проекте */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-hero rounded-xl flex items-center justify-center">
                <span className="text-xl">🐊</span>
              </div>
              <h3 className="text-lg font-heading font-semibold text-foreground">
                Сказки про Тошу
              </h3>
            </div>
            <p className="text-muted-foreground font-body text-sm leading-relaxed">
              Добрые детские сказки, которые учат дружбе, смелости и доброте. 
              Создано с любовью для детей и их родителей.
            </p>
          </div>

          {/* Быстрые ссылки */}
          <div className="space-y-4">
            <h4 className="font-heading font-semibold text-foreground">
              Разделы
            </h4>
            <div className="space-y-2">
              <a href="/stories" className="flex items-center space-x-2 text-muted-foreground hover:text-primary transition-colors font-body text-sm">
                <BookOpen className="w-4 h-4" />
                <span>Все сказки</span>
              </a>
              <a href="/characters" className="flex items-center space-x-2 text-muted-foreground hover:text-primary transition-colors font-body text-sm">
                <Users className="w-4 h-4" />
                <span>Персонажи</span>
              </a>
              <a href="/about" className="flex items-center space-x-2 text-muted-foreground hover:text-primary transition-colors font-body text-sm">
                <Heart className="w-4 h-4" />
                <span>О проекте</span>
              </a>
              <a href="/contact" className="flex items-center space-x-2 text-muted-foreground hover:text-primary transition-colors font-body text-sm">
                <Mail className="w-4 h-4" />
                <span>Связаться с нами</span>
              </a>
            </div>
          </div>

          {/* Контакты */}
          <div className="space-y-4">
            <h4 className="font-heading font-semibold text-foreground">
              Связь с нами
            </h4>
            <div className="space-y-3">
              <p className="text-muted-foreground font-body text-sm">
                Есть вопросы или предложения? Мы всегда рады услышать от вас!
              </p>
              <a 
                href="mailto:hello@tosha-tales.ru" 
                className="inline-flex items-center space-x-2 text-primary hover:text-primary-glow transition-colors font-body text-sm"
              >
                <Mail className="w-4 h-4" />
                <span>hello@tosha-tales.ru</span>
              </a>
            </div>
          </div>
        </div>

        {/* Нижняя часть */}
        <div className="border-t border-primary/10 pt-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="text-muted-foreground font-body text-sm text-center md:text-left">
            © 2025 Сказки про Крокодила Тошу. Создано с{" "}
            <Heart className="w-4 h-4 inline text-red-400" />{" "}
            для детей и их семей.
          </div>
          <div className="flex space-x-4 text-muted-foreground text-sm font-body">
            <a href="/privacy" className="hover:text-primary transition-colors">
              Конфиденциальность
            </a>
            <a href="/terms" className="hover:text-primary transition-colors">
              Условия использования
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};