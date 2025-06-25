import React from 'react';
import { Button } from '@/components/ui/button';
import { Download, Upload, FileText, MessageCircle } from 'lucide-react';

interface InteressadosActionsProps {
  onImport: () => void;
  onGenerateReport: () => void;
  onExport: () => void;
  onWhatsAppMass: () => void;
}

export default function InteressadosActions({
  onImport,
  onGenerateReport,
  onExport,
  onWhatsAppMass
}: InteressadosActionsProps) {
  return (
    <div className="flex gap-2">
      <Button variant="outline" onClick={onImport} className="flex items-center gap-2">
        <Upload className="w-4 h-4" />
        Importar
      </Button>
      <Button 
        onClick={onGenerateReport}
        variant="outline"
        className="flex items-center gap-2"
      >
        <FileText className="w-4 h-4" />
        Relatório
      </Button>
      <Button 
        onClick={onWhatsAppMass}
        variant="outline"
        className="flex items-center gap-2 text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200"
      >
        <MessageCircle className="w-4 h-4" />
        WhatsApp
      </Button>
      <Button 
        onClick={onExport}
        className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white flex items-center gap-2"
      >
        <Download className="w-4 h-4" />
        Exportar
      </Button>
    </div>
  );
}