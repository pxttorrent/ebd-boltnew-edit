
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useApp } from '../context/AppContext';
import { useToast } from '@/hooks/use-toast';
import { Interessado, StatusLabels } from '../types';

interface EdicaoRapidaProps {
  isOpen: boolean;
  onClose: () => void;
  interessado: Interessado | null;
  campo: 'status' | 'instrutor_biblico' | 'frequenta_cultos' | null;
}

export default function EdicaoRapida({ isOpen, onClose, interessado, campo }: EdicaoRapidaProps) {
  const { usuarios, updateInteressado } = useApp();
  const { toast } = useToast();
  const [valor, setValor] = useState('');

  React.useEffect(() => {
    if (interessado && campo) {
      setValor(interessado[campo] || '');
    }
  }, [interessado, campo]);

  const handleSave = () => {
    if (!interessado || !campo) return;

    updateInteressado(interessado.id, { [campo]: valor });
    
    toast({
      title: "Sucesso!",
      description: "Campo atualizado com sucesso."
    });

    onClose();
  };

  const getTitulo = () => {
    switch (campo) {
      case 'status': return 'Alterar Status';
      case 'instrutor_biblico': return 'Alterar Instrutor Bíblico';
      case 'frequenta_cultos': return 'Alterar Participação em Eventos';
      default: return 'Editar Campo';
    }
  };

  const renderSelect = () => {
    switch (campo) {
      case 'status':
        return (
          <Select value={valor} onValueChange={setValor}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o status" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(StatusLabels).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {key} - {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      
      case 'instrutor_biblico':
        return (
          <Select value={valor} onValueChange={setValor}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o instrutor" />
            </SelectTrigger>
            <SelectContent>
              {usuarios.map((usuario) => (
                <SelectItem key={usuario.id} value={usuario.nome_completo}>
                  {usuario.nome_completo}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      
      case 'frequenta_cultos':
        return (
          <Select value={valor} onValueChange={setValor}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione a frequência" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="frequentemente">Frequentemente</SelectItem>
              <SelectItem value="algumas_vezes">Algumas vezes</SelectItem>
              <SelectItem value="raramente">Raramente</SelectItem>
              <SelectItem value="nunca">Nunca</SelectItem>
            </SelectContent>
          </Select>
        );
      
      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{getTitulo()}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {interessado && (
            <div className="text-sm text-gray-600">
              <strong>{interessado.nome_completo}</strong>
            </div>
          )}
          
          <div>
            <Label className="text-sm font-medium">
              Novo Valor
            </Label>
            <div className="mt-2">
              {renderSelect()}
            </div>
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button 
              onClick={handleSave}
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
            >
              Salvar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
