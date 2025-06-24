import React, { useState, useMemo } from 'react';
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
import ColumnSelector, { ColumnOption } from '../components/ColumnSelector';
import ImportarDados from '../components/ImportarDados';
import EdicaoRapida from '../components/EdicaoRapida';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import CadastroInstrutorInline from '../components/CadastroInstrutorInline';

export default function ListaInteressados() {
  const { interessados, deleteInteressado, usuarios, currentUser } = useApp();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const [cidadeFilter, setCidadeFilter] = useState<string>('todas');
  const [editingInteressado, setEditingInteressado] = useState<Interessado | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isColumnSelectorOpen, setIsColumnSelectorOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [isEdicaoRapidaOpen, setIsEdicaoRapidaOpen] = useState(false);
  const [interessadoEdicaoRapida, setInteressadoEdicaoRapida] = useState<Interessado | null>(null);
  const [campoEdicaoRapida, setCampoEdicaoRapida] = useState<'status' | 'instrutor_biblico' | 'frequenta_cultos' | null>(null);
  const [isCadastroInstrutorOpen, setIsCadastroInstrutorOpen] = useState(false);
  const [instrutorParaCadastro, setInstrutorParaCadastro] = useState('');
  const [interessadoParaAtualizarInstrutor, setInteressadoParaAtualizarInstrutor] = useState<Interessado | null>(null);

  // Definir colunas disponíveis para o relatório
  const [reportColumns, setReportColumns] = useState<ColumnOption[]>([
    { key: 'nome_completo', label: 'Nome Completo', selected: true },
    { key: 'telefone', label: 'Telefone', selected: true },
    { key: 'endereco', label: 'Endereço', selected: true },
    { key: 'cidade', label: 'Igreja', selected: true },
    { key: 'status', label: 'Status', selected: true },
    { key: 'instrutor_biblico', label: 'Instrutor Bíblico', selected: true },
    { key: 'data_contato', label: 'Data do Contato', selected: true },
    { key: 'frequenta_cultos', label: 'Participação em Eventos', selected: true },
    { key: 'estudo_biblico', label: 'Estudo Bíblico', selected: true },
    { key: 'observacoes', label: 'Observações', selected: false }
  ]);

  // Filtrar interessados baseado no tipo de usuário
  const filteredInteressados = useMemo(() => {
    let baseInteressados = interessados;

    // Se for missionário, mostrar apenas interessados que ele cadastrou
    if (currentUser?.tipo === 'missionario') {
      baseInteressados = interessados.filter(interessado => 
        interessado.instrutor_biblico === currentUser.nome_completo
      );
    }

    return baseInteressados.filter(interessado => {
      const matchesSearch = interessado.nome_completo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        interessado.telefone.includes(searchTerm) ||
        interessado.cidade.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'todos' || interessado.status === statusFilter;
      
      const matchesCidade = cidadeFilter === 'todas' || interessado.cidade === cidadeFilter;
      
      return matchesSearch && matchesStatus && matchesCidade;
    });
  }, [interessados, currentUser, searchTerm, statusFilter, cidadeFilter]);

  // Obter cidades únicas baseado nos interessados visíveis
  const cidadesUnicas = useMemo(() => {
    let baseInteressados = interessados;
    
    // Se for missionário, considerar apenas interessados que ele cadastrou
    if (currentUser?.tipo === 'missionario') {
      baseInteressados = interessados.filter(interessado => 
        interessado.instrutor_biblico === currentUser.nome_completo
      );
    }
    
    return [...new Set(baseInteressados.map(i => i.cidade))].sort();
  }, [interessados, currentUser]);

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
    // Preparar dados para Excel
    const excelData = filteredInteressados.map(interessado => ({
      'Nome Completo': interessado.nome_completo,
      'Telefone': interessado.telefone,
      'Endereço': interessado.endereco || '',
      'Igreja': interessado.cidade,
      'Status': `${interessado.status} - ${StatusLabels[interessado.status]}`,
      'Instrutor Bíblico': interessado.instrutor_biblico,
      'Data do Contato': interessado.data_contato ? new Date(interessado.data_contato).toLocaleDateString('pt-BR') : '',
      'Participação em Eventos': interessado.frequenta_cultos || 'Não informado',
      'Estudo Bíblico': interessado.estudo_biblico || '',
      'Observações': interessado.observacoes || ''
    }));

    // Criar planilha
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Interessados');

    // Definir largura das colunas
    const columnWidths = [
      { wch: 25 }, { wch: 15 }, { wch: 30 }, { wch: 20 }, { wch: 25 },
      { wch: 20 }, { wch: 12 }, { wch: 20 }, { wch: 25 }, { wch: 40 }
    ];
    worksheet['!cols'] = columnWidths;

    // Gerar nome do arquivo
    const fileName = `interessados-${new Date().toISOString().split('T')[0]}.xlsx`;
    
    // Fazer download
    XLSX.writeFile(workbook, fileName);

    toast({
      title: "Exportação Concluída!",
      description: "A planilha Excel foi baixada com sucesso."
    });
  };

  const handleImport = () => {
    setIsImportDialogOpen(true);
  };

  const openColumnSelector = () => {
    setIsColumnSelectorOpen(true);
  };

  const generatePDFReport = () => {
    const selectedColumns = reportColumns.filter(col => col.selected);
    
    if (selectedColumns.length === 0) {
      toast({
        title: "Erro",
        description: "Selecione pelo menos uma coluna para o relatório."
      });
      return;
    }

    const doc = new jsPDF('landscape');
    
    doc.setFontSize(16);
    doc.text('RELATÓRIO DE INTERESSADOS', 20, 20);
    
    doc.setFontSize(12);
    doc.text(`Total de Interessados: ${filteredInteressados.length}`, 20, 35);
    doc.text(`Data do Relatório: ${new Date().toLocaleDateString('pt-BR')}`, 20, 45);
    
    doc.setFontSize(8);
    let yPosition = 65;
    
    // Calcular largura das colunas baseado na quantidade selecionada
    const availableWidth = 270;
    const columnWidth = availableWidth / selectedColumns.length;
    
    // Cabeçalho dinâmico baseado nas colunas selecionadas
    selectedColumns.forEach((col, index) => {
      doc.text(col.label, 10 + (index * columnWidth), yPosition);
    });
    
    yPosition += 5;
    doc.line(10, yPosition, 280, yPosition);
    yPosition += 10;
    
    filteredInteressados.forEach((interessado) => {
      if (yPosition > 190) {
        doc.addPage();
        yPosition = 20;
      }
      
      selectedColumns.forEach((col, index) => {
        let value = '';
        switch (col.key) {
          case 'nome_completo':
            value = interessado.nome_completo.substring(0, 15);
            break;
          case 'telefone':
            value = interessado.telefone;
            break;
          case 'endereco':
            value = (interessado.endereco || '').substring(0, 12);
            break;
          case 'cidade':
            value = interessado.cidade.substring(0, 10);
            break;
          case 'status':
            value = `${interessado.status}`;
            break;
          case 'instrutor_biblico':
            value = interessado.instrutor_biblico.substring(0, 10);
            break;
          case 'data_contato':
            value = interessado.data_contato ? new Date(interessado.data_contato).toLocaleDateString('pt-BR') : '-';
            break;
          case 'frequenta_cultos':
            value = (interessado.frequenta_cultos || '').substring(0, 8);
            break;
          case 'estudo_biblico':
            value = (interessado.estudo_biblico || '').substring(0, 10);
            break;
          case 'observacoes':
            value = (interessado.observacoes || '').substring(0, 15);
            break;
        }
        doc.text(value, 10 + (index * columnWidth), yPosition);
      });
      
      yPosition += 8;
    });
    
    const fileName = `relatorio-interessados-${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);

    setIsColumnSelectorOpen(false);
    toast({
      title: "Relatório PDF Gerado!",
      description: "O relatório em PDF foi baixado com sucesso."
    });
  };

  const handleInstrutorClick = (interessado: Interessado) => {
    // Verificar se o instrutor existe na lista de usuários
    const instrutorExiste = usuarios.some(usuario => 
      usuario.nome_completo.toLowerCase() === interessado.instrutor_biblico.toLowerCase()
    );

    if (!instrutorExiste && interessado.instrutor_biblico !== 'A definir') {
      setInstrutorParaCadastro(interessado.instrutor_biblico);
      setInteressadoParaAtualizarInstrutor(interessado);
      setIsCadastroInstrutorOpen(true);
    } else {
      // Se existe, fazer edição rápida normal
      handleEdicaoRapida(interessado, 'instrutor_biblico');
    }
  };

  const handleInstrutorCadastrado = (nomeCompleto: string) => {
    if (interessadoParaAtualizarInstrutor) {
      // Atualizar o interessado com o nome do instrutor cadastrado
      // Isso já está correto, só fechamos os modais
      setIsCadastroInstrutorOpen(false);
      setInstrutorParaCadastro('');
      setInteressadoParaAtualizarInstrutor(null);
    }
  };

  const handleEdicaoRapida = (interessado: Interessado, campo: 'status' | 'instrutor_biblico' | 'frequenta_cultos') => {
    setInteressadoEdicaoRapida(interessado);
    setCampoEdicaoRapida(campo);
    setIsEdicaoRapidaOpen(true);
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
                    placeholder="Buscar por nome, telefone ou igreja..."
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
                      <SelectValue placeholder="Igreja" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todas">Todas as Igrejas</SelectItem>
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
                  onClick={openColumnSelector}
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
              {currentUser?.tipo === 'missionario' && (
                <span className="text-blue-600 font-medium"> (seus cadastros)</span>
              )}
            </div>
          </div>

          {/* Table with horizontal scroll for all columns */}
          <div className="p-6">
            {filteredInteressados.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">
                  {searchTerm || statusFilter !== 'todos' || cidadeFilter !== 'todas' 
                    ? 'Nenhum interessado encontrado com os critérios de busca.' 
                    : currentUser?.tipo === 'missionario' 
                      ? 'Você ainda não cadastrou nenhum interessado.'
                      : 'Nenhum interessado cadastrado ainda.'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table className="min-w-[1400px]">
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="font-semibold text-gray-700 min-w-[200px]">Nome</TableHead>
                      <TableHead className="font-semibold text-gray-700 min-w-[120px]">Telefone</TableHead>
                      <TableHead className="font-semibold text-gray-700 min-w-[200px]">Endereço</TableHead>
                      <TableHead className="font-semibold text-gray-700 min-w-[120px]">Igreja</TableHead>
                      <TableHead className="font-semibold text-gray-700 min-w-[180px]">Status</TableHead>
                      <TableHead className="font-semibold text-gray-700 min-w-[150px]">Instrutor</TableHead>
                      <TableHead className="font-semibold text-gray-700 min-w-[120px]">Data Contato</TableHead>
                      <TableHead className="font-semibold text-gray-700 min-w-[150px]">Participação Eventos</TableHead>
                      <TableHead className="font-semibold text-gray-700 min-w-[200px]">Estudo Bíblico</TableHead>
                      <TableHead className="font-semibold text-gray-700 min-w-[250px]">Observações</TableHead>
                      <TableHead className="font-semibold text-gray-700 min-w-[120px] text-center">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInteressados.map((interessado) => (
                      <TableRow key={interessado.id} className="hover:bg-gray-50">
                        <TableCell className="font-medium">{interessado.nome_completo}</TableCell>
                        <TableCell>{interessado.telefone}</TableCell>
                        <TableCell>{interessado.endereco || '-'}</TableCell>
                        <TableCell>{interessado.cidade}</TableCell>
                        <TableCell>
                          <div 
                            className="cursor-pointer"
                            onClick={() => handleEdicaoRapida(interessado, 'status')}
                            title="Clique para editar"
                          >
                            <Badge className={StatusColors[interessado.status]}>
                              {interessado.status} - {StatusLabels[interessado.status]}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div 
                            className={`cursor-pointer hover:text-blue-600 hover:underline ${
                              !usuarios.some(u => u.nome_completo.toLowerCase() === interessado.instrutor_biblico.toLowerCase()) && 
                              interessado.instrutor_biblico !== 'A definir' 
                                ? 'text-red-600 font-medium' 
                                : ''
                            }`}
                            onClick={() => handleInstrutorClick(interessado)}
                            title={
                              !usuarios.some(u => u.nome_completo.toLowerCase() === interessado.instrutor_biblico.toLowerCase()) && 
                              interessado.instrutor_biblico !== 'A definir'
                                ? "Instrutor não cadastrado - Clique para cadastrar"
                                : "Clique para editar"
                            }
                          >
                            {interessado.instrutor_biblico}
                            {!usuarios.some(u => u.nome_completo.toLowerCase() === interessado.instrutor_biblico.toLowerCase()) && 
                             interessado.instrutor_biblico !== 'A definir' && (
                              <span className="text-xs block">📝 Cadastrar</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{interessado.data_contato ? new Date(interessado.data_contato).toLocaleDateString('pt-BR') : '-'}</TableCell>
                        <TableCell>
                          <div 
                            className="cursor-pointer hover:text-blue-600 hover:underline"
                            onClick={() => handleEdicaoRapida(interessado, 'frequenta_cultos')}
                            title="Clique para editar"
                          >
                            {interessado.frequenta_cultos || '-'}
                          </div>
                        </TableCell>
                        <TableCell>{interessado.estudo_biblico || '-'}</TableCell>
                        <TableCell>
                          <div className="max-w-[200px] truncate" title={interessado.observacoes}>
                            {interessado.observacoes || '-'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1 justify-center">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 p-2"
                              onClick={() => handleEdit(interessado)}
                              title="Editar interessado"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 p-2"
                              onClick={() => handleDelete(interessado.id, interessado.nome_completo)}
                              title="Excluir interessado"
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

      {/* Column Selector Dialog */}
      <ColumnSelector
        isOpen={isColumnSelectorOpen}
        onClose={() => setIsColumnSelectorOpen(false)}
        columns={reportColumns}
        onColumnsChange={setReportColumns}
        onGenerate={generatePDFReport}
      />

      {/* Import Dialog */}
      <ImportarDados
        isOpen={isImportDialogOpen}
        onClose={() => setIsImportDialogOpen(false)}
      />

      {/* Edição Rápida Dialog */}
      <EdicaoRapida
        isOpen={isEdicaoRapidaOpen}
        onClose={() => setIsEdicaoRapidaOpen(false)}
        interessado={interessadoEdicaoRapida}
        campo={campoEdicaoRapida}
      />

      {/* Cadastro Instrutor Inline Dialog */}
      <CadastroInstrutorInline
        isOpen={isCadastroInstrutorOpen}
        onClose={() => setIsCadastroInstrutorOpen(false)}
        nomeInstrutor={instrutorParaCadastro}
        onInstrutorCadastrado={handleInstrutorCadastrado}
      />
    </div>
  );
}
