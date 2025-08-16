import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, BookOpen, Users, Sparkles } from "lucide-react";

export const SearchSection = () => {
  return (
    <section className="py-16 md:py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Заголовок */}
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">
              Найдите свою любимую сказку
            </h2>
            <p className="text-lg text-muted-foreground font-body">
              Используйте поиск или выберите категорию
            </p>
          </div>

          {/* Большая поисковая строка */}
          <div className="relative mb-8">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-muted-foreground w-6 h-6" />
                <Input
                  type="text"
                  placeholder="Введите название сказки, персонажа или ключевые слова..."
                  className="search-input pl-16 text-xl h-16"
                />
              </div>
              <Button className="magic-button h-16 px-8">
                <Search className="w-6 h-6 mr-2" />
                Найти
              </Button>
            </div>
          </div>

          {/* Быстрые фильтры */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <Button variant="outline" className="story-button">
              <BookOpen className="w-4 h-4 mr-2" />
              Все сказки
            </Button>
            <Button variant="outline" className="story-button">
              <Users className="w-4 h-4 mr-2" />
              Персонажи
            </Button>
            <Button variant="outline" className="story-button">
              <Sparkles className="w-4 h-4 mr-2" />
              Новинки
            </Button>
            <Button variant="outline" className="story-button">
              <Filter className="w-4 h-4 mr-2" />
              Фильтры
            </Button>
          </div>

          {/* Популярные запросы */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground font-body mb-3">
              Популярные запросы:
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {["дружба", "приключения", "океан", "джунгли", "волшебство", "доброта"].map((tag) => (
                <button
                  key={tag}
                  className="px-3 py-1 bg-card text-card-foreground rounded-full text-sm font-body
                           hover:bg-primary hover:text-primary-foreground transition-colors
                           border border-primary/20 hover:border-primary"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};