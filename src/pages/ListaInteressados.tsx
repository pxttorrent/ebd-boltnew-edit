
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StatusLabels, StatusColors, Interessado } from '../types';
import { Search, Download, Upload, Edit, Trash, Filter, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import EditarInteressado from '../components/EditarInteressado';

export default function ListaInteressados() {
  const { interessados, deleteInteressado } = useApp();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const [cidadeFilter, setCidadeFilter] = useState<string>('todas');
  const [editingInteressado, setEditingInteressado] = useState<Interessado | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Filtrar interessados
  const filteredInteressados = interessados.filter(interessado => {
    const matchesSearch = interessado.nome_completo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      interessado.telefone.includes(searchTerm) ||
      interessado.cidade.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'todos' || interessado.status === statusFilter;
    
    const matchesCidade = cidadeFilter === 'todas' || interessado.cidade === cidadeFilter;
    
    return matchesSearch && matchesStatus && matchesCidade;
  });

  // Obter cidades únicas
  const cidadesUnicas = [...new Set(interessados.map(i => i.cidade))].sort();

  const handleDelete = (id: string, nome: string) => {
    if (window.confirm(`Tem certeza que deseja excluir ${nome}?`)) {
      deleteInteressado(id);
      toast({
        title: "Sucesso!",
        description: "Interessado excluído com sucesso."
      });
    }
  };

  const handleEdit = (interessado: Interessado) => {
    setEditingInteressado(interessado);
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = () => {
    setIsEditDialogOpen(false);
    setEditingInteressado(null);
  };

  const handleCancelEdit = () => {
    setIsEditDialogOpen(false);
    setEditingInteressado(null);
  };

  const handleExport = () => {
    toast({
      title: "Exportação",
      description: "Funcionalidade de exportação será implementada em breve."
    });
  };

  const handleImport = () => {
    toast({
      title: "Importação",
      description: "Funcionalidade de importação será implementada em breve."
    });
  };

  const generatePDFReport = () => {
    // Criar o conteúdo do relatório
    const reportContent = `
      RELATÓRIO DE INTERESSADOS
      =========================
      
      Total de Interessados: ${filteredInteressados.length}
      Data do Relatório: ${new Date().toLocaleDateString('pt-BR')}
      
      ${filteredInteressados.map(interessado => `
      Nome: ${interessado.nome_completo}
      Telefone: ${interessado.telefone}
      Cidade: ${interessado.cidade}
      Status: ${interessado.status} - ${StatusLabels[interessado.status]}
      Instrutor: ${interessado.instrutor_biblico}
      Data Contato: ${interessado.data_contato ? new Date(interessado.data_contato).toLocaleDateString('pt-BR') : '-'}
      Observações: ${interessado.observacoes || 'Nenhuma'}
      -----------------------------------
      `).join('')}
    `;

    // Criar elemento para download
    const element = document.createElement('a');
    const file = new Blob([reportContent], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `relatorio-interessados-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);

    toast({
      title: "Relatório Gerado!",
      description: "O relatório foi baixado com sucesso."
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Lista de Interessados</h1>
            
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
              <div className="flex flex-col md:flex-row gap-4 flex-1">
                {/* Busca */}
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Buscar por nome, telefone ou cidade..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                {/* Filtros */}
                <div className="flex gap-2">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[180px]">
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos os Status</SelectItem>
                      <SelectItem value="A">A - Pronto para batismo</SelectItem>
                      <SelectItem value="B">B - Decidido, com detalhes</SelectItem>
                      <SelectItem value="C">C - Estudando, indeciso</SelectItem>
                      <SelectItem value="D">D - Estudando atualmente</SelectItem>
                      <SelectItem value="E">E - Contato inicial</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={cidadeFilter} onValueChange={setCidadeFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Cidade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todas">Todas as Cidades</SelectItem>
                      {cidadesUnicas.map(cidade => (
                        <SelectItem key={cidade} value={cidade}>{cidade}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleImport} className="flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  Importar
                </Button>
                <Button 
                  onClick={generatePDFReport}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  Relatório
                </Button>
                <Button 
                  onClick={handleExport}
                  className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Exportar
                </Button>
              </div>
            </div>

            {/* Resumo dos filtros */}
            <div className="mt-4 text-sm text-gray-600">
              Mostrando {filteredInteressados.length} de {interessados.length} interessados
            </div>
          </div>

          {/* Table */}
          <div className="p-6">
            {filteredInteressados.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">
                  {searchTerm || statusFilter !== 'todos' || cidadeFilter !== 'todas' 
                    ? 'Nenhum interessado encontrado com os critérios de busca.' 
                    : 'Nenhum interessado cadastrado ainda.'}
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="font-semibold text-gray-700">Nome</TableHead>
                    <TableHead className="font-semibold text-gray-700">Telefone</TableHead>
                    <TableHead className="font-semibold text-gray-700">Cidade</TableHead>
                    <TableHead className="font-semibold text-gray-700">Status</TableHead>
                    <TableHead className="font-semibold text-gray-700">Instrutor</TableHead>
                    <TableHead className="font-semibold text-gray-700">Data Contato</TableHead>
                    <TableHead className="font-semibold text-gray-700">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInteressados.map((interessado) => (
                    <TableRow key={interessado.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">{interessado.nome_completo}</TableCell>
                      <TableCell>{interessado.telefone}</TableCell>
                      <TableCell>{interessado.cidade}</TableCell>
                      <TableCell>
                        <Badge className={StatusColors[interessado.status]}>
                          {interessado.status} - {StatusLabels[interessado.status]}
                        </Badge>
                      </TableCell>
                      <TableCell>{interessado.instrutor_biblico}</TableCell>
                      <TableCell>{interessado.data_contato ? new Date(interessado.data_contato).toLocaleDateString('pt-BR') : '-'}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-blue-600 hover:text-blue-700"
                            onClick={() => handleEdit(interessado)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-red-600 hover:text-red-700"
                            onClick={() => handleDelete(interessado.id, interessado.nome_completo)}
                          >
                            <Trash className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Interessado</DialogTitle>
          </DialogHeader>
          {editingInteressado && (
            <EditarInteressado
              interessado={editingInteressado}
              onSave={handleSaveEdit}
              onCancel={handleCancelEdit}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
