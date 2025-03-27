import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import { User, UserRole } from '../types';
import { supabase } from '../lib/supabase';

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [newUser, setNewUser] = useState<Partial<User>>({
    active: true
  });
  const [passwordError, setPasswordError] = useState('');
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching users:', error);
      return;
    }

    setUsers(data || []);
  };

  const validatePasswords = (password: string, confirm: string) => {
    if (password.length < 8) {
      setPasswordError('A senha deve ter pelo menos 8 caracteres');
      return false;
    }
    if (password !== confirm) {
      setPasswordError('As senhas não coincidem');
      return false;
    }
    setPasswordError('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingUser) {
        // Atualiza usuário existente
        const updates = {
          name: editingUser.name,
          role: editingUser.role,
          active: editingUser.active,
          updated_at: new Date().toISOString()
        };

        if (showChangePassword && newPassword) {
          if (!validatePasswords(newPassword, newPasswordConfirm)) {
            return;
          }
          updates['password'] = newPassword;
        }

        const { error } = await supabase
          .from('users')
          .update(updates)
          .eq('id', editingUser.id);

        if (error) throw error;
      } else {
        // Cria novo usuário
        if (!newUser.password || !newPasswordConfirm) {
          setPasswordError('Senha é obrigatória');
          return;
        }

        if (!validatePasswords(newUser.password, newPasswordConfirm)) {
          return;
        }

        const { error } = await supabase
          .from('users')
          .insert([{
            name: newUser.name,
            email: newUser.email,
            password: newUser.password,
            role: newUser.role,
            active: newUser.active
          }]);

        if (error) throw error;
      }

      await fetchUsers();
      handleCloseModal();
    } catch (error) {
      console.error('Error saving user:', error);
      alert('Erro ao salvar usuário. Por favor, tente novamente.');
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
    setNewUser({ active: true });
    setPasswordError('');
    setShowChangePassword(false);
    setNewPassword('');
    setNewPasswordConfirm('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const finalValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;

    if (editingUser) {
      setEditingUser({ ...editingUser, [name]: finalValue });
    } else {
      setNewUser({ ...newUser, [name]: finalValue });
    }

    if (name === 'password' || name === 'passwordConfirm') {
      setPasswordError('');
    }
  };

  const handleDeleteUser = async (user: User) => {
    if (user.role === 'admin') {
      const activeAdmins = users.filter(u => u.id !== user.id && u.role === 'admin' && u.active);
      if (activeAdmins.length === 0) {
        alert('Não é possível excluir o último administrador do sistema.');
        return;
      }
    }

    if (window.confirm('Tem certeza que deseja excluir este usuário?')) {
      try {
        const { error } = await supabase
          .from('users')
          .delete()
          .eq('id', user.id);

        if (error) throw error;

        await fetchUsers();
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('Erro ao excluir usuário. Por favor, tente novamente.');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900">Gerenciamento de Usuários</h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="h-5 w-5 mr-2" />
          Novo Usuário
        </button>
      </div>

      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nome
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Função
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map(user => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{user.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{user.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                    ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 
                      user.role === 'manager' ? 'bg-blue-100 text-blue-800' : 
                      'bg-green-100 text-green-800'}`}
                  >
                    {user.role === 'admin' ? 'Administrador' :
                     user.role === 'manager' ? 'Gestor' : 'Usuário'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                    ${user.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                  >
                    {user.active ? 'Ativo' : 'Inativo'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => {
                      setEditingUser(user);
                      setIsModalOpen(true);
                    }}
                    className="text-blue-600 hover:text-blue-900 mr-4"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteUser(user)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingUser ? 'Editar Usuário' : 'Novo Usuário'}
                </h2>
                <button 
                  onClick={handleCloseModal}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-blue-500 focus:border-blue-500"
                    onChange={handleInputChange}
                    value={editingUser?.name || newUser.name || ''}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    disabled={!!editingUser}
                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-blue-500 focus:border-blue-500"
                    onChange={handleInputChange}
                    value={editingUser?.email || newUser.email || ''}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Função
                  </label>
                  <select
                    name="role"
                    required
                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-blue-500 focus:border-blue-500"
                    onChange={handleInputChange}
                    value={editingUser?.role || newUser.role || ''}
                  >
                    <option value="">Selecione a função</option>
                    <option value="admin">Administrador</option>
                    <option value="manager">Gestor</option>
                    <option value="user">Usuário</option>
                  </select>
                </div>

                {!editingUser && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Senha
                      </label>
                      <input
                        type="password"
                        name="password"
                        required
                        minLength={8}
                        className="w-full border border-gray-300 rounded-lg p-2 focus:ring-blue-500 focus:border-blue-500"
                        onChange={handleInputChange}
                        value={newUser.password || ''}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Confirmar Senha
                      </label>
                      <input
                        type="password"
                        required
                        minLength={8}
                        className="w-full border border-gray-300 rounded-lg p-2 focus:ring-blue-500 focus:border-blue-500"
                        onChange={(e) => setNewPasswordConfirm(e.target.value)}
                        value={newPasswordConfirm}
                      />
                    </div>
                  </>
                )}

                {editingUser && (
                  <div className="space-y-4">
                    <button
                      type="button"
                      onClick={() => setShowChangePassword(!showChangePassword)}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      {showChangePassword ? 'Cancelar alteração de senha' : 'Alterar senha'}
                    </button>

                    {showChangePassword && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Nova Senha
                          </label>
                          <input
                            type="password"
                            required
                            minLength={8}
                            className="w-full border border-gray-300 rounded-lg p-2 focus:ring-blue-500 focus:border-blue-500"
                            onChange={(e) => {
                              setNewPassword(e.target.value);
                              setPasswordError('');
                            }}
                            value={newPassword}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Confirmar Nova Senha
                          </label>
                          <input
                            type="password"
                            required
                            minLength={8}
                            className="w-full border border-gray-300 rounded-lg p-2 focus:ring-blue-500 focus:border-blue-500"
                            onChange={(e) => {
                              setNewPasswordConfirm(e.target.value);
                              setPasswordError('');
                            }}
                            value={newPasswordConfirm}
                          />
                        </div>
                      </>
                    )}
                  </div>
                )}

                {passwordError && (
                  <p className="text-sm text-red-600">{passwordError}</p>
                )}

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="active"
                    id="active"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    onChange={handleInputChange}
                    checked={editingUser?.active ?? newUser.active ?? true}
                  />
                  <label htmlFor="active" className="ml-2 block text-sm text-gray-900">
                    Usuário ativo
                  </label>
                </div>

                <div className="flex justify-end space-x-4 mt-6">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                  >
                    {editingUser ? 'Salvar Alterações' : 'Criar Usuário'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}