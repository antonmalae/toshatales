import { useState, useEffect, useRef } from 'react';
import statisticsService from '../services/statisticsService.js';

interface Metrics {
  stories: number;
  characters: number;
  categories: number;
  roles: number;
  media: number;
}

interface UseLiveMetricsOptions {
  autoRefresh?: boolean;
  refreshInterval?: number; // в миллисекундах
  onMetricsUpdate?: (metrics: Metrics) => void;
}

export const useLiveMetrics = (options: UseLiveMetricsOptions = {}) => {
  const {
    autoRefresh = true,
    refreshInterval = 30000, // 30 секунд по умолчанию
    onMetricsUpdate
  } = options;

  const [metrics, setMetrics] = useState<Metrics>({
    stories: 0,
    characters: 0,
    categories: 0,
    roles: 0,
    media: 0
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const loadMetrics = async () => {
    try {
      setLoading(true);
      const metricsData = await statisticsService.getAllMetrics();
      setMetrics(metricsData);
      
      // Вызываем callback если предоставлен
      if (onMetricsUpdate) {
        onMetricsUpdate(metricsData);
      }
    } catch (error) {
      console.error('Error loading metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshMetrics = async () => {
    try {
      setRefreshing(true);
      await loadMetrics();
    } finally {
      setRefreshing(false);
    }
  };

  // Функция для ручного обновления метрик
  const forceRefresh = async () => {
    await refreshMetrics();
  };

  // Настройка автоматического обновления
  useEffect(() => {
    // Загружаем метрики при монтировании
    loadMetrics();

    // Настраиваем автоматическое обновление
    if (autoRefresh && refreshInterval > 0) {
      intervalRef.current = setInterval(() => {
        loadMetrics();
      }, refreshInterval);
    }

    // Очистка при размонтировании
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [autoRefresh, refreshInterval]);

  // Функция для приостановки/возобновления автоматического обновления
  const pauseAutoRefresh = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const resumeAutoRefresh = () => {
    if (autoRefresh && refreshInterval > 0 && !intervalRef.current) {
      intervalRef.current = setInterval(() => {
        loadMetrics();
      }, refreshInterval);
    }
  };

  return {
    metrics,
    loading,
    refreshing,
    refreshMetrics: forceRefresh,
    pauseAutoRefresh,
    resumeAutoRefresh,
    isAutoRefreshActive: !!intervalRef.current
  };
}; 