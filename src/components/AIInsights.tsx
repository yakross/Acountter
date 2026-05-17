import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { AIInsight } from '@/types';
import { 
  AlertTriangle, 
  Lightbulb, 
  Trophy, 
  Target,
  Sparkles,
  X
} from 'lucide-react';
import { useState } from 'react';

interface AIInsightsProps {
  insights: AIInsight[];
}

export function AIInsights({ insights }: AIInsightsProps) {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const visibleInsights = insights.filter(i => !dismissed.has(i.id));

  const getIcon = (type: AIInsight['type']) => {
    switch (type) {
      case 'warning': return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case 'tip': return <Lightbulb className="w-5 h-5 text-blue-500" />;
      case 'achievement': return <Trophy className="w-5 h-5 text-green-500" />;
      case 'suggestion': return <Target className="w-5 h-5 text-purple-500" />;
      default: return <Sparkles className="w-5 h-5 text-primary-500" />;
    }
  };

  const getBgColor = (type: AIInsight['type']) => {
    switch (type) {
      case 'warning': return 'bg-amber-50 border-amber-200';
      case 'tip': return 'bg-blue-50 border-blue-200';
      case 'achievement': return 'bg-green-50 border-green-200';
      case 'suggestion': return 'bg-purple-50 border-purple-200';
      default: return 'bg-primary-50 border-primary-200';
    }
  };

  const dismissInsight = (id: string) => {
    setDismissed(prev => new Set([...prev, id]));
  };

  if (visibleInsights.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary-500" />
            Insights de IA
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-center py-4">
            No hay insights nuevos. ¡Sigue registrando tus transacciones para recibir recomendaciones personalizadas!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary-500" />
          Insights de IA
          <span className="ml-2 px-2 py-0.5 text-xs bg-primary-100 text-primary-700 rounded-full">
            {visibleInsights.length}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {visibleInsights.map(insight => (
            <div
              key={insight.id}
              className={`relative p-4 rounded-lg border ${getBgColor(insight.type)}`}
            >
              <button
                onClick={() => dismissInsight(insight.id)}
                className="absolute top-2 right-2 p-1 hover:bg-black/5 rounded-full transition-colors"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
              <div className="flex items-start gap-3">
                <div className="mt-0.5">{getIcon(insight.type)}</div>
                <div className="flex-1 pr-6">
                  <h4 className="font-semibold text-gray-900">{insight.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">{insight.message}</p>
                  {insight.action && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2 text-xs"
                    >
                      {insight.action}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
