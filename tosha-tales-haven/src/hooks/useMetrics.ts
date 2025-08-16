import { useState, useEffect } from 'react';
import statisticsService from '../services/statisticsService.js';

interface Metrics {
  stories: number;
  characters: number;
  categories: number;
  roles: number;
  media: number;
}

export const useMetrics = () => {
  const [metrics, setMetrics] = useState<Metrics>({
    stories: 0,
    characters: 0,
    categories: 0,
    roles: 0,
    media: 0
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadMetrics = async () => {
    try {
      setLoading(true);
      const metricsData = await statisticsService.getAllMetrics();
      setMetrics(metricsData);
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

  useEffect(() => {
    loadMetrics();
  }, []);

  return {
    metrics,
    loading,
    refreshing,
    refreshMetrics,
    loadMetrics
  };
}; 