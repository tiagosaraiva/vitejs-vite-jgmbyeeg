import React from 'react';
import { X } from 'lucide-react';

interface WelcomePopupProps {
  userName: string;
  onClose: () => void;
}

export function WelcomePopup({ userName, onClose }: WelcomePopupProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">Bem-vindo!</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <div className="space-y-4">
          <p className="text-gray-700">
            Olá, <span className="font-semibold">{userName}</span>! 
          </p>
          <p className="text-gray-600">
            Seja bem-vindo ao Sistema de Denúncias. Aqui você pode gerenciar e acompanhar todas as denúncias de forma eficiente e organizada.
          </p>
          <p className="text-gray-600">
            Use o menu lateral para navegar entre as diferentes seções do sistema.
          </p>
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Começar
        </button>
      </div>
    </div>
  );
}