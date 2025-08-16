import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import apiClient from '../services/apiClient';

interface ApiStats {
  cacheSize: number;
  rateLimitInfo: {
    remaining: number;
    reset: number;
    retryAfter: number;
  };
}

const ApiMonitor: React.FC = () => {
  const [stats, setStats] = useState<ApiStats | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const updateStats = () => {
      const currentStats = apiClient.getStats();
      setStats(currentStats);
    };

    // Обновляем статистику каждые 2 секунды
    const interval = setInterval(updateStats, 2000);
    updateStats(); // Первоначальное обновление

    return () => clearInterval(interval);
  }, []);

  const getRateLimitPercentage = () => {
    if (!stats) return 0;
    const total = 200; // Максимальное количество запросов
    return Math.max(0, Math.min(100, ((total - stats.rateLimitInfo.remaining) / total) * 100));
  };

  const getRateLimitColor = () => {
    const percentage = getRateLimitPercentage();
    if (percentage > 80) return 'bg-red-500';
    if (percentage > 60) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  };

  const getTimeUntilReset = () => {
    if (!stats) return 0;
    const now = Date.now();
    const timeLeft = stats.rateLimitInfo.reset - now;
    return Math.max(0, Math.floor(timeLeft / 1000));
  };

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-full shadow-lg z-50 text-lg"
        title="API Monitor - Только для администраторов"
      >
        📊
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Card className="w-80 shadow-lg">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm">API Monitor</CardTitle>
              <p className="text-xs text-gray-500">Административный инструмент</p>
            </div>
            <button
              onClick={() => setIsVisible(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {stats && (
            <>
              {/* Rate Limiting */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span>Rate Limit</span>
                  <span>{stats.rateLimitInfo.remaining} / 200</span>
                </div>
                <Progress 
                  value={getRateLimitPercentage()} 
                  className="h-2"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Reset: {formatTime(stats.rateLimitInfo.reset)}</span>
                  <span>{getTimeUntilReset()}s left</span>
                </div>
              </div>

              {/* Cache Info */}
              <div className="flex justify-between items-center">
                <span className="text-xs">Cache Size</span>
                <Badge variant="secondary" className="text-xs">
                  {stats.cacheSize} items
                </Badge>
              </div>

              {/* Status */}
              <div className="flex justify-between items-center">
                <span className="text-xs">Status</span>
                <Badge 
                  variant={getRateLimitPercentage() > 80 ? "destructive" : "default"}
                  className="text-xs"
                >
                  {getRateLimitPercentage() > 80 ? "High Load" : "Normal"}
                </Badge>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => apiClient.clearCache()}
                  className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded"
                >
                  Clear Cache
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="text-xs bg-blue-100 hover:bg-blue-200 px-2 py-1 rounded"
                >
                  Refresh
                </button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ApiMonitor; 