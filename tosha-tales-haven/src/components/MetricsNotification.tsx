import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MetricsChange {
  field: string;
  oldValue: number;
  newValue: number;
  change: number;
}

interface MetricsNotificationProps {
  previousMetrics: Record<string, number>;
  currentMetrics: Record<string, number>;
  onClose?: () => void;
}

const MetricsNotification = ({ 
  previousMetrics, 
  currentMetrics, 
  onClose 
}: MetricsNotificationProps) => {
  const [changes, setChanges] = useState<MetricsChange[]>([]);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const detectedChanges: MetricsChange[] = [];
    
    Object.keys(currentMetrics).forEach(key => {
      const oldValue = previousMetrics[key] || 0;
      const newValue = currentMetrics[key] || 0;
      const change = newValue - oldValue;
      
      if (change !== 0) {
        detectedChanges.push({
          field: key,
          oldValue,
          newValue,
          change
        });
      }
    });
    
    setChanges(detectedChanges);
  }, [previousMetrics, currentMetrics]);

  const handleClose = () => {
    setVisible(false);
    onClose?.();
  };

  if (!visible || changes.length === 0) {
    return null;
  }

  const getChangeIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (change < 0) return <TrendingDown className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 h-4 text-gray-500" />;
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-green-600';
    if (change < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getFieldLabel = (field: string) => {
    const labels: Record<string, string> = {
      stories: 'Сказки',
      characters: 'Персонажи',
      categories: 'Категории',
      roles: 'Роли',
      media: 'Медиафайлы'
    };
    return labels[field] || field;
  };

  return (
    <Card className="p-4 mb-4 border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-950">
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-semibold text-blue-900 dark:text-blue-100">
          Изменения метрик
        </h4>
        <button
          onClick={handleClose}
          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
        >
          ×
        </button>
      </div>
      
      <div className="space-y-2">
        {changes.map((change, index) => (
          <div key={index} className="flex items-center justify-between">
            <span className="text-sm text-blue-800 dark:text-blue-200">
              {getFieldLabel(change.field)}
            </span>
            <div className="flex items-center gap-2">
              {getChangeIcon(change.change)}
              <span className={`text-sm font-medium ${getChangeColor(change.change)}`}>
                {change.change > 0 ? '+' : ''}{change.change}
              </span>
              <Badge variant="outline" className="text-xs">
                {change.oldValue} → {change.newValue}
              </Badge>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default MetricsNotification; 