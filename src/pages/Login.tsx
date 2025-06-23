
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { BookOpen, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import CadastroMissionarioPublico from '../components/CadastroMissionarioPublico';

const Login = () => {
  const [loginData, setLoginData] = useState({ apelido: '', senha: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showCadastro, setShowCadastro] = useState(false);
  const [showRecuperarSenha, setShowRecuperarSenha] = useState(false);
  const [loading, setLoading] = useState(false);
  const [lembrarCredenciais, setLembrarCredenciais] = useState(false);
  const { signIn } = useAuth();
  const { toast } = useToast();

  // Carregar credenciais salvas ao inicializar
  useEffect(() => {
    const credenciaisSalvas = localStorage.getItem('escola_biblica_credenciais');
    if (credenciaisSalvas) {
      try {
        const { apelido, senha } = JSON.parse(credenciaisSalvas);
        setLoginData({ apelido, senha });
        setLembrarCredenciais(true);
      } catch (error) {
        console.error('Erro ao carregar credenciais salvas:', error);
        localStorage.removeItem('escola_biblica_credenciais');
      }
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await signIn(loginData.apelido, loginData.senha);

    if (error) {
      toast({
        title: "Erro no Login",
        description: error,
        variant: "destructive"
      });
    } else {
      // Salvar ou remover credenciais baseado na checkbox
      if (lembrarCredenciais) {
        localStorage.setItem('escola_biblica_credenciais', JSON.stringify({
          apelido: loginData.apelido,
          senha: loginData.senha
        }));
      } else {
        localStorage.removeItem('escola_biblica_credenciais');
      }

      toast({
        title: "Login realizado com sucesso!",
        description: "Bem-vindo ao sistema."
      });
    }

    setLoading(false);
  };

  const handleRecuperarSenha = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Funcionalidade em desenvolvimento",
      description: "Entre em contato com o administrador para recuperar sua senha.",
      variant: "destructive"
    });
  };

  if (showCadastro) {
    return <CadastroMissionarioPublico onVoltar={() => setShowCadastro(false)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white/80 backdrop-blur-sm shadow-xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">Escola Bíblica Distrital</CardTitle>
          <CardDescription>Faça login para acessar o sistema</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {!showRecuperarSenha ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="apelido">Usuário</Label>
                <Input
                  id="apelido"
                  type="text"
                  placeholder="Digite seu usuário"
                  value={loginData.apelido}
                  onChange={(e) => setLoginData(prev => ({ ...prev, apelido: e.target.value }))}
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="senha">Senha</Label>
                <div className="relative">
                  <Input
                    id="senha"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Digite sua senha"
                    value={loginData.senha}
                    onChange={(e) => setLoginData(prev => ({ ...prev, senha: e.target.value }))}
                    required
                    disabled={loading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="lembrar-credenciais"
                  checked={lembrarCredenciais}
                  onCheckedChange={(checked) => setLembrarCredenciais(checked as boolean)}
                  disabled={loading}
                />
                <Label 
                  htmlFor="lembrar-credenciais" 
                  className="text-sm font-normal cursor-pointer"
                >
                  Lembrar credenciais
                </Label>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={loading}
              >
                {loading ? 'Entrando...' : 'Entrar'}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleRecuperarSenha} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email-recuperacao">Email de recuperação</Label>
                <Input
                  id="email-recuperacao"
                  type="email"
                  placeholder="seu.email@exemplo.com"
                  required
                />
              </div>
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                Enviar link de recuperação
              </Button>
            </form>
          )}

          <div className="flex flex-col space-y-2 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setShowCadastro(true)}
              className="w-full"
              disabled={loading}
            >
              Cadastrar Missionário
            </Button>
            
            <Button
              variant="ghost"
              onClick={() => setShowRecuperarSenha(!showRecuperarSenha)}
              className="w-full text-sm text-gray-600"
              disabled={loading}
            >
              {showRecuperarSenha ? 'Voltar ao login' : 'Recuperar senha'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
