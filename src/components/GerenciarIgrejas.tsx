import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useApp } from '../context/AppContext';
import { useToast } from '@/hooks/use-toast';
import { Igreja } from '../types';
import { Edit, Trash, Plus, Building, AlertTriangle } from 'lucide-react';
import { capitalizeWords } from '../utils/textUtils';

interface GerenciarIgrejasProps {
  currentUser: any;
}

export default function GerenciarIgrejas({ currentUser }: GerenciarIgrejasProps) {
  const { igrejas, usuarios, interessados, addIgreja, updateIgreja, deleteIgreja } = useApp();
  const { toast } = useToast();
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingIgreja, setEditingIgreja] = useState<Igreja | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    ativa: true
  });

  const handleAddIgreja = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, digite o nome da igreja.",
        variant: "destructive"
      });
      return;
    }

    // Verificar se já existe uma igreja com este nome
    if (igrejas.some(igreja => igreja.nome.toLowerCase() === formData.nome.toLowerCase())) {
      toast({
        title: "Erro",
        description: "Já existe uma igreja com este nome.",
        variant: "destructive"
      });
      return;
    }

    try {
      await addIgreja({
        nome: capitalizeWords(formData.nome),
        ativa: formData.ativa
      });

      setFormData({ nome: '', ativa: true });
      setIsAddDialogOpen(false);
    } catch (error: any) {
      console.error('Erro ao adicionar igreja:', error);
    }
  };

  const handleEditIgreja = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingIgreja || !formData.nome.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, digite o nome da igreja.",
        variant: "destructive"
      });
      return;
    }

    // Verificar se já existe outra igreja com este nome
    if (igrejas.some(igreja => 
      igreja.id !== editingIgreja.id && 
      igreja.nome.toLowerCase() === formData.nome.toLowerCase()
    )) {
      toast({
        title: "Erro",
        description: "Já existe uma igreja com este nome.",
        variant: "destructive"
      });
      return;
    }

    try {
      await updateIgreja(editingIgreja.id, {
        nome: capitalizeWords(formData.nome),
        ativa: formData.ativa
      });

      setFormData({ nome: '', ativa: true });
      setIsEditDialogOpen(false);
      setEditingIgreja(null);
    } catch (error: any) {
      console.error('Erro ao editar igreja:', error);
    }
  };

  const handleDeleteIgreja = async (id: string, nome: string) => {
    if (window.confirm(`Tem certeza que deseja excluir a igreja "${nome}"? Esta ação não pode ser desfeita.`)) {
      try {
        await deleteIgreja(id);
      } catch (error: any) {
        console.error('Erro ao excluir igreja:', error);
      }
    }
  };

  const handleToggleStatus = async (igreja: Igreja) => {
    try {
      await updateIgreja(igreja.id, { ativa: !igreja.ativa });
      
      toast({
        title: "Status Atualizado!",
        description: `Igreja "${igreja.nome}" foi ${!igreja.ativa ? 'ativada' : 'desativada'}.`
      });
    } catch (error: any) {
      console.error('Erro ao alterar status da igreja:', error);
    }
  };

  const openEditDialog = (igreja: Igreja) => {
    setEditingIgreja(igreja);
    setFormData({
      nome: igreja.nome,
      ativa: igreja.ativa
    });
    setIsEditDialogOpen(true);
  };

  const getIgrejaStats = (igrejaNome: string) => {
    const usuariosCount = usuarios.filter(u => u.igreja === igrejaNome).length;
    const interessadosCount = interessados.filter(i => i.igreja === igrejaNome || i.cidade === igrejaNome).length;
    return { usuariosCount, interessadosCount };
  };

  // Verificar se o usuário é administrador
  if (currentUser?.tipo !== 'administrador') {
    return (
      <div className="text-center py-8">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Acesso Restrito</h3>
        <p className="text-gray-600">Apenas administradores podem gerenciar igrejas.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Building className="w-6 h-6 text-blue-600" />
          <div>
            <h2 className="text-xl font-bold text-gray-900">Gerenciar Igrejas</h2>
            <p className="text-sm text-gray-600">Adicione, edite ou desative igrejas do sistema</p>
          </div>
        </div>
        <Button
          onClick={() => setIsAddDialogOpen(true)}
          className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Nova Igreja
        </Button>
      </div>

      {/* Estatísticas */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <Building className="w-8 h-8 text-blue-600" />
            <div>
              <p className="text-sm text-blue-600 font-medium">Total de Igrejas</p>
              <p className="text-2xl font-bold text-blue-800">{igrejas.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <Building className="w-8 h-8 text-green-600" />
            <div>
              <p className="text-sm text-green-600 font-medium">Igrejas Ativas</p>
              <p className="text-2xl font-bold text-green-800">{igrejas.filter(i => i.ativa).length}</p>
            </div>
          </div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <Building className="w-8 h-8 text-red-600" />
            <div>
              <p className="text-sm text-red-600 font-medium">Igrejas Inativas</p>
              <p className="text-2xl font-bold text-red-800">{igrejas.filter(i => !i.ativa).length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabela de Igrejas */}
      <div className="bg-white rounded-lg border">
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Lista de Igrejas</h3>
        </div>
        
        {igrejas.length === 0 ? (
          <div className="text-center py-12">
            <Building className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">Nenhuma igreja cadastrada ainda.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="font-semibold text-gray-700">Nome da Igreja</TableHead>
                <TableHead className="font-semibold text-gray-700 text-center">Status</TableHead>
                <TableHead className="font-semibold text-gray-700 text-center">Usuários</TableHead>
                <TableHead className="font-semibold text-gray-700 text-center">Interessados</TableHead>
                <TableHead className="font-semibold text-gray-700 text-center">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {igrejas.map((igreja) => {
                const stats = getIgrejaStats(igreja.nome);
                return (
                  <TableRow key={igreja.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium">{igreja.nome}</TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Switch
                          checked={igreja.ativa}
                          onCheckedChange={() => handleToggleStatus(igreja)}
                        />
                        <Badge className={igreja.ativa ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                          {igreja.ativa ? 'Ativa' : 'Inativa'}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="text-blue-600 font-medium">{stats.usuariosCount}</span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="text-green-600 font-medium">{stats.interessadosCount}</span>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex gap-2 justify-center">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          onClick={() => openEditDialog(igreja)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDeleteIgreja(igreja.id, igreja.nome)}
                          disabled={stats.usuariosCount > 0 || stats.interessadosCount > 0}
                          title={stats.usuariosCount > 0 || stats.interessadosCount > 0 ? 
                            "Não é possível excluir igreja com usuários ou interessados vinculados" : 
                            "Excluir igreja"
                          }
                        >
                          <Trash className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Dialog para Adicionar Igreja */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Adicionar Nova Igreja</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleAddIgreja} className="space-y-4">
            <div>
              <Label htmlFor="nome" className="text-sm font-medium">
                Nome da Igreja *
              </Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                placeholder="Digite o nome da igreja"
                required
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="ativa"
                checked={formData.ativa}
                onCheckedChange={(checked) => setFormData({ ...formData, ativa: checked })}
              />
              <Label htmlFor="ativa" className="text-sm font-medium">
                Igreja ativa
              </Label>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancelar
              </Button>
              <Button 
                type="submit"
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
              >
                Adicionar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog para Editar Igreja */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Igreja</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleEditIgreja} className="space-y-4">
            <div>
              <Label htmlFor="edit-nome" className="text-sm font-medium">
                Nome da Igreja *
              </Label>
              <Input
                id="edit-nome"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                placeholder="Digite o nome da igreja"
                required
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="edit-ativa"
                checked={formData.ativa}
                onCheckedChange={(checked) => setFormData({ ...formData, ativa: checked })}
              />
              <Label htmlFor="edit-ativa" className="text-sm font-medium">
                Igreja ativa
              </Label>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancelar
              </Button>
              <Button 
                type="submit"
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
              >
                Salvar Alterações
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}