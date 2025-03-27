import React, { useState, useEffect, useMemo } from 'react';
import { ClipboardList, Search, Filter, Plus, X, Users, Menu, LogOut, FileText, LayoutDashboard } from 'lucide-react';
import { Complaint } from './types';
import { ComplaintInfo } from './components/ComplaintInfo';
import { ComplaintProgress } from './components/ComplaintProgress';
import { ComplaintInterviews } from './components/ComplaintInterviews';
import { ComplaintActions } from './components/ComplaintActions';
import { ComplaintConclusion } from './components/ComplaintConclusion';
import { ComplaintHistory } from './components/ComplaintHistory';
import { ComplaintReport } from './components/ComplaintReport';
import { Dashboard } from './components/Dashboard';
import { Sidebar } from './components/Sidebar';
import { UserManagement } from './components/UserManagement';
import { LoginPage } from './pages/LoginPage';
import { WelcomePopup } from './components/WelcomePopup';
import { useAuth } from './contexts/AuthContext';
import { addHistoryEntry } from './utils/historyUtils';
import { createComplaint, fetchComplaints, updateComplaint } from './lib/complaintService';

export function App() {
  const { isAuthenticated, user, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeView, setActiveView] = useState<'complaints' | 'users' | 'report' | 'dashboard'>('dashboard');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [editingComplaint, setEditingComplaint] = useState<Complaint | null>(null);
  const [activeModalTab, setActiveModalTab] = useState<'info' | 'progress' | 'interviews' | 'actions' | 'conclusion' | 'history'>('info');
  const [isLoading, setIsLoading] = useState(true);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [kanbanFilters, setKanbanFilters] = useState({
    search: '',
    category: '',
    characteristic: '',
    responsible: '',
    dateFrom: '',
    dateTo: ''
  });
  const [showKanbanFilters, setShowKanbanFilters] = useState(false);
  const [newComplaint, setNewComplaint] = useState<Partial<Complaint>>({
    status: 'nova',
    receivedDate: new Date().toISOString().split('T')[0],
    activeTab: 'info',
    procedures: [],
    interviews: [],
    actions: [],
    history: []
  });

  useEffect(() => {
    loadComplaints();
  }, [user]); // Recarrega quando o usuário mudar

  useEffect(() => {
    if (isAuthenticated && user) {
      setShowWelcome(true);
    }
  }, [isAuthenticated, user]);

  const loadComplaints = async () => {
    try {
      setIsLoading(true);
      const data = await fetchComplaints(user);
      setComplaints(data);
    } catch (error) {
      console.error('Error loading complaints:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const categories = useMemo(() => 
    Array.from(new Set(complaints.map(c => c.category))).sort(),
    [complaints]
  );

  const characteristics = useMemo(() => 
    Array.from(new Set(complaints.map(c => c.characteristic))).sort(),
    [complaints]
  );

  const allResponsibles = useMemo(() => 
    Array.from(new Set(complaints.flatMap(c => [c.responsible1, c.responsible2]))).sort(),
    [complaints]
  );

  const filteredComplaints = useMemo(() => {
    return complaints.filter(complaint => {
      const searchLower = kanbanFilters.search.toLowerCase();
      const matchesSearch = !kanbanFilters.search || 
        complaint.complaintNumber.toLowerCase().includes(searchLower) ||
        complaint.category.toLowerCase().includes(searchLower) ||
        complaint.characteristic.toLowerCase().includes(searchLower) ||
        complaint.responsible1.toLowerCase().includes(searchLower) ||
        complaint.responsible2.toLowerCase().includes(searchLower);

      const matchesCategory = !kanbanFilters.category || 
        complaint.category === kanbanFilters.category;

      const matchesCharacteristic = !kanbanFilters.characteristic || 
        complaint.characteristic === kanbanFilters.characteristic;

      const matchesResponsible = !kanbanFilters.responsible || 
        complaint.responsible1 === kanbanFilters.responsible ||
        complaint.responsible2 === kanbanFilters.responsible;

      const complaintDate = new Date(complaint.receivedDate);
      const matchesDateFrom = !kanbanFilters.dateFrom || 
        complaintDate >= new Date(kanbanFilters.dateFrom);
      const matchesDateTo = !kanbanFilters.dateTo || 
        complaintDate <= new Date(kanbanFilters.dateTo);

      // Não mostrar denúncias onde o usuário atual é o membro afastado
      const isNotRemovedMember = !user || complaint.removedMember !== user.name;

      return matchesSearch && matchesCategory && matchesCharacteristic && 
             matchesResponsible && matchesDateFrom && matchesDateTo && isNotRemovedMember;
    });
  }, [complaints, kanbanFilters, user]);

  const clearKanbanFilters = () => {
    setKanbanFilters({
      search: '',
      category: '',
      characteristic: '',
      responsible: '',
      dateFrom: '',
      dateTo: ''
    });
  };

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  const columns = [
    { id: 'nova', title: 'Nova Denúncia', color: 'bg-blue-100' },
    { id: 'investigacao', title: 'Em Investigação', color: 'bg-yellow-100' },
    { id: 'concluida', title: 'Concluída', color: 'bg-green-100' },
    { id: 'arquivada', title: 'Arquivada', color: 'bg-gray-100' }
  ];

  const handleDragStart = (e: React.DragEvent, complaintId: string) => {
    e.dataTransfer.setData('complaintId', complaintId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, status: string) => {
    e.preventDefault();
    if (!user) return;

    const complaintId = e.dataTransfer.getData('complaintId');
    const complaint = complaints.find(c => c.id === complaintId);
    
    if (complaint) {
      const updatedComplaint = {
        ...complaint,
        status: status as Complaint['status'],
        history: addHistoryEntry(
          complaint.history || [],
          'status',
          complaint.status,
          status,
          'update'
        )
      };

      try {
        await updateComplaint(updatedComplaint);
        await loadComplaints();
      } catch (error) {
        console.error('Error updating complaint status:', error);
        alert('Erro ao atualizar o status da denúncia. Por favor, tente novamente.');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    try {
      if (editingComplaint) {
        await updateComplaint(editingComplaint);
      } else {
        await createComplaint(newComplaint as Complaint);
      }

      await loadComplaints();
      handleCloseModal();
    } catch (error) {
      console.error('Error saving complaint:', error);
      alert(error.message || 'Erro ao salvar denúncia. Por favor, tente novamente.');
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingComplaint(null);
    setActiveModalTab('info');
    setNewComplaint({
      status: 'nova',
      receivedDate: new Date().toISOString().split('T')[0],
      activeTab: 'info',
      procedures: [],
      interviews: [],
      actions: [],
      history: []
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (editingComplaint) {
      setEditingComplaint({
        ...editingComplaint,
        [name]: value
      });
    } else {
      setNewComplaint({
        ...newComplaint,
        [name]: value
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    const file = e.target.files?.[0];
    if (file && editingComplaint) {
      setEditingComplaint({
        ...editingComplaint,
        [field]: file.name
      });
    } else if (file) {
      setNewComplaint({
        ...newComplaint,
        [field]: file.name
      });
    }
  };

  const handleProcedureChange = (procedure: Procedure, checked: boolean) => {
    if (editingComplaint) {
      const updatedProcedures = checked
        ? [...(editingComplaint.procedures || []), procedure]
        : editingComplaint.procedures?.filter(p => p !== procedure) || [];
      
      setEditingComplaint({
        ...editingComplaint,
        procedures: updatedProcedures
      });
    } else {
      const updatedProcedures = checked
        ? [...(newComplaint.procedures || []), procedure]
        : newComplaint.procedures?.filter(p => p !== procedure) || [];
      
      setNewComplaint({
        ...newComplaint,
        procedures: updatedProcedures
      });
    }
  };

  const handleEditComplaint = (complaint: Complaint) => {
    // Não permitir edição se o usuário for o membro afastado
    if (user && complaint.removedMember === user.name) {
      alert('Você não tem permissão para editar esta denúncia pois está marcado como membro afastado.');
      return;
    }
    
    setEditingComplaint(complaint);
    setActiveModalTab('info');
    setIsModalOpen(true);
  };

  const calculateSLA = (complaint: Complaint) => {
    const startDate = new Date(complaint.receivedDate);
    const endDate = complaint.conclusion?.dataEncerramento 
      ? new Date(complaint.conclusion.dataEncerramento)
      : new Date();
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar 
        isOpen={isSidebarOpen} 
        setIsOpen={setIsSidebarOpen}
        activeView={activeView}
        setActiveView={setActiveView}
      />

      <div className="flex-1">
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <button
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                  className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 lg:hidden"
                >
                  <Menu className="h-6 w-6" />
                </button>
                <div className="flex items-center ml-2 lg:ml-0">
                  {activeView === 'complaints' ? (
                    <>
                      <ClipboardList className="h-8 w-8 text-blue-600" />
                      <h1 className="ml-2 text-2xl font-bold text-gray-900">Sistema de Denúncias</h1>
                    </>
                  ) : activeView === 'report' ? (
                    <>
                      <FileText className="h-8 w-8 text-blue-600" />
                      <h1 className="ml-2 text-2xl font-bold text-gray-900">Relatórios</h1>
                    </>
                  ) : activeView === 'dashboard' ? (
                    <>
                      <LayoutDashboard className="h-8 w-8 text-blue-600" />
                      <h1 className="ml-2 text-2xl font-bold text-gray-900">Dashboard</h1>
                    </>
                  ) : (
                    <>
                      <Users className="h-8 w-8 text-blue-600" />
                      <h1 className="ml-2 text-2xl font-bold text-gray-900">Gestão de Usuários</h1>
                    </>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={logout}
                  className="flex items-center px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors duration-200"
                  title="Sair do sistema"
                >
                  <LogOut className="h-5 w-5 mr-2" />
                  <span className="hidden sm:inline">Sair</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          {activeView === 'complaints' && (
            <div className="space-y-6">
              {/* Kanban Filters */}
              <div className="bg-white rounded-lg shadow-sm p-4">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setShowKanbanFilters(!showKanbanFilters)}
                      className="flex items-center px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                    >
                      <Filter className="h-5 w-5 mr-2" />
                      Filtros
                    </button>
                    {Object.values(kanbanFilters).some(v => v) && (
                      <button
                        onClick={clearKanbanFilters}
                        className="text-sm text-red-600 hover:text-red-700 flex items-center"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Limpar filtros
                      </button>
                    )}
                  </div>
                  <button 
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Plus className="h-5 w-5 mr-1" />
                    Nova Denúncia
                  </button>
                </div>

                {showKanbanFilters && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                    <div>
                      <input
                        type="text"
                        placeholder="Buscar denúncia..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        value={kanbanFilters.search}
                        onChange={(e) => setKanbanFilters(prev => ({ ...prev, search: e.target.value }))}
                      />
                    </div>

                    <div>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        value={kanbanFilters.category}
                        onChange={(e) => setKanbanFilters(prev => ({ ...prev, category: e.target.value }))}
                      >
                        <option value="">Todas as categorias</option>
                        {categories.map(category => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        value={kanbanFilters.characteristic}
                        onChange={(e) => setKanbanFilters(prev => ({ ...prev, characteristic: e.target.value }))}
                      >
                        <option value="">Todas as características</option>
                        {characteristics.map(characteristic => (
                          <option key={characteristic} value={characteristic}>{characteristic}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        value={kanbanFilters.responsible}
                        onChange={(e) => setKanbanFilters(prev => ({ ...prev, responsible: e.target.value }))}
                      >
                        <option value="">Todos os responsáveis</option>
                        {allResponsibles.map(responsible => (
                          <option key={responsible} value={responsible}>{responsible}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <input
                        type="date"
                        placeholder="Data inicial"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        value={kanbanFilters.dateFrom}
                        onChange={(e) => setKanbanFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                      />
                    </div>

                    <div>
                      <input
                        type="date"
                        placeholder="Data final"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        value={kanbanFilters.dateTo}
                        onChange={(e) => setKanbanFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                        min={kanbanFilters.dateFrom}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Kanban Board */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {columns.map(column => (
                  <div
                    key={column.id}
                    className="kanban-column"
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, column.id)}
                  >
                    <div className={`kanban-header ${column.id === 'nova' ? 'kanban-column-nova' : 
                                                   column.id === 'investigacao' ? 'kanban-column-investigacao' :
                                                   column.id === 'concluida' ? 'kanban-column-concluida' :
                                                   'kanban-column-arquivada'}`}>
                      <h2 className="font-semibold text-gray-900">{column.title}</h2>
                      <span className="text-sm text-gray-600">
                        {filteredComplaints.filter(c => c.status === column.id).length} denúncias
                      </span>
                    </div>
                    <div className="kanban-scroll">
                      {filteredComplaints
                        .filter(complaint => complaint.status === column.id)
                        .map(complaint => (
                          <div
                            key={complaint.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, complaint.id)}
                            onClick={() => handleEditComplaint(complaint)}
                            className="kanban-card"
                            data-status={complaint.status}
                          >
                            {/* SLA Tag */}
                            <div className={`absolute -top-3 right-2 px-2 py-1 text-xs font-medium rounded-full shadow-sm
                              ${complaint.status === 'concluida' 
                                ? 'bg-green-100 text-green-800' 
                                : complaint.status === 'arquivada'
                                ? 'bg-gray-100 text-gray-800'
                                : 'bg-blue-100 text-blue-800'}`}
                            >
                              SLA: {calculateSLA(complaint)}d
                            </div>
                            <h3 className="font-medium text-gray-900">{complaint.complaintNumber}</h3>
                            {complaint.status !== 'arquivada' && (
                              <>
                                <p className="text-sm text-gray-600 mt-1">
                                  <span className="font-medium">Categoria:</span> {complaint.category}<br />
                                  <span className="font-medium">Característica:</span> {complaint.characteristic}<br />
                                  <span className="font-medium">Instância:</span> {complaint.responsibleInstance}
                                </p>
                                <div className="mt-2 flex justify-between items-center text-xs text-gray-500">
                                  <span>Recebido: {new Date(complaint.receivedDate).toLocaleDateString('pt-BR')}</span>
                                  <span>Resp: {complaint.responsible1}</span>
                                </div>
                              </>
                            )}
                          </div>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {activeView === 'report' && (
            <ComplaintReport complaints={complaints} />
          )}
          {activeView === 'dashboard' && (
            <Dashboard complaints={complaints} />
          )}
          {activeView === 'users' && (
            <UserManagement />
          )}
        </main>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingComplaint ? `Denúncia ${editingComplaint.complaintNumber}` : 'Nova Denúncia'}
                </h2>
                <button 
                  onClick={handleCloseModal}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Tabs */}
                <div className="border-b border-gray-200">
                  <nav className="-mb-px flex space-x-8">
                    <button
                      type="button"
                      onClick={() => setActiveModalTab('info')}
                      className={`py-4 px-1 border-b-2 font-medium text-sm ${
                        activeModalTab === 'info'
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      Informações
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveModalTab('progress')}
                      className={`py-4 px-1 border-b-2 font-medium text-sm ${
                        activeModalTab === 'progress'
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      Progresso
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveModalTab('interviews')}
                      className={`py-4 px-1 border-b-2 font-medium text-sm ${
                        activeModalTab === 'interviews'
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      Entrevistas
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveModalTab('actions')}
                      className={`py-4 px-1 border-b-2 font-medium text-sm ${
                        activeModalTab === 'actions'
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      Ações
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveModalTab('conclusion')}
                      className={`py-4 px-1 border-b-2 font-medium text-sm ${
                        activeModalTab === 'conclusion'
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      Conclusão
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveModalTab('history')}
                      className={`py-4 px-1 border-b-2 font-medium text-sm ${
                        activeModalTab === 'history'
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      Histórico
                    </button>
                  </nav>
                </div>

                {/* Tab Content */}
                <div className="overflow-y-auto max-h-[60vh] p-4">
                  {activeModalTab === 'info' && (
                    <ComplaintInfo
                      currentComplaint={editingComplaint || newComplaint}
                      editingComplaint={editingComplaint}
                      handleInputChange={handleInputChange}
                      handleFileChange={handleFileChange}
                    />
                  )}
                  {activeModalTab === 'progress' && (
                    <ComplaintProgress
                      currentComplaint={editingComplaint || newComplaint}
                      editingComplaint={editingComplaint}
                      handleProcedureChange={handleProcedureChange}
                      setEditingComplaint={setEditingComplaint}
                    />
                  )}
                  {activeModalTab === 'interviews' && (
                    <ComplaintInterviews
                      currentComplaint={editingComplaint || newComplaint}
                      editingComplaint={editingComplaint}
                      setEditingComplaint={setEditingComplaint}
                    />
                  )}
                  {activeModalTab === 'actions' && (
                    <ComplaintActions
                      currentComplaint={editingComplaint || newComplaint}
                      editingComplaint={editingComplaint}
                      setEditingComplaint={setEditingComplaint}
                    />
                  )}
                  {activeModalTab === 'conclusion' && (
                    <ComplaintConclusion
                      currentComplaint={editingComplaint || newComplaint}
                      editingComplaint={editingComplaint}
                      setEditingComplaint={setEditingComplaint}
                    />
                  )}
                  {activeModalTab === 'history' && editingComplaint?.history && (
                    <ComplaintHistory history={editingComplaint.history} />
                  )}
                </div>

                {/* Form Actions */}
                <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    Cancelar
                  </button>
                  {editingComplaint?.status !== 'arquivada' && (
                    <button
                      type="submit"
                      className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                    >
                      {editingComplaint ? 'Salvar Alterações' : 'Criar Denúncia'}
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {showWelcome && user && (
        <WelcomePopup 
          userName={user.name}
          onClose={() => setShowWelcome(false)}
        />
      )}
    </div>
  );
}

export default App