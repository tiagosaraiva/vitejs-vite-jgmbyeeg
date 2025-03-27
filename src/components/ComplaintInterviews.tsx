import React from 'react';
import { X } from 'lucide-react';
import { Complaint, Interview, InterviewType } from '../types';

interface ComplaintInterviewsProps {
  currentComplaint: Partial<Complaint>;
  editingComplaint: Complaint | null;
  setEditingComplaint: (complaint: Complaint | null) => void;
}

export function ComplaintInterviews({
  currentComplaint,
  editingComplaint,
  setEditingComplaint
}: ComplaintInterviewsProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        ENTREVISTAS
      </label>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tipo
          </label>
          <select
            name="type"
            className="w-full border border-gray-300 rounded-lg p-2 focus:ring-blue-500 focus:border-blue-500"
            onChange={(e) => {
              if (editingComplaint) {
                setEditingComplaint({
                  ...editingComplaint,
                  newInterview: {
                    ...editingComplaint.newInterview,
                    type: e.target.value as InterviewType
                  }
                });
              }
            }}
            value={currentComplaint.newInterview?.type || ''}
          >
            <option value="">Selecione o tipo</option>
            <option value="Testemunha">Testemunha</option>
            <option value="Denunciado">Denunciado</option>
            <option value="Denunciante">Denunciante</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Data Agendada
          </label>
          <input
            type="date"
            className="w-full border border-gray-300 rounded-lg p-2 focus:ring-blue-500 focus:border-blue-500"
            onChange={(e) => {
              if (editingComplaint) {
                setEditingComplaint({
                  ...editingComplaint,
                  newInterview: {
                    ...editingComplaint.newInterview,
                    scheduledDate: e.target.value
                  }
                });
              }
            }}
            value={currentComplaint.newInterview?.scheduledDate || ''}
          />
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Transcrição
          </label>
          <textarea
            className="w-full border border-gray-300 rounded-lg p-2 focus:ring-blue-500 focus:border-blue-500"
            rows={4}
            onChange={(e) => {
              if (editingComplaint) {
                setEditingComplaint({
                  ...editingComplaint,
                  newInterview: {
                    ...editingComplaint.newInterview,
                    transcription: e.target.value
                  }
                });
              }
            }}
            value={currentComplaint.newInterview?.transcription || ''}
          />
        </div>
      </div>
      <button
        type="button"
        onClick={() => {
          if (editingComplaint?.newInterview?.type && 
              editingComplaint.newInterview.scheduledDate &&
              editingComplaint.newInterview.transcription) {
            setEditingComplaint({
              ...editingComplaint,
              interviews: [...(editingComplaint.interviews || []), editingComplaint.newInterview as Interview],
              newInterview: {}
            });
          }
        }}
        className="mt-4 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        Adicionar Entrevista
      </button>

      {/* Interview List */}
      {currentComplaint.interviews && currentComplaint.interviews.length > 0 && (
        <div className="mt-4 space-y-4">
          {currentComplaint.interviews.map((interview, index) => (
            <div key={index} className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium text-gray-900">{interview.type}</h4>
                  <p className="text-sm text-gray-600">
                    Data: {new Date(interview.scheduledDate).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (editingComplaint) {
                      setEditingComplaint({
                        ...editingComplaint,
                        interviews: editingComplaint.interviews?.filter((_, i) => i !== index)
                      });
                    }
                  }}
                  className="text-red-500 hover:text-red-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <p className="mt-2 text-sm text-gray-700">{interview.transcription}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}