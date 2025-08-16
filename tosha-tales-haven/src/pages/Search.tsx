import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search as SearchIcon, BookOpen, User, Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import searchService from '../services/searchService.js';

interface SearchResult {
  id: string;
  title?: string;
  name?: string;
  description?: string;
  image?: string;
  type: 'story' | 'character';
  category?: {
    name: string;
    color: string;
  };
  averageRating?: number;
  totalRatings?: number;
  totalLikes?: number;
}

export const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const type = searchParams.get('type') || 'all';
  
  const [searchQuery, setSearchQuery] = useState(query);
  const [searchType, setSearchType] = useState(type);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalCounts, setTotalCounts] = useState({ stories: 0, characters: 0 });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Выполнение поиска
  const performSearch = async (page = 1) => {
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    try {
      const response = await searchService.search(searchQuery, {
        type: searchType,
        page,
        limit: 12
      });

      if (response.success) {
        const searchResults: SearchResult[] = [];
        
        // Обрабатываем сказки
        if (response.data.results.stories) {
          response.data.results.stories.forEach((story: any) => {
            searchResults.push({
              id: story.id,
              title: story.title,
              description: story.description,
              image: story.image,
              type: 'story',
              category: story.category,
              averageRating: story.averageRating,
              totalRatings: story.totalRatings,
              totalLikes: story.totalLikes
            });
          });
        }
        
        // Обрабатываем персонажей
        if (response.data.results.characters) {
          response.data.results.characters.forEach((character: any) => {
            searchResults.push({
              id: character.id,
              name: character.name,
              description: character.description,
              image: character.image,
              type: 'character',
              category: character.role
            });
          });
        }
        
        setResults(searchResults);
        setTotalCounts(response.data.results.pagination?.totalCounts || { stories: 0, characters: 0 });
        setTotalPages(response.data.results.pagination?.totalPages || 1);
        setCurrentPage(page);
      }
    } catch (error) {
      console.error('Ошибка поиска:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Поиск при изменении параметров
  useEffect(() => {
    if (query) {
      performSearch(1);
    }
  }, [query, searchType]);

  // Обновление URL при изменении параметров поиска
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (searchType !== 'all') params.set('type', searchType);
    setSearchParams(params);
  }, [searchQuery, searchType, setSearchParams]);

  // Обработка отправки поиска
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchParams({ q: searchQuery.trim(), ...(searchType !== 'all' && { type: searchType }) });
    }
  };

  // Очистка поиска
  const clearSearch = () => {
    setSearchQuery('');
    setSearchType('all');
    setResults([]);
    setSearchParams({});
  };

  // Смена страницы
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    performSearch(page);
  };

  return (
    <div className="min-h-screen bg-gradient-soft">
      <div className="container mx-auto px-4 py-8">
        {/* Заголовок */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-heading font-bold text-primary mb-4">
            Поиск
          </h1>
          <p className="text-lg text-muted-foreground">
            Найдите сказки и персонажей по вашему запросу
          </p>
        </div>

        {/* Форма поиска */}
        <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input
                type="text"
                placeholder="Введите текст для поиска..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 h-12 text-lg"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={searchType}
                onChange={(e) => setSearchType(e.target.value)}
                className="px-4 py-2 border border-primary/20 rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="all">Все</option>
                <option value="stories">Сказки</option>
                <option value="characters">Персонажи</option>
              </select>
              <Button type="submit" className="h-12 px-6">
                Найти
              </Button>
              {query && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={clearSearch}
                  className="h-12 px-4"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </form>

        {/* Результаты поиска */}
        {query && (
          <div className="max-w-6xl mx-auto">
            {/* Статистика */}
            <div className="flex flex-wrap justify-center gap-4 mb-6">
              {totalCounts.stories > 0 && (
                <Badge variant="secondary" className="px-4 py-2">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Сказок: {totalCounts.stories}
                </Badge>
              )}
              {totalCounts.characters > 0 && (
                <Badge variant="secondary" className="px-4 py-2">
                  <User className="w-4 h-4 mr-2" />
                  Персонажей: {totalCounts.characters}
                </Badge>
              )}
            </div>

            {/* Загрузка */}
            {isLoading && (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Поиск...</p>
              </div>
            )}

            {/* Результаты */}
            {!isLoading && results.length > 0 && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {results.map((result) => (
                    <div
                      key={`${result.type}-${result.id}`}
                      className="bg-card rounded-2xl shadow-card border border-primary/10 overflow-hidden hover:shadow-lg transition-shadow"
                    >
                      <Link to={result.type === 'story' ? `/story/${result.id}` : `/character/${result.id}`}>
                        {/* Изображение */}
                        <div className="aspect-video bg-gradient-hero flex items-center justify-center">
                          {result.image ? (
                            <img
                              src={result.image}
                              alt={result.title || result.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-4xl">
                              {result.type === 'story' ? '📖' : '👤'}
                            </span>
                          )}
                        </div>

                        {/* Контент */}
                        <div className="p-6">
                          {/* Заголовок и тип */}
                          <div className="flex items-start justify-between mb-3">
                            <h3 className="font-heading font-semibold text-lg text-foreground line-clamp-2">
                              {result.title || result.name}
                            </h3>
                            <Badge variant="outline" className="ml-2 flex-shrink-0">
                              {result.type === 'story' ? 'Сказка' : 'Персонаж'}
                            </Badge>
                          </div>

                          {/* Описание */}
                          {result.description && (
                            <p className="text-muted-foreground line-clamp-3 mb-4">
                              {result.description}
                            </p>
                          )}

                          {/* Категория */}
                          {result.category && (
                            <Badge
                              className="mb-3"
                              style={{ backgroundColor: result.category.color, color: 'white' }}
                            >
                              {result.category.name}
                            </Badge>
                          )}

                          {/* Дополнительная информация для сказок */}
                          {result.type === 'story' && (
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              {result.averageRating && (
                                <span>⭐ {result.averageRating.toFixed(1)}</span>
                              )}
                              {result.totalRatings && (
                                <span>📊 {result.totalRatings}</span>
                              )}
                              {result.totalLikes && (
                                <span>❤️ {result.totalLikes}</span>
                              )}
                            </div>
                          )}
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>

                {/* Пагинация */}
                {totalPages > 1 && (
                  <div className="flex justify-center gap-2">
                    <Button
                      variant="outline"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      Назад
                    </Button>
                    
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        onClick={() => handlePageChange(page)}
                        className="w-10 h-10 p-0"
                      >
                        {page}
                      </Button>
                    ))}
                    
                    <Button
                      variant="outline"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      Вперед
                    </Button>
                  </div>
                )}
              </>
            )}

            {/* Нет результатов */}
            {!isLoading && results.length === 0 && query && (
              <div className="text-center py-12">
                <SearchIcon className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  Ничего не найдено
                </h3>
                <p className="text-muted-foreground mb-4">
                  Попробуйте изменить запрос или тип поиска
                </p>
                <Button onClick={clearSearch} variant="outline">
                  Очистить поиск
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Пустое состояние */}
        {!query && (
          <div className="text-center py-12">
            <SearchIcon className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Введите запрос для поиска
            </h3>
            <p className="text-muted-foreground">
              Найдите сказки и персонажей по названию, описанию или содержанию
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
