
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useApp } from '../context/AppContext';
import { Usuario, IgrejaOptions } from '../types';
import { capitalizeWords } from '../utils/textUtils';

interface CadastroInstrutorInlineProps {
  isOpen: boolean;
  onClose: () => void;
  nomeInstrutor: string;
  onInstrutorCadastrado: (nomeCompleto: string) => void;
}

export default function CadastroInstrutorInline({ 
  isOpen, 
  onClose, 
  nomeInstrutor, 
  onInstrutorCadastrado 
}: CadastroInstrutorInlineProps) {
  const { addUsuario } = useApp();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    nome_completo: capitalizeWords(nomeInstrutor),
    apelido: '',
    login_acesso: '',
    senha: '123456', // Senha padrão
    igreja: 'Armour' as const
  });

  const generateId = () => {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome_completo || !formData.apelido || !formData.login_acesso || !formData.igreja) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    const novoUsuario: Usuario = {
      id: generateId(),
      nome_completo: formData.nome_completo,
      apelido: formData.apelido,
      login_acesso: formData.login_acesso,
      senha: formData.senha,
      igreja: formData.igreja,
      aprovado: true,
      permissoes: {
        pode_cadastrar: true,
        pode_editar: true,
        pode_excluir: false,
        pode_exportar: true
      }
    };

    addUsuario(novoUsuario);
    onInstrutorCadastrado(formData.nome_completo);
    
    toast({
      title: "Sucesso!",
      description: "Instrutor cadastrado com sucesso."
    });

    onClose();
  };

  const handleNomeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nome = capitalizeWords(e.target.value);
    setFormData({ 
      ...formData, 
      nome_completo: nome,
      apelido: nome.toLowerCase().replace(/\s+/g, '.'),
      login_acesso: nome.toLowerCase().replace(/\s+/g, '.') + '@escola-biblica.app'
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Cadastrar Instrutor</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="nome_completo" className="text-sm font-medium">
              Nome Completo *
            </Label>
            <Input
              id="nome_completo"
              value={formData.nome_completo}
              onChange={handleNomeChange}
              placeholder="Digite o nome completo"
              required
            />
          </div>

          <div>
            <Label htmlFor="apelido" className="text-sm font-medium">
              Apelido *
            </Label>
            <Input
              id="apelido"
              value={formData.apelido}
              onChange={(e) => setFormData({ ...formData, apelido: e.target.value })}
              placeholder="Como é conhecido"
              required
            />
          </div>

          <div>
            <Label htmlFor="login_acesso" className="text-sm font-medium">
              Login de Acesso *
            </Label>
            <Input
              id="login_acesso"
              value={formData.login_acesso}
              onChange={(e) => setFormData({ ...formData, login_acesso: e.target.value })}
              placeholder="usuario@escola-biblica.app"
              required
            />
          </div>

          <div>
            <Label htmlFor="igreja" className="text-sm font-medium">
              Igreja *
            </Label>
            <Select value={formData.igreja} onValueChange={(value) => setFormData({ ...formData, igreja: value as typeof formData.igreja })}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a igreja" />
              </SelectTrigger>
              <SelectContent>
                {IgrejaOptions.map((igreja) => (
                  <SelectItem key={igreja} value={igreja}>
                    {igreja}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="text-xs text-gray-500">
            * Senha padrão: 123456 (pode ser alterada nas configurações)
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button 
              type="submit"
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
            >
              Cadastrar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
