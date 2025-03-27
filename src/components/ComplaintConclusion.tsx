import React from 'react';
import { Complaint, ProcedenciaType, CEOApprovalStatus } from '../types';

interface ComplaintConclusionProps {
  currentComplaint: Partial<Complaint>;
  editingComplaint: Complaint | null;
  setEditingComplaint: (complaint: Complaint | null) => void;
}

export function ComplaintConclusion({
  currentComplaint,
  editingComplaint,
  setEditingComplaint
}: ComplaintConclusionProps) {
  const handleConclusionChange = (field: string, value: any) => {
    if (editingComplaint) {
      setEditingComplaint({
        ...editingComplaint,
        conclusion: {
          ...editingComplaint.conclusion,
          [field]: value
        }
      });
    }
  };

  // Calculate SLA (days between received date and closing date or current date)
  const calculateSLA = () => {
    if (!currentComplaint.receivedDate) return 0;
    
    const startDate = new Date(currentComplaint.receivedDate);
    const endDate = currentComplaint.conclusion?.dataEncerramento 
      ? new Date(currentComplaint.conclusion.dataEncerramento)
      : new Date();

    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  const sla = calculateSLA();

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          CONCLUSÃO
        </label>
        <div className="space-y-4">
          {/* SLA Display */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Tempo de Resolução (SLA):</span>
              <span className="text-lg font-bold text-blue-600">{sla} dias</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Procedência
            </label>
            <select
              name="procedencia"
              className="w-full border border-gray-300 rounded-lg p-2 focus:ring-blue-500 focus:border-blue-500"
              onChange={(e) => handleConclusionChange('procedencia', e.target.value)}
              value={currentComplaint.conclusion?.procedencia || ''}
              required
            >
              <option value="">Selecione a procedência</option>
              <option value="Improcedente">Improcedente</option>
              <option value="Procedente">Procedente</option>
              <option value="Parcialmente procedente">Parcialmente procedente</option>
              <option value="Inconclusiva">Inconclusiva</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data de Encerramento
            </label>
            <input
              type="date"
              name="dataEncerramento"
              className="w-full border border-gray-300 rounded-lg p-2 focus:ring-blue-500 focus:border-blue-500"
              onChange={(e) => {
                if (editingComplaint) {
                  setEditingComplaint({
                    ...editingComplaint,
                    conclusion: {
                      ...editingComplaint.conclusion,
                      dataEncerramento: e.target.value,
                      ceoApprovalStatus: editingComplaint.conclusion?.ceoApprovalStatus || 'pending'
                    }
                  });
                }
              }}
              value={currentComplaint.conclusion?.dataEncerramento || ''}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Justificativa
            </label>
            <textarea
              name="justification"
              rows={4}
              className="w-full border border-gray-300 rounded-lg p-2 focus:ring-blue-500 focus:border-blue-500"
              onChange={(e) => handleConclusionChange('justification', e.target.value)}
              value={currentComplaint.conclusion?.justification || ''}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Observações
            </label>
            <textarea
              name="observation"
              rows={4}
              className="w-full border border-gray-300 rounded-lg p-2 focus:ring-blue-500 focus:border-blue-500"
              onChange={(e) => handleConclusionChange('observation', e.target.value)}
              value={currentComplaint.conclusion?.observation || ''}
              placeholder="Observações adicionais sobre a conclusão..."
            />
          </div>
        </div>  
      </div>
    </div>
  );
}