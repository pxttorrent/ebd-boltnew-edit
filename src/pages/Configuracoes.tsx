import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Usuario } from '../types';
import { useToast } from '@/hooks/use-toast';
import { Save, CheckCircle, XCircle, Edit, Trash } from 'lucide-react';
import EditarMissionario from '../components/EditarMissionario';

export default function Configuracoes() {
  const { usuarios, updateUsuario, deleteUsuario } = useApp();
  const { toast } = useToast();
  const [localUsuarios, setLocalUsuarios] = useState<Usuario[]>([]);
  const [editingUsuario, setEditingUsuario] = useState<Usuario | null>(null);

  // Sincronizar com o contexto sempre que usuarios mudar
  useEffect(() => {
    console.log('Configurações - Usuários recebidos do contexto:', usuarios.length);
    usuarios.forEach(u => console.log('- ', u.nome_completo, '(', u.login_acesso, ') - Aprovado:', u.aprovado));
    setLocalUsuarios([...usuarios]); // Criar uma nova cópia para garantir re-render
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
  };

  const handleApprovalChange = (userId: string, approved: boolean) => {
    const updatedUsuarios = localUsuarios.map(usuario => 
      usuario.id === userId 
        ? { ...usuario, aprovado: approved }
        : usuario
    );
    setLocalUsuarios(updatedUsuarios);
    
    // Aplicar a mudança imediatamente no contexto
    updateUsuario(userId, { aprovado: approved });
    
    toast({
      title: approved ? "Usuário Aprovado!" : "Usuário Desaprovado!",
      description: `${localUsuarios.find(u => u.id === userId)?.nome_completo} ${approved ? 'foi aprovado e agora pode acessar o sistema' : 'foi desaprovado'}.`
    });
  };

  const handleSaveChanges = () => {
    // Salvar todas as mudanças de permissões
    localUsuarios.forEach(usuario => {
      updateUsuario(usuario.id, {
        permissoes: usuario.permissoes,
        aprovado: usuario.aprovado
      });
    });
    
    toast({
      title: "Sucesso!",
      description: "Todas as permissões foram atualizadas com sucesso."
    });
  };

  const handleEdit = (usuario: Usuario) => {
    setEditingUsuario(usuario);
  };

  const handleDelete = (id: string, nome: string) => {
    if (window.confirm(`Tem certeza que deseja excluir ${nome}?`)) {
      deleteUsuario(id);
      toast({
        title: "Sucesso!",
        description: "Usuário excluído com sucesso."
      });
    }
  };

  const permissionLabels = {
    pode_cadastrar: 'Pode Cadastrar',
    pode_editar: 'Pode Editar',
    pode_excluir: 'Pode Excluir',
    pode_exportar: 'Pode Exportar'
  };

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
                <p className="text-gray-600">Gerencie as permissões e aprovações dos usuários do sistema</p>
                <div className="flex gap-4 text-sm mt-2">
                  <p className="text-blue-600">Total de usuários: {localUsuarios.length}</p>
                  <p className="text-yellow-600">Pendentes: {usuariosPendentes.length}</p>
                  <p className="text-green-600">Aprovados: {usuariosAprovados.length}</p>
                </div>
              </div>
              <Button 
                onClick={handleSaveChanges}
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Salvar Alterações
              </Button>
            </div>
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
                          <div className="flex flex-col items-center gap-2">
                            <Badge className="bg-green-100 text-green-800">
                              Aprovado
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
