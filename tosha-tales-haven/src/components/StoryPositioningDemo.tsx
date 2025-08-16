import React from 'react';
import StoryContent from './StoryContent';

interface Illustration {
  id: string;
  imageUrl: string;
  position_vertical: 'top' | 'bottom';
  position_horizontal: 'left' | 'right';
  caption?: string;
  order: number;
}

const StoryPositioningDemo: React.FC = () => {
  // Тестовый контент с несколькими абзацами
  const testContent = `
    <p>Жили-были в одном лесу маленький зайчик и большая лиса. Зайчик был очень добрым и всегда помогал другим зверям. Он собирал ягоды для белочки, приносил орехи для ежика и даже помогал медведю найти мед.</p>
    
    <p>Лиса же была хитрой и коварной. Она всегда думала только о себе и не любила делиться с другими. Когда она видела зайчика, который помогает другим зверям, она только смеялась и говорила: "Зачем тебе помогать другим? Лучше думай о себе!"</p>
    
    <p>Однажды в лесу случилась беда - начался сильный пожар. Все звери были в панике и не знали, что делать. Зайчик сразу же начал помогать - он предупредил всех зверей об опасности и помог им найти безопасное место.</p>
    
    <p>Лиса же в это время пряталась в своей норе и думала только о том, как спастись самой. Но когда огонь подобрался совсем близко, она поняла, что не сможет справиться в одиночку.</p>
    
    <p>Тогда лиса вспомнила о добром зайчике и попросила у него помощи. Зайчик, несмотря на то, что лиса всегда была к нему недобра, сразу же помог ей найти безопасное место.</p>
    
    <p>После этого случая лиса изменилась. Она поняла, что помогать другим - это хорошо, и стала такой же доброй, как зайчик. Теперь в лесу все звери жили дружно и всегда помогали друг другу.</p>
  `;

  // Тестовые иллюстрации с разными позициями
  const testIllustrations: Illustration[] = [
    {
      id: '1',
      imageUrl: 'https://via.placeholder.com/300x200/FF6B6B/FFFFFF?text=Сверху-Слева',
      position_vertical: 'top',
      position_horizontal: 'left',
      caption: 'Иллюстрация сверху слева',
      order: 1
    },
    {
      id: '2',
      imageUrl: 'https://via.placeholder.com/300x200/4ECDC4/FFFFFF?text=Сверху-Справа',
      position_vertical: 'top',
      position_horizontal: 'right',
      caption: 'Иллюстрация сверху справа',
      order: 2
    },
    {
      id: '3',
      imageUrl: 'https://via.placeholder.com/300x200/45B7D1/FFFFFF?text=Снизу-Справа',
      position_vertical: 'bottom',
      position_horizontal: 'right',
      caption: 'Иллюстрация снизу справа',
      order: 3
    },
    {
      id: '4',
      imageUrl: 'https://via.placeholder.com/300x200/96CEB4/FFFFFF?text=Снизу-Слева',
      position_vertical: 'bottom',
      position_horizontal: 'left',
      caption: 'Иллюстрация снизу слева',
      order: 4
    }
  ];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">
        Демонстрация системы позиционирования иллюстраций
      </h1>
      
      <div className="mb-8 p-4 bg-gray-100 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Описание теста:</h2>
        <ul className="list-disc list-inside space-y-2">
          <li><strong>Иллюстрация 1</strong> (красная): Позиция "сверху слева" - должна отображаться над всем текстом слева</li>
          <li><strong>Иллюстрация 2</strong> (бирюзовая): Позиция "сверху справа" - должна отображаться над всем текстом справа</li>
          <li><strong>Иллюстрация 3</strong> (синяя): Позиция "снизу справа" - должна отображаться под всем текстом справа</li>
          <li><strong>Иллюстрация 4</strong> (зеленая): Позиция "снизу слева" - должна отображаться под всем текстом слева</li>
        </ul>
      </div>

      <div className="border-2 border-gray-300 rounded-lg p-6">
        <StoryContent 
          content={testContent} 
          illustrations={testIllustrations}
          className="text-gray-800"
        />
      </div>

      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Проверьте:</h3>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>Красная иллюстрация находится над всем текстом слева</li>
          <li>Бирюзовая иллюстрация находится над всем текстом справа</li>
          <li>Синяя иллюстрация находится под всем текстом справа</li>
          <li>Зеленая иллюстрация находится под всем текстом слева</li>
          <li>Иллюстрации в одной зоне группируются по горизонтали</li>
          <li>Никакой текст не появляется в неправильных местах</li>
        </ul>
      </div>
    </div>
  );
};

export default StoryPositioningDemo; 