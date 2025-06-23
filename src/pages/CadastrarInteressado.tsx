import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Interessado, StatusLabels } from '../types';
import { useToast } from '@/hooks/use-toast';
import { capitalizeWords } from '../utils/textUtils';

export default function CadastrarInteressado() {
  const { usuarios, addInteressado } = useApp();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    nome_completo: '',
    telefone: '',
    endereco: '',
    cidade: '',
    status: '' as Interessado['status'] | '',
    instrutor_biblico: '',
    data_contato: '',
    observacoes: ''
  });

  const handleNomeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const capitalizedName = capitalizeWords(e.target.value);
    setFormData({ ...formData, nome_completo: capitalizedName });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome_completo || !formData.telefone || !formData.cidade || !formData.status || !formData.instrutor_biblico || !formData.data_contato) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    const novoInteressado: Interessado = {
      id: Date.now().toString(),
      ...formData,
      status: formData.status as Interessado['status']
    };

    addInteressado(novoInteressado);
    
    toast({
      title: "Sucesso!",
      description: "Interessado cadastrado com sucesso."
    });

    // Reset form
    setFormData({
      nome_completo: '',
      telefone: '',
      endereco: '',
      cidade: '',
      status: '' as Interessado['status'] | '',
      instrutor_biblico: '',
      data_contato: '',
      observacoes: ''
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white p-6">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">
            Cadastrar Novo Interessado
          </h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="nome_completo" className="text-sm font-medium text-gray-700 mb-2 block">
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
                <Label htmlFor="telefone" className="text-sm font-medium text-gray-700 mb-2 block">
                  Telefone *
                </Label>
                <Input
                  id="telefone"
                  value={formData.telefone}
                  onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                  placeholder="(00) 00000-0000"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="endereco" className="text-sm font-medium text-gray-700 mb-2 block">
                Endereço
              </Label>
              <Input
                id="endereco"
                value={formData.endereco}
                onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                placeholder="Rua, número, bairro"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="cidade" className="text-sm font-medium text-gray-700 mb-2 block">
                  Cidade *
                </Label>
                <Input
                  id="cidade"
                  value={formData.cidade}
                  onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                  placeholder="Digite a cidade"
                  required
                />
              </div>

              <div>
                <Label htmlFor="status" className="text-sm font-medium text-gray-700 mb-2 block">
                  Status *
                </Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value as Interessado['status'] })}>
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
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="instrutor_biblico" className="text-sm font-medium text-gray-700 mb-2 block">
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
                <Label htmlFor="data_contato" className="text-sm font-medium text-gray-700 mb-2 block">
                  Data do Contato *
                </Label>
                <Input
                  id="data_contato"
                  type="date"
                  value={formData.data_contato}
                  onChange={(e) => setFormData({ ...formData, data_contato: e.target.value })}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="observacoes" className="text-sm font-medium text-gray-700 mb-2 block">
                Observações
              </Label>
              <Textarea
                id="observacoes"
                value={formData.observacoes}
                onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                placeholder="Observações sobre o interessado..."
                rows={4}
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium py-3 rounded-lg"
            >
              Cadastrar Interessado
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
