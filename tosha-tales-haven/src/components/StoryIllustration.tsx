import React from 'react';
import './StoryIllustration.css';

interface StoryIllustrationProps {
  imageUrl: string;
  position_vertical: 'top' | 'bottom';
  position_horizontal: 'left' | 'right';
  caption?: string;
  order: number;
  className?: string;
}

const StoryIllustration: React.FC<StoryIllustrationProps> = ({
  imageUrl,
  position_vertical,
  position_horizontal,
  caption,
  order,
  className = ""
}) => {
  // Определяем стили позиционирования
  const getPositionStyles = () => {
    const baseStyles = {
      width: '300px',
      height: '200px',
      objectFit: 'cover' as const,
      borderRadius: '8px',
      border: '1px solid #e5e7eb'
    };

    const positionStyles: React.CSSProperties = { ...baseStyles };

    // Применяем горизонтальное позиционирование
    switch (position_horizontal) {
      case 'left':
        positionStyles.float = 'left';
        positionStyles.marginRight = '16px';
        positionStyles.marginBottom = '16px';
        positionStyles.marginTop = '8px';
        break;
      case 'right':
        positionStyles.float = 'right';
        positionStyles.marginLeft = '16px';
        positionStyles.marginBottom = '16px';
        positionStyles.marginTop = '8px';
        break;
    }

    return positionStyles;
  };

  const containerStyles = getPositionStyles();

  return (
    <div className={`story-illustration ${className}`} style={containerStyles}>
      <img
        src={imageUrl}
        alt={`Иллюстрация ${order}`}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          borderRadius: '8px'
        }}
      />
      {caption && (
        <div className="mt-2 text-sm text-gray-600 text-center italic">
          {caption}
        </div>
      )}
    </div>
  );
};

export default StoryIllustration; 