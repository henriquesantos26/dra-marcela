import React, { useState, useEffect } from 'react';
import { Users, Plus, Trash2, Edit2, Shield, Loader2, Check, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

export type UserItem = {
  id: string;
  email: string;
  full_name: string;
  role: string;
  allowed_pages: string[];
  created_at: string;
};

const AVAILABLE_PAGES = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'blog', label: 'Blog' },
  { id: 'chat', label: 'Chat' },
  { id: 'agent', label: 'Agente IA' },
  { id: 'kanban', label: 'Kanban' },
  { id: 'clients', label: 'Clientes' },
  { id: 'tracking', label: 'Rastreamento' },
  { id: 'metrics', label: 'Métricas' },
];

const AdminUsersPage = () => {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);
  
  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [selectedPages, setSelectedPages] = useState<Set<string>>(new Set(['dashboard']));
  const [saving, setSaving] = useState(false);

  const { toast } = useToast();

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('manage-users', {
        body: { action: 'list' }
      });
      if (error) throw error;
      setUsers(data?.users || []);
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const openModal = (user?: UserItem) => {
    setPassword(''); // Reset password field every time modal opens
    if (user) {
      setEditingUser(user);
      setFullName(user.full_name || '');
      setEmail(user.email);
      setSelectedPages(new Set(user.allowed_pages));
    } else {
      setEditingUser(null);
      setFullName('');
      setEmail('');
      setSelectedPages(new Set(['dashboard']));
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingUser(null);
    setPassword('');
  };

  const togglePage = (pageId: string) => {
    setSelectedPages(prev => {
      const next = new Set(prev);
      if (next.has(pageId)) next.delete(pageId);
      else next.add(pageId);
      return next;
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (editingUser) {
        const { error } = await supabase.functions.invoke('manage-users', {
          body: {
            action: 'update',
            user_id: editingUser.id,
            full_name: fullName,
            allowed_pages: Array.from(selectedPages),
            password: password || undefined // Only send if not empty
          }
        });
        if (error) throw error;
        toast({ title: "Usuário atualizado com sucesso!", description: "Dados e permissões foram salvos." });
      } else {
        if (!password || password.length < 6) return toast({ title: "Atenção", description: "A senha deve ter no mínimo 6 caracteres", variant: "destructive" });
        const { error, data } = await supabase.functions.invoke('manage-users', {
          body: {
            action: 'create',
            email,
            password,
            full_name: fullName,
            allowed_pages: Array.from(selectedPages)
          }
        });
        if (error) throw error;
        if (data?.error) throw new Error(data.error);
        toast({ title: "Usuário criado com sucesso!" });
      }
      closeModal();
      fetchUsers();
    } catch (err: any) {
      toast({ title: "Erro ao salvar", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (userId: string) => {
    if (!window.confirm("Certeza que deseja remover este usuário?")) return;
    try {
      const { error, data } = await supabase.functions.invoke('manage-users', {
        body: { action: 'delete', user_id: userId }
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      
      toast({ title: "Usuário removido!" });
      fetchUsers();
    } catch (err: any) {
      toast({ title: "Erro ao remover", description: err.message, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-black text-foreground">Usuários e Permissões</h3>
          <p className="text-sm text-muted-foreground">Gerencie quem tem acesso ao painel do sistema.</p>
        </div>
        <button onClick={() => openModal()} className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-white font-bold text-sm shadow-lg hover:scale-[1.02] transition-transform" style={{ background: 'linear-gradient(135deg, #5766fe, #820dd1)' }}>
          <Plus className="w-4 h-4" /> Novo Usuário
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-secondary/50 border-b border-border">
                <th className="px-6 py-4 text-xs font-black text-muted-foreground uppercase tracking-wider">Usuário</th>
                <th className="px-6 py-4 text-xs font-black text-muted-foreground uppercase tracking-wider">Acesso</th>
                <th className="px-6 py-4 text-xs font-black text-muted-foreground uppercase tracking-wider">Status/Role</th>
                <th className="px-6 py-4 text-xs font-black text-muted-foreground uppercase tracking-wider text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {users.map(user => (
                <tr key={user.id} className="hover:bg-secondary/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-foreground">{user.full_name || 'Sem nome'}</div>
                    <div className="text-sm text-muted-foreground">{user.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    {user.role === 'admin' ? (
                      <span className="text-xs font-bold text-purple-500 bg-purple-500/10 px-2.5 py-1 rounded-full">Acesso Total (Admin)</span>
                    ) : (
                      <div className="flex flex-wrap gap-1.5 max-w-[250px]">
                        {user.allowed_pages?.length > 0 ? (
                           user.allowed_pages.map(p => (
                             <span key={p} className="text-[10px] font-bold bg-secondary text-muted-foreground px-2 py-0.5 rounded-full capitalize">
                               {AVAILABLE_PAGES.find(ap => ap.id === p)?.label || p}
                             </span>
                           ))
                        ) : (
                          <span className="text-xs text-muted-foreground">Sem paginas</span>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-full ${user.role === 'admin' ? 'bg-amber-500/10 text-amber-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                      {user.role === 'admin' ? <Shield className="w-3.5 h-3.5"/> : <Users className="w-3.5 h-3.5"/>}
                      {user.role === 'admin' ? 'Administrador' : 'Usuário (Editor)'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                       {user.role !== 'admin' && (
                         <>
                           <button onClick={() => openModal(user)} className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors" title="Editar permissões">
                             <Edit2 className="w-4 h-4" />
                           </button>
                           <button onClick={() => handleDelete(user.id)} className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors" title="Excluir">
                             <Trash2 className="w-4 h-4" />
                           </button>
                         </>
                       )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-card w-full max-w-xl rounded-3xl border border-border overflow-hidden shadow-2xl animate-scale-in">
            <div className="flex items-center justify-between p-6 border-b border-border bg-secondary/30">
              <h3 className="text-lg font-black text-foreground">{editingUser ? 'Editar Permissões' : 'Criar Novo Usuário'}</h3>
              <button type="button" onClick={closeModal} className="p-2 -m-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-secondary transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase tracking-wider">Nome Completo</label>
                  <input type="text" required value={fullName} onChange={e => setFullName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500/40 text-sm" />
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase tracking-wider">Email {editingUser && '(Não Editável)'}</label>
                  <input type="email" required value={email} onChange={e => setEmail(e.target.value)} disabled={!!editingUser}
                    className={`w-full px-4 py-3 rounded-xl bg-secondary border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500/40 text-sm ${editingUser ? 'opacity-60 cursor-not-allowed' : ''}`} />
                </div>

                <div>
                  <label className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase tracking-wider">
                    {editingUser ? 'Alterar Senha' : 'Senha Provisória'}
                  </label>
                  <input 
                    type="password" 
                    required={!editingUser} 
                    value={password} 
                    onChange={e => setPassword(e.target.value)} 
                    minLength={6}
                    placeholder={editingUser ? 'Deixe em branco para manter a atual' : ''}
                    className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500/40 text-sm" 
                  />
                  {editingUser && (
                    <p className="text-[10px] text-muted-foreground mt-1">* Se não desejar trocar a senha, deixe este campo vazio.</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-3 uppercase tracking-wider flex items-center gap-2">
                  <Shield className="w-4 h-4 text-purple-500" />  
                  Páginas Permitidas (Aba lateral)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {AVAILABLE_PAGES.map(page => {
                    const isSelected = selectedPages.has(page.id);
                    return (
                      <button type="button" key={page.id} onClick={() => togglePage(page.id)}
                        className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${isSelected ? 'border-purple-500 bg-purple-500/10' : 'border-border bg-secondary hover:border-muted-foreground/30'}`}
                      >
                        <div className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${isSelected ? 'bg-purple-500 border-purple-500 text-white' : 'border-muted-foreground/30 bg-card'}`}>
                           {isSelected && <Check className="w-3.5 h-3.5" />}
                        </div>
                        <span className="text-sm font-bold text-foreground">{page.label}</span>
                      </button>
                    )
                  })}
                </div>
                <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
                  * Este usuário <strong className="text-foreground">não terá acesso</strong> às configurações do sistema (Settings), gerador de usuários, ou a ferramenta de edição visual do site (Editar Site). 
                </p>
              </div>

              <div className="flex gap-3 pt-4 border-t border-border">
                <button type="button" onClick={closeModal} className="flex-1 py-3 rounded-xl font-bold bg-secondary text-foreground hover:bg-secondary/80 transition-colors">
                  Cancelar
                </button>
                <button type="submit" disabled={saving} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-white shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98]" style={{ background: 'linear-gradient(135deg, #5766fe, #820dd1)' }}>
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {editingUser ? 'Salvar Permissões' : 'Criar Usuário'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// SVG component missing in imports: Save
const Save = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
);

export default AdminUsersPage;
