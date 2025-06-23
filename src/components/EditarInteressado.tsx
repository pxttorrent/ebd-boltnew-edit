import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Interessado, StatusLabels, IgrejaOptions } from '../types';
import { useToast } from '@/hooks/use-toast';
import { capitalizeWords } from '../utils/textUtils';
import { formatPhone } from '../utils/phoneUtils';

interface EditarInteressadoProps {
  interessado: Interessado;
  onSave: () => void;
  onCancel: () => void;
}

export default function EditarInteressado({ interessado, onSave, onCancel }: EditarInteressadoProps) {
  const { usuarios, updateInteressado } = useApp();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    nome_completo: interessado.nome_completo,
    telefone: formatPhone(interessado.telefone),
    endereco: interessado.endereco || '',
    cidade: interessado.cidade,
    status: interessado.status,
    instrutor_biblico: interessado.instrutor_biblico,
    data_contato: interessado.data_contato,
    observacoes: interessado.observacoes,
    frequenta_cultos: interessado.frequenta_cultos,
    estudo_biblico: interessado.estudo_biblico || ''
  });

  const handleNomeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const capitalizedName = capitalizeWords(e.target.value);
    setFormData({ ...formData, nome_completo: capitalizedName });
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedPhone = formatPhone(e.target.value);
    setFormData({ ...formData, telefone: formattedPhone });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome_completo || !formData.telefone || !formData.cidade || !formData.status || !formData.instrutor_biblico) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    updateInteressado(interessado.id, formData);
    
    toast({
      title: "Sucesso!",
      description: "Interessado atualizado com sucesso."
    });

    onSave();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="edit_nome_completo" className="text-sm font-medium text-gray-700 mb-2 block">
            Nome Completo *
          </Label>
          <Input
            id="edit_nome_completo"
            value={formData.nome_completo}
            onChange={handleNomeChange}
            placeholder="Digite o nome completo"
            required
          />
        </div>

        <div>
          <Label htmlFor="edit_telefone" className="text-sm font-medium text-gray-700 mb-2 block">
            Telefone *
          </Label>
          <Input
            id="edit_telefone"
            value={formData.telefone}
            onChange={handlePhoneChange}
            placeholder="(99)99999-9999"
            required
            maxLength={14}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="edit_endereco" className="text-sm font-medium text-gray-700 mb-2 block">
          Endereço
        </Label>
        <Input
          id="edit_endereco"
          value={formData.endereco}
          onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
          placeholder="Rua, número, bairro"
        />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="edit_cidade" className="text-sm font-medium text-gray-700 mb-2 block">
            Cidade *
          </Label>
          <Select value={formData.cidade} onValueChange={(value) => setFormData({ ...formData, cidade: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione a cidade" />
            </SelectTrigger>
            <SelectContent>
              {IgrejaOptions.map((cidade) => (
                <SelectItem key={cidade} value={cidade}>
                  {cidade}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="edit_status" className="text-sm font-medium text-gray-700 mb-2 block">
            Qual a situação atual deste interessado? *
          </Label>
          <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value as Interessado['status'] })}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione a situação" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(StatusLabels).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {key} - {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="edit_instrutor_biblico" className="text-sm font-medium text-gray-700 mb-2 block">
            Instrutor Bíblico *
          </Label>
          <Select value={formData.instrutor_biblico} onValueChange={(value) => setFormData({ ...formData, instrutor_biblico: value })}>
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
        </div>

        <div>
          <Label htmlFor="edit_data_contato" className="text-sm font-medium text-gray-700 mb-2 block">
            Data do Primeiro Contato (Aproximadamente)
          </Label>
          <Input
            id="edit_data_contato"
            type="date"
            value={formData.data_contato}
            onChange={(e) => setFormData({ ...formData, data_contato: e.target.value })}
          />
        </div>
      </div>

      <div>
        <Label className="text-sm font-medium text-gray-700 mb-3 block">
          O interessado participa dos encontros e eventos realizados pela igreja?
          <span className="text-xs text-gray-500 block mt-1">
            ("Não deixemos de congregar-nos, como é costume de alguns..." - Hebreus 10:25)
          </span>
        </Label>
        <Select 
          value={formData.frequenta_cultos?.toString()} 
          onValueChange={(value) => setFormData({ ...formData, frequenta_cultos: value })}
        >
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
      </div>

      <div>
        <Label htmlFor="edit_estudo_biblico" className="text-sm font-medium text-gray-700 mb-2 block">
          Qual estudo bíblico este amigo está recebendo?
        </Label>
        <Input
          id="edit_estudo_biblico"
          value={formData.estudo_biblico}
          onChange={(e) => setFormData({ ...formData, estudo_biblico: e.target.value })}
          placeholder="Ex: Estudo sobre a Criação, O Grande Conflito, etc."
        />
      </div>

      <div>
        <Label htmlFor="edit_observacoes" className="text-sm font-medium text-gray-700 mb-2 block">
          Observações
        </Label>
        <Textarea
          id="edit_observacoes"
          value={formData.observacoes}
          onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
          placeholder="Observações sobre o interessado..."
          rows={3}
        />
      </div>

      <div className="flex gap-2 pt-4">
        <Button
          type="submit"
          className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
        >
          Salvar Alterações
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="flex-1"
        >
          Cancelar
        </Button>
      </div>
    </form>
  );
}
