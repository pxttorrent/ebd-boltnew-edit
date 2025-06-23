
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Usuario, IgrejaOptions } from '../types';
import { useToast } from '@/hooks/use-toast';
import { Edit, Trash, AlertCircle } from 'lucide-react';
import { capitalizeWords } from '../utils/textUtils';

export default function CadastroMissionarios() {
  const { usuarios, addUsuario, deleteUsuario } = useApp();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    nome_completo: '',
    apelido: '',
    senha: '',
    igreja: '' as Usuario['igreja'] | ''
  });

  const login_acesso = formData.apelido ? `${formData.apelido}@escola-biblica.app` : '';

  const handleNomeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const capitalizedName = capitalizeWords(e.target.value);
    setFormData({ ...formData, nome_completo: capitalizedName });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome_completo || !formData.apelido || !formData.senha || !formData.igreja) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive"
      });
      return;
    }

    // Check if apelido already exists
    if (usuarios.some(u => u.apelido === formData.apelido)) {
      toast({
        title: "Erro",
        description: "Este apelido já está em uso.",
        variant: "destructive"
      });
      return;
    }

    const novoUsuario: Usuario = {
      id: Date.now().toString(),
      nome_completo: formData.nome_completo,
      apelido: formData.apelido,
      login_acesso,
      senha: formData.senha,
      igreja: formData.igreja as Usuario['igreja'],
      aprovado: true,
      permissoes: {
        pode_cadastrar: true,
        pode_editar: true,
        pode_excluir: false,
        pode_exportar: true
      }
    };

    addUsuario(novoUsuario);
    
    toast({
      title: "Sucesso!",
      description: "Missionário cadastrado com sucesso."
    });

    // Reset form
    setFormData({
      nome_completo: '',
      apelido: '',
      senha: '',
      igreja: '' as Usuario['igreja'] | ''
    });
  };

  const handleDelete = (id: string, nome: string) => {
    if (window.confirm(`Tem certeza que deseja excluir ${nome}?`)) {
      deleteUsuario(id);
      toast({
        title: "Sucesso!",
        description: "Missionário excluído com sucesso."
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          Cadastro de Missionários
        </h1>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Form Section */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Cadastrar Novo Missionário</h2>
            
            {/* Alert Card */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-2">Instruções para o Administrador:</p>
                  <ol className="list-decimal list-inside space-y-1">
                    <li>Preencha e salve os dados no formulário abaixo</li>
                    <li>Use o "Login de Acesso" gerado para convidar o usuário através do painel de administração principal da plataforma</li>
                  </ol>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
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
                <Label htmlFor="apelido" className="text-sm font-medium text-gray-700 mb-2 block">
                  Apelido *
                </Label>
                <Input
                  id="apelido"
                  value={formData.apelido}
                  onChange={(e) => setFormData({ ...formData, apelido: e.target.value.toLowerCase().replace(/\s/g, '.') })}
                  placeholder="Ex: joao.silva"
                  required
                />
              </div>

              <div>
                <Label htmlFor="login_acesso" className="text-sm font-medium text-gray-700 mb-2 block">
                  Login de Acesso (Gerado Automaticamente)
                </Label>
                <Input
                  id="login_acesso"
                  value={login_acesso}
                  readOnly
                  className="bg-gray-50 text-gray-600"
                  placeholder="será gerado automaticamente"
                />
              </div>

              <div>
                <Label htmlFor="senha" className="text-sm font-medium text-gray-700 mb-2 block">
                  Senha *
                </Label>
                <Input
                  id="senha"
                  type="password"
                  value={formData.senha}
                  onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
                  placeholder="Digite a senha"
                  required
                />
              </div>

              <div>
                <Label htmlFor="igreja" className="text-sm font-medium text-gray-700 mb-2 block">
                  Igreja *
                </Label>
                <Select value={formData.igreja} onValueChange={(value) => setFormData({ ...formData, igreja: value as Usuario['igreja'] })}>
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

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-medium py-3 rounded-lg"
              >
                Cadastrar Missionário
              </Button>
            </form>
          </div>

          {/* Table Section */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Missionários Cadastrados</h2>
            
            {usuarios.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Nenhum missionário cadastrado ainda.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="font-semibold text-gray-700">Nome</TableHead>
                    <TableHead className="font-semibold text-gray-700">Igreja</TableHead>
                    <TableHead className="font-semibold text-gray-700">Login</TableHead>
                    <TableHead className="font-semibold text-gray-700">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usuarios.map((usuario) => (
                    <TableRow key={usuario.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">{usuario.nome_completo}</TableCell>
                      <TableCell>{usuario.igreja}</TableCell>
                      <TableCell className="text-sm text-gray-600">{usuario.login_acesso}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-red-600 hover:text-red-700"
                            onClick={() => handleDelete(usuario.id, usuario.nome_completo)}
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
    </div>
  );
}
