
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, FileSpreadsheet } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useApp } from '../context/AppContext';
import * as XLSX from 'xlsx';
import { Interessado } from '../types';
import { formatPhone } from '../utils/phoneUtils';
import { capitalizeWords } from '../utils/textUtils';

interface ImportarDadosProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ImportarDados({ isOpen, onClose }: ImportarDadosProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const { addInteressado } = useApp();
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const generateId = () => {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  };

  const processImportData = async () => {
    if (!file) {
      toast({
        title: "Erro",
        description: "Selecione um arquivo para importar.",
        variant: "destructive"
      });
      return;
    }

    setIsImporting(true);

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      let imported = 0;
      let errors = 0;

      for (const row of jsonData) {
        try {
          const rowData = row as any;
          
          // Mapear campos do Excel para o formato do sistema - sendo mais tolerante
          const interessado: Interessado = {
            id: generateId(),
            nome_completo: capitalizeWords(rowData['Nome Completo'] || rowData['Nome'] || ''),
            telefone: formatPhone(rowData['Telefone'] || ''),
            endereco: rowData['Endereço'] || rowData['Endereco'] || '',
            cidade: rowData['Igreja'] || rowData['Cidade'] || 'Armour', // Default para Armour se não especificado
            status: (rowData['Status']?.toString().charAt(0) || 'E') as Interessado['status'],
            instrutor_biblico: rowData['Instrutor Bíblico'] || rowData['Instrutor'] || 'A definir',
            data_contato: rowData['Data do Contato'] || rowData['Data'] ? 
              (rowData['Data do Contato'] || rowData['Data']).toString().includes('/') ?
                new Date(rowData['Data do Contato'] || rowData['Data']).toISOString().split('T')[0] :
                rowData['Data do Contato'] || rowData['Data'] :
              '',
            frequenta_cultos: rowData['Participação em Eventos'] || rowData['Participacao'] || '',
            estudo_biblico: rowData['Estudo Bíblico'] || rowData['Estudo'] || '',
            observacoes: rowData['Observações'] || rowData['Observacoes'] || ''
          };

          // Validar apenas campos mínimos essenciais
          if (interessado.nome_completo.trim() && interessado.telefone.trim()) {
            addInteressado(interessado);
            imported++;
          } else {
            console.log('Registro ignorado - falta nome ou telefone:', rowData);
            errors++;
          }
        } catch (error) {
          console.log('Erro ao processar linha:', error, row);
          errors++;
        }
      }

      toast({
        title: "Importação Concluída",
        description: `${imported} registros importados com sucesso. ${errors > 0 ? `${errors} registros ignorados por falta de dados essenciais (nome e telefone).` : ''}`
      });

      onClose();
      setFile(null);
    } catch (error) {
      console.log('Erro na importação:', error);
      toast({
        title: "Erro na Importação",
        description: "Erro ao processar o arquivo. Verifique se é um arquivo Excel válido.",
        variant: "destructive"
      });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Importar Dados</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="text-sm text-gray-600">
            <p>Selecione um arquivo Excel (.xlsx) com os dados dos interessados.</p>
            <p className="mt-2">
              <strong>Campos obrigatórios:</strong> Nome Completo e Telefone
            </p>
            <p className="mt-1">
              <strong>Campos opcionais:</strong> Endereço, Igreja, Status, Instrutor Bíblico, Data do Contato, Participação em Eventos, Estudo Bíblico, Observações
            </p>
            <p className="mt-2 text-xs text-blue-600">
              * Se um instrutor não for encontrado, você poderá completar o cadastro depois na lista.
            </p>
          </div>
          
          <div>
            <Label htmlFor="file-upload" className="text-sm font-medium">
              Arquivo Excel
            </Label>
            <div className="mt-2 flex items-center gap-3">
              <Input
                id="file-upload"
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
                className="flex-1"
              />
              {file && (
                <div className="flex items-center text-green-600">
                  <FileSpreadsheet className="w-4 h-4 mr-1" />
                  <span className="text-xs">{file.name}</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button 
              onClick={processImportData}
              disabled={!file || isImporting}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
            >
              {isImporting ? (
                <>
                  <Upload className="w-4 h-4 mr-2 animate-spin" />
                  Importando...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Importar
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
