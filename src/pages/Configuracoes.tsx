
import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Usuario, TipoUsuarioLabels } from '../types';
import { useToast } from '@/hooks/use-toast';
import { Save, CheckCircle, XCircle, Edit, Trash, Shield, User } from 'lucide-react';
import EditarMissionario from '../components/EditarMissionario';

export default function Configuracoes() {
  const { usuarios, updateUsuario, deleteUsuario, currentUser } = useApp();
  const { toast } = useToast();
  const [localUsuarios, setLocalUsuarios] = useState<Usuario[]>([]);
  const [editingUsuario, setEditingUsuario] = useState<Usuario | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  // Sincronizar com o contexto sempre que usuarios mudar
  useEffect(() => {
    console.log('Configurações - Usuários recebidos do contexto:', usuarios.length);
    usuarios.forEach(u => console.log('- ', u.nome_completo, '(', u.login_acesso, ') - Aprovado:', u.aprovado, '- Tipo:', u.tipo));
    setLocalUsuarios([...usuarios]); // Criar uma nova cópia para garantir re-render
    setHasChanges(false); // Reset changes when data reloads
  }, [usuarios]);

  const handlePermissionChange = (userId: string, permission: keyof Usuario['permissoes'], value: boolean) => {
    setLocalUsuarios(prev => 
      prev.map(usuario => 
        usuario.id === userId 
          ? { 
              ...usuario, 
              permissoes: { ...usuario.permissoes, [permission]: value } 
            }
          : usuario
      )
    );
    setHasChanges(true);
  };

  const handleTipoChange = async (userId: string, tipo: Usuario['tipo']) => {
    try {
      // Update immediately in context
      await updateUsuario(userId, { tipo });
      
      // Update local state
      setLocalUsuarios(prev => 
        prev.map(usuario => 
          usuario.id === userId 
            ? { ...usuario, tipo }
            : usuario
        )
      );
      
      toast({
        title: "Tipo Atualizado!",
        description: `${localUsuarios.find(u => u.id === userId)?.nome_completo} agora é ${TipoUsuarioLabels[tipo]}.`
      });
    } catch (error) {
      console.error('Erro ao atualizar tipo:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar tipo do usuário.",
        variant: "destructive"
      });
    }
  };

  const handleApprovalChange = async (userId: string, approved: boolean) => {
    try {
      // Update immediately in context
      await updateUsuario(userId, { aprovado: approved });
      
      // Update local state
      setLocalUsuarios(prev => 
        prev.map(usuario => 
          usuario.id === userId 
            ? { ...usuario, aprovado: approved }
            : usuario
        )
      );
      
      toast({
        title: approved ? "Usuário Aprovado!" : "Usuário Desaprovado!",
        description: `${localUsuarios.find(u => u.id === userId)?.nome_completo} ${approved ? 'foi aprovado e agora pode acessar o sistema' : 'foi desaprovado'}.`
      });
    } catch (error) {
      console.error('Erro ao atualizar aprovação:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar aprovação do usuário.",
        variant: "destructive"
      });
    }
  };

  const handleSaveChanges = async () => {
    if (!hasChanges) {
      toast({
        title: "Informação",
        description: "Não há alterações para salvar."
      });
      return;
    }

    try {
      // Save all permission changes
      const promises = localUsuarios.map(usuario => {
        const originalUsuario = usuarios.find(u => u.id === usuario.id);
        if (originalUsuario) {
          // Compare permissions to see if they changed
          const permissionsChanged = JSON.stringify(originalUsuario.permissoes) !== JSON.stringify(usuario.permissoes);
          
          if (permissionsChanged) {
            console.log('Salvando permissões para:', usuario.nome_completo, usuario.permissoes);
            return updateUsuario(usuario.id, {
              permissoes: usuario.permissoes
            });
          }
        }
        return Promise.resolve();
      });

      await Promise.all(promises);
      setHasChanges(false);
      
      toast({
        title: "Sucesso!",
        description: "Todas as permissões foram atualizadas com sucesso."
      });
    } catch (error: any) {
      console.error('Erro ao salvar permissões:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao salvar as configurações.",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (usuario: Usuario) => {
    setEditingUsuario(usuario);
  };

  const handleDelete = async (id: string, nome: string) => {
    if (window.confirm(`Tem certeza que deseja excluir ${nome}?`)) {
      try {
        await deleteUsuario(id);
        toast({
          title: "Sucesso!",
          description: "Usuário excluído com sucesso."
        });
      } catch (error: any) {
        console.error('Erro ao excluir usuário:', error);
        toast({
          title: "Erro",
          description: error.message || "Erro ao excluir usuário.",
          variant: "destructive"
        });
      }
    }
  };

  const permissionLabels = {
    pode_cadastrar: 'Pode Cadastrar',
    pode_editar: 'Pode Editar',
    pode_excluir: 'Pode Excluir',
    pode_exportar: 'Pode Exportar'
  };

  // Check if current user is admin
  const isAdmin = currentUser?.tipo === 'administrador';

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Acesso Negado</h1>
            <p className="text-gray-600">Você não tem permissão para acessar esta página.</p>
            <p className="text-sm text-gray-500 mt-2">Apenas administradores podem gerenciar configurações.</p>
          </div>
        </div>
      </div>
    );
  }

  // Separar usuários aprovados e pendentes
  const usuariosPendentes = localUsuarios.filter(u => !u.aprovado);
  const usuariosAprovados = localUsuarios.filter(u => u.aprovado);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Configurações</h1>
                <p className="text-gray-600">Gerencie as permissões, tipos e aprovações dos usuários do sistema</p>
                <div className="flex gap-4 text-sm mt-2">
                  <p className="text-blue-600">Total de usuários: {localUsuarios.length}</p>
                  <p className="text-yellow-600">Pendentes: {usuariosPendentes.length}</p>
                  <p className="text-green-600">Aprovados: {usuariosAprovados.length}</p>
                  <p className="text-purple-600">Administradores: {usuariosAprovados.filter(u => u.tipo === 'administrador').length}</p>
                </div>
              </div>
              <Button 
                onClick={handleSaveChanges}
                disabled={!hasChanges}
                className={`${hasChanges 
                  ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700' 
                  : 'bg-gray-400'
                } text-white flex items-center gap-2`}
              >
                <Save className="w-4 h-4" />
                {hasChanges ? 'Salvar Alterações' : 'Sem Alterações'}
              </Button>
            </div>
            {hasChanges && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-yellow-800 text-sm">
                  ⚠️ Você tem alterações não salvas. Clique em "Salvar Alterações" para persistir as mudanças.
                </p>
              </div>
            )}
          </div>

          {/* Usuários Pendentes */}
          {usuariosPendentes.length > 0 && (
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-yellow-700 mb-4">
                Solicitações Pendentes ({usuariosPendentes.length})
              </h2>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-yellow-50">
                      <TableHead className="font-semibold text-gray-700">Nome</TableHead>
                      <TableHead className="font-semibold text-gray-700">Igreja</TableHead>
                      <TableHead className="font-semibold text-gray-700 text-center">Tipo</TableHead>
                      <TableHead className="font-semibold text-gray-700 text-center">Ação</TableHead>
                      <TableHead className="font-semibold text-gray-700 text-center">Gerenciar</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {usuariosPendentes.map((usuario) => (
                      <TableRow key={usuario.id} className="hover:bg-yellow-50">
                        <TableCell className="font-medium">
                          <div>
                            <p className="font-semibold">{usuario.nome_completo}</p>
                            <p className="text-sm text-gray-500">{usuario.login_acesso}</p>
                          </div>
                        </TableCell>
                        <TableCell>{usuario.igreja}</TableCell>
                        <TableCell className="text-center">
                          <Select 
                            value={usuario.tipo} 
                            onValueChange={(value) => handleTipoChange(usuario.id, value as Usuario['tipo'])}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="missionario">
                                <div className="flex items-center gap-2">
                                  <User className="w-4 h-4" />
                                  Missionário
                                </div>
                              </SelectItem>
                              <SelectItem value="administrador">
                                <div className="flex items-center gap-2">
                                  <Shield className="w-4 h-4" />
                                  Administrador
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex gap-2 justify-center">
                            <Button
                              size="sm"
                              onClick={() => handleApprovalChange(usuario.id, true)}
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Aprovar
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleApprovalChange(usuario.id, false)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <XCircle className="w-3 h-3 mr-1" />
                              Rejeitar
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex gap-2 justify-center">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-blue-600 hover:text-blue-700"
                              onClick={() => handleEdit(usuario)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-red-600 hover:text-red-700"
                              onClick={() => handleDelete(usuario.id, usuario.nome_completo)}
                            >
                              <Trash className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {/* Usuários Aprovados */}
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Usuários Aprovados ({usuariosAprovados.length})
            </h2>
            {usuariosAprovados.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">Nenhum usuário aprovado ainda.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="font-semibold text-gray-700">Nome</TableHead>
                      <TableHead className="font-semibold text-gray-700">Igreja</TableHead>
                      <TableHead className="font-semibold text-gray-700 text-center">Tipo</TableHead>
                      <TableHead className="font-semibold text-gray-700 text-center">Status</TableHead>
                      <TableHead className="font-semibold text-gray-700 text-center">Pode Cadastrar</TableHead>
                      <TableHead className="font-semibold text-gray-700 text-center">Pode Editar</TableHead>
                      <TableHead className="font-semibold text-gray-700 text-center">Pode Excluir</TableHead>
                      <TableHead className="font-semibold text-gray-700 text-center">Pode Exportar</TableHead>
                      <TableHead className="font-semibold text-gray-700 text-center">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {usuariosAprovados.map((usuario) => (
                      <TableRow key={usuario.id} className="hover:bg-gray-50">
                        <TableCell className="font-medium">
                          <div>
                            <p className="font-semibold">{usuario.nome_completo}</p>
                            <p className="text-sm text-gray-500">{usuario.login_acesso}</p>
                          </div>
                        </TableCell>
                        <TableCell>{usuario.igreja}</TableCell>
                        <TableCell className="text-center">
                          <Select 
                            value={usuario.tipo} 
                            onValueChange={(value) => handleTipoChange(usuario.id, value as Usuario['tipo'])}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="missionario">
                                <div className="flex items-center gap-2">
                                  <User className="w-4 h-4" />
                                  Missionário
                                </div>
                              </SelectItem>
                              <SelectItem value="administrador">
                                <div className="flex items-center gap-2">
                                  <Shield className="w-4 h-4" />
                                  Administrador
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex flex-col items-center gap-2">
                            <Badge className={usuario.tipo === 'administrador' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'}>
                              {usuario.tipo === 'administrador' ? (
                                <div className="flex items-center gap-1">
                                  <Shield className="w-3 h-3" />
                                  Admin
                                </div>
                              ) : (
                                <div className="flex items-center gap-1">
                                  <User className="w-3 h-3" />
                                  Aprovado
                                </div>
                              )}
                            </Badge>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleApprovalChange(usuario.id, false)}
                              className="text-xs text-red-600 hover:text-red-700"
                            >
                              <XCircle className="w-3 h-3 mr-1" />
                              Desaprovar
                            </Button>
                          </div>
                        </TableCell>
                        {(Object.keys(permissionLabels) as Array<keyof Usuario['permissoes']>).map((permission) => (
                          <TableCell key={permission} className="text-center">
                            <Switch
                              checked={usuario.permissoes[permission]}
                              onCheckedChange={(checked) => handlePermissionChange(usuario.id, permission, checked)}
                            />
                          </TableCell>
                        ))}
                        <TableCell className="text-center">
                          <div className="flex gap-2 justify-center">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-blue-600 hover:text-blue-700"
                              onClick={() => handleEdit(usuario)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-red-600 hover:text-red-700"
                              onClick={() => handleDelete(usuario.id, usuario.nome_completo)}
                            >
                              <Trash className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>

          {/* Permissions Legend */}
          <div className="p-6 bg-gray-50 rounded-b-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Descrição das Configurações</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="font-medium text-gray-700 mb-1">Tipos de Usuário:</p>
                <div className="space-y-1">
                  <p className="text-gray-600 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-purple-600" />
                    <strong>Administrador:</strong> Acesso a todas as igrejas
                  </p>
                  <p className="text-gray-600 flex items-center gap-2">
                    <User className="w-4 h-4 text-blue-600" />
                    <strong>Missionário:</strong> Acesso apenas à sua igreja
                  </p>
                </div>
              </div>
              <div>
                <p className="font-medium text-gray-700 mb-1">Status de Aprovação:</p>
                <p className="text-gray-600">Usuários pendentes não podem fazer login no sistema</p>
              </div>
              <div>
                <p className="font-medium text-gray-700 mb-1">Pode Cadastrar:</p>
                <p className="text-gray-600">Permite cadastrar novos interessados e missionários</p>
              </div>
              <div>
                <p className="font-medium text-gray-700 mb-1">Pode Editar:</p>
                <p className="text-gray-600">Permite editar informações de interessados existentes</p>
              </div>
              <div>
                <p className="font-medium text-gray-700 mb-1">Pode Excluir:</p>
                <p className="text-gray-600">Permite excluir registros de interessados e missionários</p>
              </div>
              <div>
                <p className="font-medium text-gray-700 mb-1">Pode Exportar:</p>
                <p className="text-gray-600">Permite exportar dados em formato Excel/CSV</p>
              </div>
            </div>
          </div>
        </div>

        {editingUsuario && (
          <EditarMissionario
            usuario={editingUsuario}
            isOpen={!!editingUsuario}
            onClose={() => setEditingUsuario(null)}
            onSave={updateUsuario}
          />
        )}
      </div>
    </div>
  );
}
