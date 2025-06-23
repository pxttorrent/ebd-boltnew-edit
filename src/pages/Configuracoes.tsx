
import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Usuario } from '../types';
import { useToast } from '@/hooks/use-toast';
import { Save } from 'lucide-react';

export default function Configuracoes() {
  const { usuarios, setUsuarios } = useApp();
  const { toast } = useToast();
  const [localUsuarios, setLocalUsuarios] = useState<Usuario[]>(usuarios);

  // Debug: log dos usuários recebidos
  useEffect(() => {
    console.log('Configurações - Usuários recebidos do contexto:', usuarios.length);
    usuarios.forEach(u => console.log('- ', u.nome_completo, '(', u.login_acesso, ')'));
    setLocalUsuarios(usuarios);
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

  const handleSaveChanges = () => {
    setUsuarios(localUsuarios);
    toast({
      title: "Sucesso!",
      description: "Permissões atualizadas com sucesso."
    });
  };

  const permissionLabels = {
    pode_cadastrar: 'Pode Cadastrar',
    pode_editar: 'Pode Editar',
    pode_excluir: 'Pode Excluir',
    pode_exportar: 'Pode Exportar'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Configurações</h1>
                <p className="text-gray-600">Gerencie as permissões dos usuários do sistema</p>
                <p className="text-sm text-blue-600 mt-1">Total de usuários: {localUsuarios.length}</p>
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

          {/* Table */}
          <div className="p-6">
            {localUsuarios.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">Nenhum usuário cadastrado ainda.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="font-semibold text-gray-700">Nome</TableHead>
                    <TableHead className="font-semibold text-gray-700">Igreja</TableHead>
                    <TableHead className="font-semibold text-gray-700 text-center">Pode Cadastrar</TableHead>
                    <TableHead className="font-semibold text-gray-700 text-center">Pode Editar</TableHead>
                    <TableHead className="font-semibold text-gray-700 text-center">Pode Excluir</TableHead>
                    <TableHead className="font-semibold text-gray-700 text-center">Pode Exportar</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {localUsuarios.map((usuario) => (
                    <TableRow key={usuario.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">
                        <div>
                          <p className="font-semibold">{usuario.nome_completo}</p>
                          <p className="text-sm text-gray-500">{usuario.login_acesso}</p>
                        </div>
                      </TableCell>
                      <TableCell>{usuario.igreja}</TableCell>
                      {(Object.keys(permissionLabels) as Array<keyof Usuario['permissoes']>).map((permission) => (
                        <TableCell key={permission} className="text-center">
                          <Switch
                            checked={usuario.permissoes[permission]}
                            onCheckedChange={(checked) => handlePermissionChange(usuario.id, permission, checked)}
                          />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>

          {/* Permissions Legend */}
          <div className="p-6 bg-gray-50 rounded-b-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Descrição das Permissões</h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
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
      </div>
    </div>
  );
}
