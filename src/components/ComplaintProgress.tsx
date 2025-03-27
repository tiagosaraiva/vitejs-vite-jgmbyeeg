import React, { useState } from 'react';
import { X, Edit2 } from 'lucide-react';
import { Complaint, Procedure, JudgmentType } from '../types';

interface ComplaintProgressProps {
  currentComplaint: Partial<Complaint>;
  editingComplaint: Complaint | null;
  handleProcedureChange: (procedure: Procedure, checked: boolean) => void;
  setEditingComplaint: (complaint: Complaint | null) => void;
}

export function ComplaintProgress({
  currentComplaint,
  editingComplaint,
  handleProcedureChange,
  setEditingComplaint
}: ComplaintProgressProps) {
  const isArchived = currentComplaint.status === 'arquivada';
  const [tempPoint, setTempPoint] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const handleAddPoint = () => {
    if (tempPoint.trim() && editingComplaint && !isArchived) {
      setEditingComplaint({
        ...editingComplaint,
        analysisPoints: [...(editingComplaint.analysisPoints || []), {
          point: tempPoint.trim(),
          conclusion: '',
          judgment: 'Inconclusivo' as JudgmentType // Set default judgment as "Inconclusivo"
        }],
      });
      setTempPoint('');
      setEditingIndex(editingComplaint.analysisPoints?.length || 0);
    }
  };

  const handleUpdateAnalysis = (index: number, field: 'point' | 'conclusion' | 'judgment', value: string) => {
    if (editingComplaint && !isArchived) {
      const updatedPoints = [...(editingComplaint.analysisPoints || [])];
      updatedPoints[index] = {
        ...updatedPoints[index],
        [field]: value
      };
      setEditingComplaint({
        ...editingComplaint,
        analysisPoints: updatedPoints
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Procedures */}
      <div>
        <label className={`block text-sm font-medium ${isArchived ? 'text-gray-500' : 'text-gray-700'} mb-2`}>
          PROCEDIMENTO
        </label>
        <div className="space-y-2">
          {['Entrevista', 'Análise Documentos', 'Análise Áudio e vídeo', 'Análise Acessos', 'Análise Sistemas', 'Perito'].map(procedure => (
            <label key={procedure} className={`flex items-center ${isArchived ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
              <input
                type="checkbox"
                checked={currentComplaint.procedures?.includes(procedure as Procedure)}
                onChange={(e) => handleProcedureChange(procedure as Procedure, e.target.checked)}
                disabled={isArchived}
                className={`rounded border-gray-300 ${
                  isArchived 
                    ? 'text-gray-400 bg-gray-100 cursor-not-allowed' 
                    : 'text-blue-600 focus:ring-blue-500'
                }`}
              />
              <span className={`ml-2 text-sm ${isArchived ? 'text-gray-500' : 'text-gray-600'}`}>
                {procedure}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Analysis Points */}
      <div>
        <label className={`block text-sm font-medium ${isArchived ? 'text-gray-500' : 'text-gray-700'} mb-2`}>
          PONTO DE ANÁLISE
        </label>
        <div className="space-y-4">
          {/* New Point Input */}
          <div className="flex space-x-2">
            <input
              type="text"
              value={tempPoint}
              onChange={(e) => setTempPoint(e.target.value)}
              disabled={isArchived}
              className={`flex-1 border border-gray-300 rounded-lg p-2 text-sm ${
                isArchived 
                  ? 'bg-gray-100 text-gray-500 cursor-not-allowed' 
                  : 'focus:ring-blue-500 focus:border-blue-500'
              }`}
              placeholder="Digite um ponto de análise..."
            />
            <button
              type="button"
              onClick={handleAddPoint}
              disabled={isArchived || !tempPoint.trim()}
              className={`px-4 py-2 rounded-lg ${
                isArchived || !tempPoint.trim()
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              Adicionar
            </button>
          </div>

          {/* Analysis Points List */}
          {currentComplaint.analysisPoints && currentComplaint.analysisPoints.length > 0 && (
            <ul className="mt-2 space-y-4">
              {currentComplaint.analysisPoints.map((point, index) => (
                <li key={index} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2 flex-1">
                      {editingIndex === index ? (
                        <>
                          <input
                            type="text"
                            value={point.point}
                            onChange={(e) => handleUpdateAnalysis(index, 'point', e.target.value)}
                            className="w-full border border-gray-300 rounded-lg p-2 text-sm mb-2"
                            placeholder="Ponto de análise"
                          />
                          <textarea
                            value={point.conclusion}
                            onChange={(e) => handleUpdateAnalysis(index, 'conclusion', e.target.value)}
                            className="w-full border border-gray-300 rounded-lg p-2 text-sm mb-2 resize-none h-24"
                            placeholder="Conclusão..."
                          />
                          <select
                            value={point.judgment}
                            onChange={(e) => handleUpdateAnalysis(index, 'judgment', e.target.value)}
                            className="w-full border border-gray-300 rounded-lg p-2 text-sm"
                          >
                            <option value="Inconclusivo">Aguardando parecer</option>
                            <option value="Procedente">Procedente</option>
                            <option value="Parcialmente procedente">Parcialmente procedente</option>
                            <option value="Improcedente">Improcedente</option>
                            <option value="Improcedente">Inconclusivo</option>
                          </select>
                          <div className="mt-2">
                            <button
                              type="button"
                              onClick={() => setEditingIndex(null)}
                              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                            >
                              Concluir Edição
                            </button>
                          </div>
                        </>
                      ) : (
                        <>
                          <p className="text-gray-900 font-medium">{point.point}</p>
                          <p className="text-gray-600 text-sm whitespace-pre-wrap">{point.conclusion}</p>
                          <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full
                            ${point.judgment === 'Procedente' ? 'bg-green-100 text-green-800' :
                              point.judgment === 'Parcialmente procedente' ? 'bg-blue-100 text-blue-800' :
                              point.judgment === 'Improcedente' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'}`}>
                            {point.judgment === 'Inconclusivo' ? 'Aguardando parecer' : point.judgment}
                          </span>
                          {!isArchived && (
                            <button
                              type="button"
                              onClick={() => setEditingIndex(index)}
                              className="ml-2 text-blue-600 hover:text-blue-700"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                          )}
                        </>
                      )}
                    </div>
                    {!isArchived && (
                      <button
                        type="button"
                        onClick={() => {
                          if (editingComplaint) {
                            setEditingComplaint({
                              ...editingComplaint,
                              analysisPoints: editingComplaint.analysisPoints?.filter((_, i) => i !== index)
                            });
                            if (editingIndex === index) {
                              setEditingIndex(null);
                            }
                          }
                        }}
                        className="text-red-500 hover:text-red-700 ml-2"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}