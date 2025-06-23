import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Usuario, IgrejaOptions } from '../types';
import { capitalizeWords } from '../utils/textUtils';

interface CadastroMissionarioPublicoProps {
  onVoltar: () => void;
}

const CadastroMissionarioPublico = ({ onVoltar }: CadastroMissionarioPublicoProps) => {
  const [formData, setFormData] = useState({
    nome_completo: '',
    apelido: '',
    senha: '',
    igreja: '' as any
  });
  const [cadastroRealizado, setCadastroRealizado] = useState(false);
  const { addUsuario } = useApp();

  const handleNomeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const capitalizedName = capitalizeWords(e.target.value);
    setFormData(prev => ({ ...prev, nome_completo: capitalizedName }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const novoUsuario: Usuario = {
      id: Date.now().toString(),
      nome_completo: formData.nome_completo,
      apelido: formData.apelido,
      login_acesso: `${formData.apelido}@escola-biblica.app`,
      senha: formData.senha,
      igreja: formData.igreja,
      aprovado: false, // Aguarda aprovação
      permissoes: {
        pode_cadastrar: false,
        pode_editar: false,
        pode_excluir: false,
        pode_exportar: false
      }
    };

    addUsuario(novoUsuario);
    setCadastroRealizado(true);
  };

  if (cadastroRealizado) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-white/80 backdrop-blur-sm shadow-xl">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle className="w-16 h-16 text-green-500" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">Cadastro Realizado!</CardTitle>
            <CardDescription className="text-center">
              Seu cadastro foi enviado com sucesso. Aguarde a aprovação do administrador para acessar o sistema.
              Você receberá uma confirmação quando sua conta for aprovada.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={onVoltar} className="w-full bg-blue-600 hover:bg-blue-700">
              Voltar ao Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white/80 backdrop-blur-sm shadow-xl">
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <Button variant="ghost" size="sm" onClick={onVoltar}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <CardTitle className="text-xl font-bold text-gray-900">Cadastrar Missionário</CardTitle>
          </div>
          <CardDescription>
            Preencha os dados para solicitar acesso ao sistema
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nome_completo">Nome Completo</Label>
              <Input
                id="nome_completo"
                value={formData.nome_completo}
                onChange={handleNomeChange}
                placeholder="Digite seu nome completo"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="apelido">Apelido de Usuário</Label>
              <Input
                id="apelido"
                value={formData.apelido}
                onChange={(e) => setFormData(prev => ({ ...prev, apelido: e.target.value }))}
                placeholder="ex: joao.silva"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="senha">Senha</Label>
              <Input
                id="senha"
                type="password"
                value={formData.senha}
                onChange={(e) => setFormData(prev => ({ ...prev, senha: e.target.value }))}
                placeholder="Digite uma senha segura"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="igreja">Igreja</Label>
              <Select value={formData.igreja} onValueChange={(value) => setFormData(prev => ({ ...prev, igreja: value as any }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione sua igreja" />
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

            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Importante:</strong> Após o cadastro, sua conta ficará pendente de aprovação pelo administrador. 
                Você será notificado quando o acesso for liberado.
              </p>
            </div>

            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
              Solicitar Cadastro
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CadastroMissionarioPublico;
