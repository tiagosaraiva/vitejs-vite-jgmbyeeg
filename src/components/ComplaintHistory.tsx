import React from 'react';
import { HistoryEntry } from '../types';
import { History } from 'lucide-react';

interface ComplaintHistoryProps {
  history: HistoryEntry[];
}

export function ComplaintHistory({ history }: ComplaintHistoryProps) {
  // Sort history entries by timestamp in descending order (most recent first)
  const sortedHistory = [...history].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return 'Nenhum';
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <History className="h-5 w-5 text-gray-600" />
        <h3 className="text-lg font-semibold text-gray-900">Histórico de Alterações</h3>
      </div>

      <div className="space-y-3">
        {sortedHistory.length === 0 ? (
          <p className="text-sm text-gray-500 italic">Nenhuma alteração registrada</p>
        ) : (
          sortedHistory.map((entry, index) => (
            <div 
              key={index} 
              className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {entry.type === 'create' && 'Criação'}
                    {entry.type === 'update' && 'Atualização'}
                    {entry.type === 'delete' && 'Remoção'}
                    {' '}<span className="text-gray-600">do campo</span>{' '}
                    <span className="font-medium">{entry.field}</span>
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    por {entry.user} em {new Date(entry.timestamp).toLocaleString('pt-BR')}
                  </p>
                </div>
                {entry.type === 'update' && (
                  <div className="text-sm">
                    <p className="text-red-600 line-through">{formatValue(entry.oldValue)}</p>
                    <p className="text-green-600">{formatValue(entry.newValue)}</p>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}