import { HistoryEntry } from '../types';

export function addHistoryEntry(
  history: HistoryEntry[],
  field: string,
  oldValue: any,
  newValue: any,
  type: 'update' | 'create' | 'delete' = 'update'
): HistoryEntry[] {
  // Se os valores são iguais, não registra a mudança
  if (JSON.stringify(oldValue) === JSON.stringify(newValue)) {
    return history;
  }

  const entry: HistoryEntry = {
    timestamp: new Date().toISOString(),
    user: 'Sistema', // Aqui você pode integrar com seu sistema de autenticação
    field,
    oldValue,
    newValue,
    type
  };

  return [...history, entry];
}