import React from 'react';
import { Upload } from 'lucide-react';
import { Complaint, User } from '../types';
import { useUsers } from '../hooks/useUsers';

interface ComplaintInfoProps {
  currentComplaint: Partial<Complaint>;
  editingComplaint: Complaint | null;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>, field: string) => void;
}

const responsibleInstances = [
  'Comitê de Compliance',
  'Diretoria/CAD/Presidência',
  'Comitê com afastamento de membro'
];

const characteristics = [
  'Horizontal',
  'Vertical',
  'Terceiro',
  'Cliente',
  'N/A'
];

export function ComplaintInfo({
  currentComplaint,
  editingComplaint,
  handleInputChange,
  handleFileChange
}: ComplaintInfoProps) {
  const isArchived = currentComplaint.status === 'arquivada';
  const { users } = useUsers();
  
  // Filter only active users
  const activeUsers = users.filter(user => user.active);

  return (
    <div className="grid grid-cols-2 gap-6">
      {/* Category */}
      <div>
        <label className={`block text-sm font-medium ${isArchived ? 'text-gray-500' : 'text-gray-700'} mb-1`}>
          Categoria
        </label>
        <select
          name="category"
          required
          disabled={isArchived}
          className={`w-full border border-gray-300 rounded-lg p-2 ${
            isArchived 
              ? 'bg-gray-100 text-gray-500 cursor-not-allowed' 
              : 'focus:ring-blue-500 focus:border-blue-500'
          }`}
          onChange={handleInputChange}
          value={currentComplaint.category || ''}
        >
          <option value="">Selecione a categoria</option>
          <option value="Abuso de autoridade e favorecimento indevido">Abuso de autoridade e favorecimento indevido</option>
          <option value="Assédio moral">Assédio moral</option>
          <option value="Assédio sexual">Assédio sexual</option>
          <option value="Conduta inadequada">Conduta inadequada</option>
          <option value="Conflito de interesses">Conflito de interesses</option>
          <option value="Corrupção, suborno ou lavagem de dinheiro">Corrupção, suborno ou lavagem de dinheiro</option>
          <option value="Descumprimento de políticas, normas e procedimentos">Descumprimento de políticas, normas e procedimentos</option>
          <option value="Discriminação">Discriminação</option>
          <option value="Fraude">Fraude</option>
          <option value="Furto, roubo ou desvio de recursos">Furto, roubo ou desvio de recursos</option>
          <option value="Outros">Outros</option>
        </select>
      </div>

      {/* Characteristic */}
      <div>
        <label className={`block text-sm font-medium ${isArchived ? 'text-gray-500' : 'text-gray-700'} mb-1`}>
          Característica
        </label>
        <select
          name="characteristic"
          required
          disabled={isArchived}
          className={`w-full border border-gray-300 rounded-lg p-2 ${
            isArchived 
              ? 'bg-gray-100 text-gray-500 cursor-not-allowed' 
              : 'focus:ring-blue-500 focus:border-blue-500'
          }`}
          onChange={handleInputChange}
          value={currentComplaint.characteristic || ''}
        >
          <option value="">Selecione a característica</option>
          {characteristics.map(characteristic => (
            <option key={characteristic} value={characteristic}>{characteristic}</option>
          ))}
        </select>
      </div>

      {/* Complaint Number */}
      <div>
        <label className={`block text-sm font-medium ${isArchived ? 'text-gray-500' : 'text-gray-700'} mb-1`}>
          Número da Denúncia
        </label>
        <input
          type="text"
          name="complaintNumber"
          required
          disabled={isArchived}
          className={`w-full border border-gray-300 rounded-lg p-2 ${
            isArchived 
              ? 'bg-gray-100 text-gray-500 cursor-not-allowed' 
              : 'focus:ring-blue-500 focus:border-blue-500'
          }`}
          onChange={handleInputChange}
          value={currentComplaint.complaintNumber || ''}
          placeholder="Digite o número da denúncia..."
        />
      </div>

      {/* Responsible Instance */}
      <div>
        <label className={`block text-sm font-medium ${isArchived ? 'text-gray-500' : 'text-gray-700'} mb-1`}>
          Instância Responsável
        </label>
        <select
          name="responsibleInstance"
          required
          disabled={isArchived}
          className={`w-full border border-gray-300 rounded-lg p-2 ${
            isArchived 
              ? 'bg-gray-100 text-gray-500 cursor-not-allowed' 
              : 'focus:ring-blue-500 focus:border-blue-500'
          }`}
          onChange={handleInputChange}
          value={currentComplaint.responsibleInstance || ''}
        >
          <option value="">Selecione a instância responsável</option>
          {responsibleInstances.map(instance => (
            <option key={instance} value={instance}>{instance}</option>
          ))}
        </select>
      </div>

      {/* Removed Member - Only shown when "Comitê com afastamento de membro" is selected */}
      {currentComplaint.responsibleInstance === 'Comitê com afastamento de membro' && (
        <div>
          <label className={`block text-sm font-medium ${isArchived ? 'text-gray-500' : 'text-gray-700'} mb-1`}>
            Membro Afastado
          </label>
          <select
            name="removedMember"
            required
            disabled={isArchived}
            className={`w-full border border-gray-300 rounded-lg p-2 ${
              isArchived 
                ? 'bg-gray-100 text-gray-500 cursor-not-allowed' 
                : 'focus:ring-blue-500 focus:border-blue-500'
            }`}
            onChange={handleInputChange}
            value={currentComplaint.removedMember || ''}
          >
            <option value="">Selecione o membro afastado</option>
            {activeUsers.map(user => (
              <option key={user.id} value={user.name}>{user.name}</option>
            ))}
          </select>
        </div>
      )}

      {/* Responsible 1 */}
      <div>
        <label className={`block text-sm font-medium ${isArchived ? 'text-gray-500' : 'text-gray-700'} mb-1`}>
          Responsável 1
        </label>
        <select
          name="responsible1"
          required
          disabled={isArchived}
          className={`w-full border border-gray-300 rounded-lg p-2 ${
            isArchived 
              ? 'bg-gray-100 text-gray-500 cursor-not-allowed' 
              : 'focus:ring-blue-500 focus:border-blue-500'
          }`}
          onChange={handleInputChange}
          value={currentComplaint.responsible1 || ''}
        >
          <option value="">Selecione o responsável</option>
          {activeUsers.map(user => (
            <option key={user.id} value={user.name}>{user.name}</option>
          ))}
        </select>
      </div>

      {/* Responsible 2 */}
      <div>
        <label className={`block text-sm font-medium ${isArchived ? 'text-gray-500' : 'text-gray-700'} mb-1`}>
          Responsável 2
        </label>
        <select
          name="responsible2"
          required
          disabled={isArchived}
          className={`w-full border border-gray-300 rounded-lg p-2 ${
            isArchived 
              ? 'bg-gray-100 text-gray-500 cursor-not-allowed' 
              : 'focus:ring-blue-500 focus:border-blue-500'
          }`}
          onChange={handleInputChange}
          value={currentComplaint.responsible2 || ''}
        >
          <option value="">Selecione o responsável</option>
          {activeUsers
            .filter(user => user.name !== currentComplaint.responsible1)
            .map(user => (
              <option key={user.id} value={user.name}>{user.name}</option>
            ))}
        </select>
      </div>

      {/* Received Date */}
      <div>
        <label className={`block text-sm font-medium ${isArchived ? 'text-gray-500' : 'text-gray-700'} mb-1`}>
          Data Recebimento
        </label>
        <input
          type="date"
          name="receivedDate"
          required
          disabled={isArchived}
          className={`w-full border border-gray-300 rounded-lg p-2 ${
            isArchived 
              ? 'bg-gray-100 text-gray-500 cursor-not-allowed' 
              : 'focus:ring-blue-500 focus:border-blue-500'
          }`}
          onChange={handleInputChange}
          value={currentComplaint.receivedDate || ''}
        />
      </div>

      {/* Status */}
      <div>
        <label className={`block text-sm font-medium ${isArchived ? 'text-gray-500' : 'text-gray-700'} mb-1`}>
          Status
        </label>
        <select
          name="status"
          required
          disabled={isArchived}
          className={`w-full border border-gray-300 rounded-lg p-2 ${
            isArchived 
              ? 'bg-gray-100 text-gray-500 cursor-not-allowed' 
              : 'focus:ring-blue-500 focus:border-blue-500'
          }`}
          onChange={handleInputChange}
          value={currentComplaint.status}
        >
          <option value="nova">Nova Denúncia</option>
          <option value="investigacao">Em Investigação</option>
          <option value="concluida">Concluída</option>
          <option value="arquivada">Arquivada</option>
        </select>
      </div>

      {/* File Uploads */}
      <div className="col-span-2 space-y-4">
        <div>
          <label className={`block text-sm font-medium ${isArchived ? 'text-gray-500' : 'text-gray-700'} mb-1`}>
            Anexo Denúncia
          </label>
          <div className="flex items-center space-x-2">
            <label className={`flex items-center px-4 py-2 ${
              isArchived 
                ? 'bg-gray-100 text-gray-500 cursor-not-allowed' 
                : 'bg-gray-100 text-gray-700 cursor-pointer hover:bg-gray-200'
            }`}>
              <Upload className="h-5 w-5 mr-2" />
              <span>Escolher arquivo</span>
              <input
                type="file"
                className="hidden"
                disabled={isArchived}
                onChange={(e) => handleFileChange(e, 'complaintAttachment')}
              />
            </label>
            {currentComplaint.complaintAttachment && (
              <span className="text-sm text-gray-600">
                {currentComplaint.complaintAttachment}
              </span>
            )}
          </div>
        </div>

        <div>
          <label className={`block text-sm font-medium ${isArchived ? 'text-gray-500' : 'text-gray-700'} mb-1`}>
            Anexo Evidências
          </label>
          <div className="flex items-center space-x-2">
            <label className={`flex items-center px-4 py-2 ${
              isArchived 
                ? 'bg-gray-100 text-gray-500 cursor-not-allowed' 
                : 'bg-gray-100 text-gray-700 cursor-pointer hover:bg-gray-200'
            }`}>
              <Upload className="h-5 w-5 mr-2" />
              <span>Escolher arquivo</span>
              <input
                type="file"
                className="hidden"
                disabled={isArchived}
                onChange={(e) => handleFileChange(e, 'evidenceAttachment')}
              />
            </label>
            {currentComplaint.evidenceAttachment && (
              <span className="text-sm text-gray-600">
                {currentComplaint.evidenceAttachment}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}