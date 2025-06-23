
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

export interface ColumnOption {
  key: string;
  label: string;
  selected: boolean;
}

interface ColumnSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  columns: ColumnOption[];
  onColumnsChange: (columns: ColumnOption[]) => void;
  onGenerate: () => void;
}

export default function ColumnSelector({ 
  isOpen, 
  onClose, 
  columns, 
  onColumnsChange, 
  onGenerate 
}: ColumnSelectorProps) {
  const handleColumnToggle = (index: number) => {
    const updatedColumns = [...columns];
    updatedColumns[index].selected = !updatedColumns[index].selected;
    onColumnsChange(updatedColumns);
  };

  const handleSelectAll = () => {
    const allSelected = columns.every(col => col.selected);
    const updatedColumns = columns.map(col => ({ ...col, selected: !allSelected }));
    onColumnsChange(updatedColumns);
  };

  const selectedCount = columns.filter(col => col.selected).length;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Selecionar Colunas do Relatório</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleSelectAll}
            >
              {columns.every(col => col.selected) ? 'Desmarcar Todas' : 'Selecionar Todas'}
            </Button>
            <span className="text-sm text-gray-600">
              {selectedCount} de {columns.length} selecionadas
            </span>
          </div>
          
          <div className="grid grid-cols-1 gap-3 max-h-60 overflow-y-auto">
            {columns.map((column, index) => (
              <div key={column.key} className="flex items-center space-x-2">
                <Checkbox
                  id={`column-${column.key}`}
                  checked={column.selected}
                  onCheckedChange={() => handleColumnToggle(index)}
                />
                <Label 
                  htmlFor={`column-${column.key}`}
                  className="text-sm font-medium cursor-pointer"
                >
                  {column.label}
                </Label>
              </div>
            ))}
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button 
              onClick={onGenerate}
              disabled={selectedCount === 0}
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
            >
              Gerar Relatório
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
