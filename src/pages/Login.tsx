import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useApp } from '../context/AppContext';
import { signInWithSupabase, signUpWithSupabase, ensureInitialChurches } from '../services/supabaseService';
import { supabase } from '@/lib/supabase';
import { BookOpen, User, Shield, Eye, EyeOff, AlertCircle, RefreshCw } from 'lucide-react';
import { capitalizeWords } from '../utils/textUtils';
import { Igreja } from '../types';

export default function Login() {
  const navigate = useNavigate();
  const { setCurrentUser } = useApp();
  const { toast } = useToast();

  // Estado para igrejas
  const [igrejas, setIgrejas] = useState<Igreja[]>([]);
  const [loadingIgrejas, setLoadingIgrejas] = useState(true);
  const [errorIgrejas, setErrorIgrejas] = useState<string | null>(null);

  // Login state
  const [loginData, setLoginData] = useState({
    apelido: '',
    senha: ''
  });
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Signup state
  const [signupData, setSignupData] = useState({
    nome_completo: '',
    apelido: '',
    senha: '',
    confirmarSenha: '',
    igreja: '',
    tipo: 'missionario' as 'administrador' | 'missionario'
  });
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSigningUp, setIsSigningUp] = useState(false);

  // Carregar igrejas ao montar o componente
  useEffect(() => {
    loadIgrejas();
  }, []);

  const loadIgrejas = async () => {
    try {
      console.log('🏛️ Iniciando carregamento de igrejas...');
      setLoadingIgrejas(true);
      setErrorIgrejas(null);

      // Primeiro, garantir que as igrejas iniciais existam
      console.log('🔧 Garantindo que igrejas iniciais existam...');
      await ensureInitialChurches();

      // Fazer consulta direta ao Supabase
      const { data: igrejasData, error } = await supabase
        .from('igrejas')
        .select('*')
        .order('nome');

      console.log('📊 Resultado da consulta de igrejas:', {
        data: igrejasData,
        error: error,
        count: igrejasData?.length || 0
      });

      if (error) {
        console.error('❌ Erro na consulta de igrejas:', error);
        setErrorIgrejas(`Erro ao carregar igrejas: ${error.message}`);
        toast({
          title: "Erro",
          description: `Erro ao carregar igrejas: ${error.message}`,
          variant: "destructive"
        });
        return;
      }

      if (!igrejasData || igrejasData.length === 0) {
        console.warn('⚠️ Nenhuma igreja encontrada no banco de dados');
        setErrorIgrejas('Nenhuma igreja encontrada. Tentando criar igrejas iniciais...');
        
        // Tentar inserir igrejas manualmente
        console.log('🔧 Tentando inserir igrejas manualmente...');
        const igrejasIniciais = [
          'Armour',
          'Dom Pedrito', 
          'Quaraí',
          'Santana do Livramento',
          'Argeni',
          'Parque São José'
        ];

        const { data: insertedChurches, error: insertError } = await supabase
          .from('igrejas')
          .insert(
            igrejasIniciais.map(nome => ({
              nome,
              ativa: true
            }))
          )
          .select();

        if (insertError) {
          console.error('❌ Erro ao inserir igrejas:', insertError);
          setErrorIgrejas(`Erro ao criar igrejas: ${insertError.message}`);
          return;
        }

        console.log('✅ Igrejas inseridas manualmente:', insertedChurches);
        
        // Recarregar após inserção
        const { data: reloadedChurches } = await supabase
          .from('igrejas')
          .select('*')
          .order('nome');
        
        if (reloadedChurches && reloadedChurches.length > 0) {
          const igrejasFormatadas: Igreja[] = reloadedChurches.map(igreja => ({
            id: igreja.id,
            nome: igreja.nome,
            ativa: igreja.ativa,
            created_at: igreja.created_at,
            updated_at: igreja.updated_at
          }));
          
          setIgrejas(igrejasFormatadas);
          setErrorIgrejas(null);
          
          toast({
            title: "Sucesso!",
            description: "Igrejas criadas e carregadas com sucesso."
          });
        }
        
        return;
      }

      // Converter para o tipo Igreja
      const igrejasFormatadas: Igreja[] = igrejasData.map(igreja => ({
        id: igreja.id,
        nome: igreja.nome,
        ativa: igreja.ativa,
        created_at: igreja.created_at,
        updated_at: igreja.updated_at
      }));

      console.log('✅ Igrejas formatadas:', igrejasFormatadas);
      console.log('🏛️ Igrejas ativas:', igrejasFormatadas.filter(i => i.ativa));

      setIgrejas(igrejasFormatadas);

      // Verificar se há igrejas ativas
      const igrejasAtivas = igrejasFormatadas.filter(igreja => igreja.ativa);
      if (igrejasAtivas.length === 0) {
        console.warn('⚠️ Nenhuma igreja ativa encontrada');
        setErrorIgrejas('Nenhuma igreja está ativa no momento');
      }

    } catch (error: any) {
      console.error('💥 Erro inesperado ao carregar igrejas:', error);
      setErrorIgrejas(`Erro inesperado: ${error.message}`);
      toast({
        title: "Erro",
        description: "Erro inesperado ao carregar igrejas. Tente recarregar a página.",
        variant: "destructive"
      });
    } finally {
      setLoadingIgrejas(false);
    }
  };

  // Obter igrejas ativas para o select
  const igrejasAtivas = igrejas.filter(igreja => igreja.ativa);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!loginData.apelido || !loginData.senha) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive"
      });
      return;
    }

    setIsLoggingIn(true);

    try {
      const result = await signInWithSupabase(loginData.apelido, loginData.senha);
      
      if (result.error) {
        toast({
          title: "Erro no Login",
          description: result.error,
          variant: "destructive"
        });
        return;
      }

      if (result.user) {
        setCurrentUser(result.user);
        toast({
          title: "Login realizado com sucesso!",
          description: `Bem-vindo(a), ${result.user.nome_completo}!`
        });
        navigate('/');
      }
    } catch (error: any) {
      console.error('Erro no login:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado durante o login. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validações
    if (!signupData.nome_completo || !signupData.apelido || !signupData.senha || 
        !signupData.confirmarSenha || !signupData.igreja) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    if (signupData.senha !== signupData.confirmarSenha) {
      toast({
        title: "Erro",
        description: "As senhas não coincidem.",
        variant: "destructive"
      });
      return;
    }

    if (signupData.senha.length < 6) {
      toast({
        title: "Erro",
        description: "A senha deve ter pelo menos 6 caracteres.",
        variant: "destructive"
      });
      return;
    }

    // Validar apelido (apenas letras, números e pontos)
    const apelidoRegex = /^[a-z0-9.]+$/;
    if (!apelidoRegex.test(signupData.apelido)) {
      toast({
        title: "Erro",
        description: "O apelido deve conter apenas letras minúsculas, números e pontos.",
        variant: "destructive"
      });
      return;
    }

    setIsSigningUp(true);

    try {
      const login_acesso = `${signupData.apelido}@escola-biblica.app`;
      
      const result = await signUpWithSupabase({
        ...signupData,
        login_acesso,
        email_pessoal: '' // E-mail vazio por padrão
      });
      
      if (result.error) {
        toast({
          title: "Erro no Cadastro",
          description: result.error,
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Cadastro realizado com sucesso!",
        description: "Sua conta foi criada e está aguardando aprovação do administrador. Você receberá uma notificação quando for aprovada."
      });

      // Limpar formulário
      setSignupData({
        nome_completo: '',
        apelido: '',
        senha: '',
        confirmarSenha: '',
        igreja: '',
        tipo: 'missionario'
      });

    } catch (error: any) {
      console.error('Erro no cadastro:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado durante o cadastro. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsSigningUp(false);
    }
  };

  const handleNomeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const capitalizedName = capitalizeWords(e.target.value);
    setSignupData(prev => ({ ...prev, nome_completo: capitalizedName }));
  };

  const handleReloadIgrejas = () => {
    loadIgrejas();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Escola Bíblica Distrital</h1>
          <p className="text-gray-600">Sistema de Gestão de Interessados</p>
        </div>

        <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
          <CardHeader>
            <CardTitle className="text-center text-xl">Acesso ao Sistema</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Entrar</TabsTrigger>
                <TabsTrigger value="signup">Cadastrar</TabsTrigger>
              </TabsList>

              {/* Login Tab */}
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <Label htmlFor="login-apelido">Apelido</Label>
                    <Input
                      id="login-apelido"
                      type="text"
                      value={loginData.apelido}
                      onChange={(e) => setLoginData(prev => ({ ...prev, apelido: e.target.value.toLowerCase() }))}
                      placeholder="seu.apelido"
                      required
                      disabled={isLoggingIn}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Seu login será: {loginData.apelido}@escola-biblica.app
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="login-senha">Senha</Label>
                    <div className="relative">
                      <Input
                        id="login-senha"
                        type={showLoginPassword ? 'text' : 'password'}
                        value={loginData.senha}
                        onChange={(e) => setLoginData(prev => ({ ...prev, senha: e.target.value }))}
                        placeholder="Digite sua senha"
                        required
                        disabled={isLoggingIn}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                        disabled={isLoggingIn}
                      >
                        {showLoginPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                    disabled={isLoggingIn}
                  >
                    {isLoggingIn ? 'Entrando...' : 'Entrar'}
                  </Button>
                </form>
              </TabsContent>

              {/* Signup Tab */}
              <TabsContent value="signup">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div>
                    <Label htmlFor="signup-nome">Nome Completo *</Label>
                    <Input
                      id="signup-nome"
                      type="text"
                      value={signupData.nome_completo}
                      onChange={handleNomeChange}
                      placeholder="Seu nome completo"
                      required
                      disabled={isSigningUp}
                    />
                  </div>

                  <div>
                    <Label htmlFor="signup-apelido">Apelido *</Label>
                    <Input
                      id="signup-apelido"
                      type="text"
                      value={signupData.apelido}
                      onChange={(e) => setSignupData(prev => ({ ...prev, apelido: e.target.value.toLowerCase() }))}
                      placeholder="seu.apelido"
                      required
                      disabled={isSigningUp}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Seu login será: {signupData.apelido}@escola-biblica.app
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="signup-igreja">Igreja *</Label>
                    {loadingIgrejas ? (
                      <div className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                        Carregando igrejas...
                      </div>
                    ) : errorIgrejas ? (
                      <div className="space-y-2">
                        <div className="flex h-auto min-h-[40px] w-full rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm items-center text-red-700">
                          <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                          <span className="flex-1">{errorIgrejas}</span>
                        </div>
                        <Button
                          type="button"
                          onClick={handleReloadIgrejas}
                          variant="outline"
                          size="sm"
                          className="w-full flex items-center gap-2"
                          disabled={loadingIgrejas}
                        >
                          <RefreshCw className={`h-4 w-4 ${loadingIgrejas ? 'animate-spin' : ''}`} />
                          Tentar Novamente
                        </Button>
                      </div>
                    ) : (
                      <select
                        id="signup-igreja"
                        value={signupData.igreja}
                        onChange={(e) => setSignupData(prev => ({ ...prev, igreja: e.target.value }))}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        required
                        disabled={isSigningUp}
                      >
                        <option value="">Selecione sua igreja</option>
                        {igrejasAtivas.length === 0 ? (
                          <option value="" disabled>Nenhuma igreja ativa encontrada</option>
                        ) : (
                          igrejasAtivas.map((igreja) => (
                            <option key={igreja.id} value={igreja.nome}>
                              {igreja.nome}
                            </option>
                          ))
                        )}
                      </select>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="signup-tipo">Tipo de Usuário *</Label>
                    <select
                      id="signup-tipo"
                      value={signupData.tipo}
                      onChange={(e) => setSignupData(prev => ({ ...prev, tipo: e.target.value as 'administrador' | 'missionario' }))}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      required
                      disabled={isSigningUp}
                    >
                      <option value="missionario">
                        Missionário
                      </option>
                      <option value="administrador">
                        Administrador
                      </option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="signup-senha">Senha *</Label>
                    <div className="relative">
                      <Input
                        id="signup-senha"
                        type={showSignupPassword ? 'text' : 'password'}
                        value={signupData.senha}
                        onChange={(e) => setSignupData(prev => ({ ...prev, senha: e.target.value }))}
                        placeholder="Mínimo 6 caracteres"
                        required
                        disabled={isSigningUp}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowSignupPassword(!showSignupPassword)}
                        disabled={isSigningUp}
                      >
                        {showSignupPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="signup-confirmar-senha">Confirmar Senha *</Label>
                    <div className="relative">
                      <Input
                        id="signup-confirmar-senha"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={signupData.confirmarSenha}
                        onChange={(e) => setSignupData(prev => ({ ...prev, confirmarSenha: e.target.value }))}
                        placeholder="Digite a senha novamente"
                        required
                        disabled={isSigningUp}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        disabled={isSigningUp}
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                    disabled={isSigningUp || loadingIgrejas || igrejasAtivas.length === 0 || !!errorIgrejas}
                  >
                    {isSigningUp ? 'Cadastrando...' : 'Criar Conta'}
                  </Button>

                  <div className="text-xs text-gray-500 text-center">
                    Sua conta será criada e ficará pendente de aprovação pelo administrador.
                  </div>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-6 text-sm text-gray-500">
          <p>Sistema de Gestão da Escola Bíblica Distrital</p>
          <p>© 2024 - Todos os direitos reservados</p>
        </div>
      </div>
    </div>
  );
}