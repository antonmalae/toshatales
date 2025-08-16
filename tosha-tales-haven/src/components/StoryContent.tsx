import React from 'react';
import StoryIllustration from './StoryIllustration';

interface Illustration {
  id: string;
  imageUrl: string;
  position_horizontal: 'left' | 'right';
  position_vertical: 'top' | 'bottom';
  caption?: string;
  order: number;
}

interface StoryContentProps {
  content: string;
  illustrations: Illustration[];
  className?: string;
}

const StoryContent: React.FC<StoryContentProps> = ({
  content,
  illustrations,
  className = ""
}) => {
  // Сортируем иллюстрации по порядку
  const sortedIllustrations = [...illustrations].sort((a, b) => a.order - b.order);

  // Функция для разделения текста на абзацы
  const splitContentIntoParagraphs = (content: string): string[] => {
    // Сначала удаляем все HTML теги, кроме <p>
    const cleanContent = content.replace(/<(?!\/?p[^>]*>)[^>]+>/g, '');
    
    // Разделяем контент по тегам <p> или переносам строк
    const paragraphs = cleanContent
      .split(/<\/?p[^>]*>/i) // Разделяем по тегам <p>
      .filter(p => p.trim().length > 0) // Убираем пустые строки
      .map(p => p.trim());
    
    // Если нет абзацев, разделяем по переносам строк
    if (paragraphs.length === 0) {
      return content.split('\n').filter(p => p.trim().length > 0).map(p => p.trim());
    }
    
    return paragraphs;
  };

  // Функция для группировки иллюстраций по вертикальным зонам
  const groupIllustrationsByVerticalZone = () => {
    const topIllustrations = sortedIllustrations.filter(ill => ill.position_vertical === 'top');
    const bottomIllustrations = sortedIllustrations.filter(ill => ill.position_vertical === 'bottom');
    
    return { topIllustrations, bottomIllustrations };
  };

  // Функция для рендеринга группы иллюстраций в одной вертикальной зоне
  const renderIllustrationGroup = (illustrations: Illustration[], zone: string) => {
    if (illustrations.length === 0) return null;

    // Группируем иллюстрации по горизонтальной позиции
    const leftIllustrations = illustrations.filter(ill => ill.position_horizontal === 'left');
    const rightIllustrations = illustrations.filter(ill => ill.position_horizontal === 'right');

    return (
      <div key={`zone-${zone}`} className="illustration-zone" style={{ clear: 'both' }}>
        {/* Иллюстрации слева */}
        {leftIllustrations.length > 0 && (
          <div className="illustration-group-left" style={{ float: 'left', marginRight: '16px' }}>
            {leftIllustrations.map((illustration) => (
              <StoryIllustration
                key={`${zone}-left-${illustration.id}`}
                imageUrl={illustration.imageUrl}
                position_vertical={illustration.position_vertical}
                position_horizontal={illustration.position_horizontal}
                caption={illustration.caption}
                order={illustration.order}
                className="mb-4"
              />
            ))}
          </div>
        )}

        {/* Иллюстрации справа */}
        {rightIllustrations.length > 0 && (
          <div className="illustration-group-right" style={{ float: 'right', marginLeft: '16px' }}>
            {rightIllustrations.map((illustration) => (
              <StoryIllustration
                key={`${zone}-right-${illustration.id}`}
                imageUrl={illustration.imageUrl}
                position_vertical={illustration.position_vertical}
                position_horizontal={illustration.position_horizontal}
                caption={illustration.caption}
                order={illustration.order}
                className="mb-4"
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  // Функция для вставки иллюстраций в контент
  const renderContentWithIllustrations = () => {
    if (!illustrations || illustrations.length === 0) {
      return (
        <div 
          className="prose prose-lg max-w-none text-foreground"
          dangerouslySetInnerHTML={{ __html: content.replace(/\n/g, '<br>') }}
        />
      );
    }

    const { topIllustrations, bottomIllustrations } = groupIllustrationsByVerticalZone();
    const paragraphs = splitContentIntoParagraphs(content);

    const elements: React.ReactNode[] = [];

    // Иллюстрации сверху
    if (topIllustrations.length > 0) {
      elements.push(renderIllustrationGroup(topIllustrations, 'top'));
    }

    // Текст сказки
    if (paragraphs.length > 0) {
      const textContent = (
        <div className="prose prose-lg max-w-none text-foreground">
          {paragraphs.map((paragraph, index) => (
            <p key={index} className="mb-4 leading-relaxed">
              {paragraph}
            </p>
          ))}
        </div>
      );
      elements.push(textContent);
    }

    // Иллюстрации снизу
    if (bottomIllustrations.length > 0) {
      elements.push(renderIllustrationGroup(bottomIllustrations, 'bottom'));
    }

    return elements;
  };

  return (
    <div className={`story-content ${className}`}>
      {renderContentWithIllustrations()}
    </div>
  );
};

export default StoryContent; 