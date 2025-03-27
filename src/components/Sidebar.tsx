import React from 'react';
import { ClipboardList, Users, ChevronLeft, LogOut, FileText, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  activeView: 'complaints' | 'users' | 'report' | 'dashboard';
  setActiveView: (view: 'complaints' | 'users' | 'report' | 'dashboard') => void;
}

export function Sidebar({ isOpen, setIsOpen, activeView, setActiveView }: SidebarProps) {
  const { user, logout } = useAuth();

  return (
    <>
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out
        lg:relative lg:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 lg:hidden"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          </div>

          <nav className="flex-1 p-4 space-y-2">
            <button
              onClick={() => setActiveView('complaints')}
              className={`
                w-full flex items-center px-4 py-2 rounded-lg text-sm font-medium
                ${activeView === 'complaints'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-100'}
              `}
            >
              <ClipboardList className="h-5 w-5 mr-3" />
              Denúncias
            </button>

            <button
              onClick={() => setActiveView('dashboard')}
              className={`
                w-full flex items-center px-4 py-2 rounded-lg text-sm font-medium
                ${activeView === 'dashboard'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-100'}
              `}
            >
              <LayoutDashboard className="h-5 w-5 mr-3" />
              Dashboard
            </button>

            <button
              onClick={() => setActiveView('report')}
              className={`
                w-full flex items-center px-4 py-2 rounded-lg text-sm font-medium
                ${activeView === 'report'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-100'}
              `}
            >
              <FileText className="h-5 w-5 mr-3" />
              Relatórios
            </button>

            <button
              onClick={() => setActiveView('users')}
              className={`
                w-full flex items-center px-4 py-2 rounded-lg text-sm font-medium
                ${activeView === 'users'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-100'}
              `}
            >
              <Users className="h-5 w-5 mr-3" />
              Usuários
            </button>
          </nav>

          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-blue-700">
                    {user?.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                  <p className="text-xs text-gray-500">
                    {user?.role === 'admin' ? 'Administrador' :
                     user?.role === 'manager' ? 'Gestor' : 'Usuário'}
                  </p>
                </div>
              </div>
              <button
                onClick={logout}
                className="p-2 text-gray-600 hover:text-red-600 rounded-lg hover:bg-gray-100"
                title="Sair"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}