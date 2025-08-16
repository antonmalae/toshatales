import React from 'react';
import { Search as SearchIcon, BookOpen, User } from 'lucide-react';
import { Link } from 'react-router-dom';

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
}

interface SearchResultsProps {
  results: SearchResult[];
  isVisible: boolean;
  onClose: () => void;
  isLoading: boolean;
}

export const SearchResults: React.FC<SearchResultsProps> = ({
  results,
  isVisible,
  onClose,
  isLoading
}) => {
  if (!isVisible) return null;

  return (
    <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-primary/10 rounded-2xl shadow-card z-50 max-h-96 overflow-y-auto">
      {isLoading ? (
        <div className="p-4 text-center text-muted-foreground">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
          Поиск...
        </div>
      ) : results.length === 0 ? (
        <div className="p-4 text-center text-muted-foreground">
          <SearchIcon className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
          Ничего не найдено
        </div>
      ) : (
        <div className="p-2">
          {results.map((result) => (
            <Link
              key={`${result.type}-${result.id}`}
              to={result.type === 'story' ? `/story/${result.id}` : `/character/${result.id}`}
              onClick={onClose}
              className="flex items-center space-x-3 p-3 rounded-xl hover:bg-primary/5 transition-colors"
            >
              {/* Иконка типа */}
              <div className="flex-shrink-0">
                {result.type === 'story' ? (
                  <BookOpen className="w-5 h-5 text-primary" />
                ) : (
                  <User className="w-5 h-5 text-primary" />
                )}
              </div>

              {/* Изображение */}
              <div className="flex-shrink-0">
                {result.image ? (
                  <img
                    src={result.image}
                    alt={result.title || result.name}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-gradient-hero flex items-center justify-center">
                    <span className="text-lg">
                      {result.type === 'story' ? '📖' : '👤'}
                    </span>
                  </div>
                )}
              </div>

              {/* Контент */}
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-foreground truncate">
                  {result.title || result.name}
                </h4>
                {result.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {result.description}
                  </p>
                )}
                {result.category && (
                  <span
                    className="inline-block px-2 py-1 text-xs rounded-full text-white mt-1"
                    style={{ backgroundColor: result.category.color }}
                  >
                    {result.category.name}
                  </span>
                )}
              </div>

              {/* Индикатор типа */}
              <div className="flex-shrink-0 text-xs text-muted-foreground px-2 py-1 rounded-full bg-muted">
                {result.type === 'story' ? 'Сказка' : 'Персонаж'}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
