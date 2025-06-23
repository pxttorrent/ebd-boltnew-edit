
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Eye, EyeOff } from 'lucide-react';
import { useApp } from '../context/AppContext';
import CadastroMissionarioPublico from '../components/CadastroMissionarioPublico';

const Login = () => {
  const [loginData, setLoginData] = useState({ login: '', senha: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showCadastro, setShowCadastro] = useState(false);
  const [showRecuperarSenha, setShowRecuperarSenha] = useState(false);
  const [error, setError] = useState('');
  const { usuarios, setCurrentUser } = useApp();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const usuario = usuarios.find(u => 
      u.login_acesso === loginData.login && 
      u.senha === loginData.senha
    );

    if (!usuario) {
      setError('Login ou senha incorretos');
      return;
    }

    if (!usuario.aprovado) {
      setError('Sua conta ainda não foi aprovada pelo administrador. Aguarde a aprovação.');
      return;
    }

    setCurrentUser(usuario);
  };

  const handleRecuperarSenha = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Funcionalidade de recuperação de senha será implementada em breve. Entre em contato com o administrador.');
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
                <Label htmlFor="login">Usuário</Label>
                <Input
                  id="login"
                  type="text"
                  placeholder="seu.usuario@escola-biblica.app"
                  value={loginData.login}
                  onChange={(e) => setLoginData(prev => ({ ...prev, login: e.target.value }))}
                  required
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
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
              </div>

              {error && (
                <div className="text-red-600 text-sm text-center bg-red-50 p-2 rounded-lg">
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                Entrar
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
            >
              Cadastrar Missionário
            </Button>
            
            <Button
              variant="ghost"
              onClick={() => setShowRecuperarSenha(!showRecuperarSenha)}
              className="w-full text-sm text-gray-600"
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
