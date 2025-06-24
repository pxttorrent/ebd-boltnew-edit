import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Interessado, StatusLabels } from '../types';
import { useToast } from '@/hooks/use-toast';
import EditarInteressado from '../components/EditarInteressado';
import ColumnSelector, { ColumnOption } from '../components/ColumnSelector';
import ImportarDados from '../components/ImportarDados';
import EdicaoRapida from '../components/EdicaoRapida';
import CadastroInstrutorInline from '../components/CadastroInstrutorInline';
import InteressadosFilters from '../components/InteressadosFilters';
import InteressadosActions from '../components/InteressadosActions';
import InteressadosStats from '../components/InteressadosStats';
import InteressadosTable from '../components/InteressadosTable';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';

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

    // Aplicar filtro por tipo de usuário
    if (currentUser?.tipo === 'missionario') {
      // Missionários só podem ver interessados dos quais são instrutores bíblicos
      baseInteressados = interessados.filter(interessado => 
        interessado.instrutor_biblico === currentUser.nome_completo
      );
    }
    // Administradores veem todos os interessados (sem filtro adicional)

    return baseInteressados.filter(interessado => {
      const matchesSearch = interessado.nome_completo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        interessado.telefone.includes(searchTerm) ||
        interessado.cidade.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'todos' || interessado.status === statusFilter;
      
      const matchesCidade = cidadeFilter === 'todas' || interessado.cidade === cidadeFilter;
      
      return matchesSearch && matchesStatus && matchesCidade;
    });
  }, [interessados, searchTerm, statusFilter, cidadeFilter, currentUser]);

  // Obter cidades únicas baseado nos interessados que o usuário pode ver
  const cidadesUnicas = useMemo(() => {
    let interessadosVisiveis = interessados;
    
    // Aplicar o mesmo filtro por tipo de usuário para as cidades
    if (currentUser?.tipo === 'missionario') {
      interessadosVisiveis = interessados.filter(interessado => 
        interessado.instrutor_biblico === currentUser.nome_completo
      );
    }
    
    return [...new Set(interessadosVisiveis.map(i => i.cidade))].sort();
  }, [interessados, currentUser]);

  const handleDelete = (id: string, nome: string) => {
    // Verificar se o usuário pode excluir este interessado
    const interessado = interessados.find(i => i.id === id);
    if (currentUser?.tipo === 'missionario' && interessado?.instrutor_biblico !== currentUser.nome_completo) {
      toast({
        title: "Acesso negado",
        description: "Você só pode excluir interessados dos quais é instrutor bíblico.",
        variant: "destructive"
      });
      return;
    }

    if (window.confirm(`Tem certeza que deseja excluir ${nome}?`)) {
      deleteInteressado(id);
      toast({
        title: "Sucesso!",
        description: "Interessado excluído com sucesso."
      });
    }
  };

  const handleEdit = (interessado: Interessado) => {
    // Verificar se o usuário pode editar este interessado
    if (currentUser?.tipo === 'missionario' && interessado.instrutor_biblico !== currentUser.nome_completo) {
      toast({
        title: "Acesso negado",
        description: "Você só pode editar interessados dos quais é instrutor bíblico.",
        variant: "destructive"
      });
      return;
    }

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
    // Verificar se o usuário pode editar este interessado
    if (currentUser?.tipo === 'missionario' && interessado.instrutor_biblico !== currentUser.nome_completo) {
      toast({
        title: "Acesso negado",
        description: "Você só pode editar interessados dos quais é instrutor bíblico.",
        variant: "destructive"
      });
      return;
    }

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
    // Verificar se o usuário pode editar este interessado
    if (currentUser?.tipo === 'missionario' && interessado.instrutor_biblico !== currentUser.nome_completo) {
      toast({
        title: "Acesso negado",
        description: "Você só pode editar interessados dos quais é instrutor bíblico.",
        variant: "destructive"
      });
      return;
    }

    setInteressadoEdicaoRapida(interessado);
    setCampoEdicaoRapida(campo);
    setIsEdicaoRapidaOpen(true);
  };

  const handleClearAll = () => {
    if (window.confirm('Tem certeza que deseja apagar TODOS os interessados? Esta ação não pode ser desfeita.')) {
      // Apagar todos os interessados um por um
      interessados.forEach(interessado => {
        deleteInteressado(interessado.id);
      });
      
      toast({
        title: "Sucesso!",
        description: `${interessados.length} interessados foram excluídos.`
      });
    }
  };

  const getEmptyMessage = () => {
    if (currentUser?.tipo === 'missionario') {
      if (searchTerm || statusFilter !== 'todos' || cidadeFilter !== 'todas') {
        return 'Nenhum interessado encontrado com os critérios de busca entre aqueles dos quais você é instrutor bíblico.';
      }
      return 'Você ainda não é instrutor bíblico de nenhum interessado.';
    }
    
    if (searchTerm || statusFilter !== 'todos' || cidadeFilter !== 'todas') {
      return 'Nenhum interessado encontrado com os critérios de busca.';
    }
    return 'Nenhum interessado cadastrado ainda.';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Lista de Interessados</h1>
            
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
              <InteressadosFilters
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
                cidadeFilter={cidadeFilter}
                setCidadeFilter={setCidadeFilter}
                cidadesUnicas={cidadesUnicas}
              />
              
              <InteressadosActions
                onImport={handleImport}
                onGenerateReport={openColumnSelector}
                onExport={handleExport}
              />
            </div>

            <InteressadosStats
              filteredCount={filteredInteressados.length}
              totalCount={interessados.length}
              currentUser={currentUser}
            />
          </div>

          {/* Table */}
          <div className="p-6">
            {filteredInteressados.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">{getEmptyMessage()}</p>
              </div>
            ) : (
              <InteressadosTable
                interessados={filteredInteressados}
                usuarios={usuarios}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onStatusClick={handleEdicaoRapida}
                onInstrutorClick={handleInstrutorClick}
                onFrequentaCultosClick={handleEdicaoRapida}
              />
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
