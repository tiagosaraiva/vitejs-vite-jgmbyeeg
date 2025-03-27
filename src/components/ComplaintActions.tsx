import React from 'react';
import { X, Pencil } from 'lucide-react';
import { Action, ActionStatus, ActionType, Complaint } from '../types';
import { updateComplaint } from '../lib/complaintService';
import { useAuth } from '../contexts/AuthContext';
import { useUsers } from '../hooks/useUsers';

interface ComplaintActionsProps {
  currentComplaint: Partial<Complaint>;
  editingComplaint: Complaint | null;
  setEditingComplaint: (complaint: Complaint | null) => void;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>, field: string) => void;
}

export function ComplaintActions({
  currentComplaint,
  editingComplaint,
  setEditingComplaint,
  handleInputChange,
  handleFileChange
}: ComplaintActionsProps) {
  const { user } = useAuth();
  const { users } = useUsers();
  const activeUsers = users.filter(user => user.active);

  const handleAddAction = async () => {
    if (
      !editingComplaint?.newAction?.type ||
      !editingComplaint.newAction.description ||
      !editingComplaint.newAction.responsible ||
      !editingComplaint.newAction.status ||
      !editingComplaint.newAction.startDate ||
      !editingComplaint.newAction.endDate ||
      !user
    ) {
      alert('Por favor, preencha todos os campos obrigatórios da ação');
      return;
    }

    const newAction: Action = {
      type: editingComplaint.newAction.type as ActionType,
      description: editingComplaint.newAction.description,
      responsible: editingComplaint.newAction.responsible,
      status: editingComplaint.newAction.status as ActionStatus,
      startDate: editingComplaint.newAction.startDate,
      endDate: editingComplaint.newAction.endDate,
      observation: editingComplaint.newAction.observation,
      ceoApprovalStatus: 'pending',
      ceoApprovalDate: undefined,
      ceoComments: undefined
    };

    const updatedComplaint = {
      ...editingComplaint,
      actions: [...(editingComplaint.actions || []), newAction],
      newAction: {}
    };

    try {
      await updateComplaint(updatedComplaint);
      setEditingComplaint(updatedComplaint);
    } catch (error) {
      console.error('Erro ao salvar ação:', error);
      alert('Erro ao salvar ação.');
    }
  };

  const handleEditAction = (index: number) => {
    if (!editingComplaint) return;
    const action = editingComplaint.actions?.[index];
    if (action) {
      setEditingComplaint({
        ...editingComplaint,
        newAction: { ...action },
        actions: editingComplaint.actions?.filter((_, i) => i !== index)
      });
    }
  };

  const handleApprovalChange = async (index: number, status: 'approved' | 'rejected', comments?: string) => {
    if (!editingComplaint || !user) return;

    const updatedActions = [...(editingComplaint.actions || [])];
    updatedActions[index] = {
      ...updatedActions[index],
      ceoApprovalStatus: status,
      ceoApprovalDate: new Date().toISOString().split('T')[0],
      ceoComments: comments
    };

    const updatedComplaint = {
      ...editingComplaint,
      actions: updatedActions
    };

    try {
      await updateComplaint(updatedComplaint);
      setEditingComplaint(updatedComplaint);
    } catch (error) {
      console.error('Erro na aprovação:', error);
      alert('Erro ao atualizar aprovação.');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">PLANO DE AÇÃO</label>
        {/* Formulário de Nova Ação */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Tipo de Ação */}
          <div className="col-span-1 md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Ação</label>
            <select
              className="w-full border border-gray-300 rounded-lg p-2"
              onChange={(e) => editingComplaint && setEditingComplaint({
                ...editingComplaint,
                newAction: {
                  ...editingComplaint.newAction,
                  type: e.target.value as ActionType
                }
              })}
              value={editingComplaint?.newAction?.type || ''}
              required
            >
              <option value="">Selecione o tipo de ação</option>
              <option value="Advertência">Advertência</option>
              <option value="Transferência">Transferência</option>
              <option value="Demissão">Demissão</option>
              <option value="Capacitação liderança">Capacitação liderança</option>
              <option value="Capacitação colaborador">Capacitação colaborador</option>
              <option value="Feedback">Feedback</option>
              <option value="Outros">Outros</option>
            </select>
          </div>

          {/* Descrição */}
          <div className="col-span-1 md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
            <textarea
              className="w-full border rounded-lg p-2"
              rows={3}
              onChange={(e) => editingComplaint && setEditingComplaint({
                ...editingComplaint,
                newAction: {
                  ...editingComplaint.newAction,
                  description: e.target.value
                }
              })}
              value={editingComplaint?.newAction?.description || ''}
              required
            />
          </div>

          {/* Responsável */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Responsável</label>
            <select
              className="w-full border rounded-lg p-2"
              onChange={(e) => editingComplaint && setEditingComplaint({
                ...editingComplaint,
                newAction: {
                  ...editingComplaint.newAction,
                  responsible: e.target.value
                }
              })}
              value={editingComplaint?.newAction?.responsible || ''}
              required
            >
              <option value="">Selecione o responsável</option>
              {activeUsers.map(user => (
                <option key={user.id} value={user.name}>{user.name}</option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              className="w-full border rounded-lg p-2"
              onChange={(e) => editingComplaint && setEditingComplaint({
                ...editingComplaint,
                newAction: {
                  ...editingComplaint.newAction,
                  status: e.target.value as ActionStatus
                }
              })}
              value={editingComplaint?.newAction?.status || ''}
              required
            >
              <option value="">Selecione</option>
              <option value="Não iniciado">Não iniciado</option>
              <option value="Em andamento">Em andamento</option>
              <option value="Concluído">Concluído</option>
              <option value="Cancelado">Cancelado</option>
            </select>
          </div>

          {/* Data Início */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data Início</label>
            <input
              type="date"
              className="w-full border rounded-lg p-2"
              onChange={(e) => editingComplaint && setEditingComplaint({
                ...editingComplaint,
                newAction: {
                  ...editingComplaint.newAction,
                  startDate: e.target.value
                }
              })}
              value={editingComplaint?.newAction?.startDate || ''}
              required
            />
          </div>

          {/* Data Fim */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data Fim</label>
            <input
              type="date"
              className="w-full border rounded-lg p-2"
              onChange={(e) => editingComplaint && setEditingComplaint({
                ...editingComplaint,
                newAction: {
                  ...editingComplaint.newAction,
                  endDate: e.target.value
                }
              })}
              value={editingComplaint?.newAction?.endDate || ''}
              required
              min={editingComplaint?.newAction?.startDate}
            />
          </div>

          {/* Observação */}
          <div className="col-span-1 md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Observação</label>
            <textarea
              className="w-full border rounded-lg p-2"
              rows={2}
              onChange={(e) => editingComplaint && setEditingComplaint({
                ...editingComplaint,
                newAction: {
                  ...editingComplaint.newAction,
                  observation: e.target.value
                }
              })}
              value={editingComplaint?.newAction?.observation || ''}
            />
          </div>
        </div>

        <button
          type="button"
          onClick={handleAddAction}
          className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Adicionar Ação
        </button>

        {/* Lista de Ações */}
        {editingComplaint?.actions && editingComplaint.actions.length > 0 && (
          <div className="mt-6 space-y-4">
            {editingComplaint.actions.map((action, index) => (
              <div key={index} className="bg-gray-100 p-4 rounded-lg">
                <div className="flex justify-between">
                  <div>
                    <p className="font-semibold">{action.type}</p>
                    <p className="text-sm text-gray-700">
                      <strong>Responsável:</strong> {action.responsible}<br />
                      <strong>Status:</strong> {action.status}<br />
                      <strong>Período:</strong> {action.startDate} - {action.endDate}
                    </p>
                    <p className="text-sm mt-2 text-gray-800">{action.description}</p>
                    {action.observation && <p className="text-xs text-gray-600"><strong>Obs:</strong> {action.observation}</p>}
                    <p className="text-sm mt-2">
                      {action.ceoApprovalStatus === 'approved' && '✅ Aprovado pelo CEO'}
                      {action.ceoApprovalStatus === 'rejected' && '❌ Rejeitado pelo CEO'}
                      {action.ceoApprovalStatus === 'pending' && '🕓 Aguardando aprovação do CEO'}
                    </p>
                    {action.ceoComments && (
                      <p className="text-xs italic text-gray-500">Comentário CEO: {action.ceoComments}</p>
                    )}
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <button
                      className="text-blue-600 hover:text-blue-800"
                      onClick={() => handleEditAction(index)}
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    {action.ceoApprovalStatus === 'pending' && (
                      <>
                        <button
                          className="text-green-600 hover:text-green-800 text-xs"
                          onClick={() => {
                            const comments = prompt('Comentário da aprovação:') || '';
                            handleApprovalChange(index, 'approved', comments);
                          }}
                        >Aprovar</button>
                        <button
                          className="text-red-600 hover:text-red-800 text-xs"
                          onClick={() => {
                            const comments = prompt('Motivo da rejeição:');
                            if (comments) handleApprovalChange(index, 'rejected', comments);
                          }}
                        >Rejeitar</button>
                      </>
                    )}
                    <button
                      onClick={() => {
                        const updated = [...editingComplaint.actions];
                        updated.splice(index, 1);
                        setEditingComplaint({
                          ...editingComplaint,
                          actions: updated
                        });
                      }}
                      className="text-red-600 hover:text-red-800"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
