
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Mail, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { findUsuarioByEmail, updateUsuario } from '@/services/localStorage';
import { hashPassword } from '@/utils/passwordUtils';

interface RecuperarSenhaProps {
  onVoltar: () => void;
}

const RecuperarSenha = ({ onVoltar }: RecuperarSenhaProps) => {
  const [step, setStep] = useState<'email' | 'code' | 'newPassword' | 'success'>('email');
  const [email, setEmail] = useState('');
  const [codigo, setCodigo] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [codigoGerado, setCodigoGerado] = useState('');
  const [usuarioEncontrado, setUsuarioEncontrado] = useState<any>(null);
  const { toast } = useToast();

  const handleSolicitarCodigo = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: "Erro",
        description: "Por favor, digite seu e-mail.",
        variant: "destructive"
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({
        title: "Erro",
        description: "Por favor, digite um e-mail válido.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      // Verificar se existe um usuário com este email pessoal
      const usuario = findUsuarioByEmail(email);

      if (!usuario) {
        toast({
          title: "E-mail não encontrado",
          description: "Não encontramos nenhuma conta com este e-mail.",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      // Gerar código de 6 dígitos
      const codigoRecuperacao = Math.floor(100000 + Math.random() * 900000).toString();
      setCodigoGerado(codigoRecuperacao);
      setUsuarioEncontrado(usuario);
      
      // Em um sistema real, aqui você enviaria o código por e-mail
      console.log(`Código de recuperação para ${email}: ${codigoRecuperacao}`);
      
      toast({
        title: "Código enviado!",
        description: `Um código de recuperação foi enviado para ${email}. (Código: ${codigoRecuperacao})`,
      });

      setStep('code');

    } catch (error: any) {
      console.error('Erro inesperado:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao solicitar código. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerificarCodigo = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!codigo || codigo.length !== 6) {
      toast({
        title: "Erro",
        description: "Por favor, digite o código de 6 dígitos.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      if (codigo !== codigoGerado) {
        toast({
          title: "Código inválido",
          description: "Código inválido. Verifique e tente novamente.",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      toast({
        title: "Código verificado!",
        description: "Agora você pode definir uma nova senha.",
      });

      setStep('newPassword');

    } catch (error: any) {
      console.error('Erro inesperado:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao verificar código. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAlterarSenha = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!novaSenha || !confirmarSenha) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive"
      });
      return;
    }

    if (novaSenha.length < 6) {
      toast({
        title: "Erro",
        description: "A senha deve ter pelo menos 6 caracteres.",
        variant: "destructive"
      });
      return;
    }

    if (novaSenha !== confirmarSenha) {
      toast({
        title: "Erro",
        description: "As senhas não coincidem.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      if (!usuarioEncontrado) {
        toast({
          title: "Erro",
          description: "Sessão expirada. Inicie o processo novamente.",
          variant: "destructive"
        });
        setStep('email');
        return;
      }

      // Hash da nova senha
      const hashedPassword = await hashPassword(novaSenha);

      // Atualizar senha do usuário
      updateUsuario(usuarioEncontrado.id, { senha: hashedPassword });

      setStep('success');

    } catch (error: any) {
      console.error('Erro inesperado:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao alterar senha. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white/80 backdrop-blur-sm shadow-xl">
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <Button variant="ghost" size="sm" onClick={onVoltar} disabled={loading}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <CardTitle className="text-xl font-bold text-gray-900">
              {step === 'success' ? 'Senha Alterada!' : 'Recuperar Senha'}
            </CardTitle>
          </div>
          {step !== 'success' && (
            <CardDescription>
              {step === 'email' && 'Digite seu e-mail pessoal para receber o código de recuperação'}
              {step === 'code' && 'Digite o código de 6 dígitos enviado para seu e-mail'}
              {step === 'newPassword' && 'Digite sua nova senha'}
            </CardDescription>
          )}
        </CardHeader>

        <CardContent>
          {step === 'email' && (
            <form onSubmit={handleSolicitarCodigo} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-mail Pessoal</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu.email@exemplo.com"
                  required
                  disabled={loading}
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                <Mail className="w-4 h-4 mr-2" />
                {loading ? 'Enviando...' : 'Enviar Código'}
              </Button>
            </form>
          )}

          {step === 'code' && (
            <form onSubmit={handleVerificarCodigo} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="codigo">Código de Verificação</Label>
                <Input
                  id="codigo"
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="123456"
                  maxLength={6}
                  required
                  disabled={loading}
                />
                <p className="text-xs text-gray-500">
                  Código enviado para: {email}
                </p>
                <p className="text-xs text-blue-600">
                  Código para teste: {codigoGerado}
                </p>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Verificando...' : 'Verificar Código'}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                className="w-full"
                onClick={() => setStep('email')}
                disabled={loading}
              >
                Solicitar Novo Código
              </Button>
            </form>
          )}

          {step === 'newPassword' && (
            <form onSubmit={handleAlterarSenha} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nova-senha">Nova Senha</Label>
                <Input
                  id="nova-senha"
                  type="password"
                  value={novaSenha}
                  onChange={(e) => setNovaSenha(e.target.value)}
                  placeholder="Digite a nova senha (mín. 6 caracteres)"
                  minLength={6}
                  required
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmar-senha">Confirmar Nova Senha</Label>
                <Input
                  id="confirmar-senha"
                  type="password"
                  value={confirmarSenha}
                  onChange={(e) => setConfirmarSenha(e.target.value)}
                  placeholder="Digite novamente a nova senha"
                  minLength={6}
                  required
                  disabled={loading}
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Alterando...' : 'Alterar Senha'}
              </Button>
            </form>
          )}

          {step === 'success' && (
            <div className="text-center space-y-4">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Senha alterada com sucesso!</h3>
                <p className="text-gray-600 mt-2">
                  Sua senha foi alterada. Agora você pode fazer login com a nova senha.
                </p>
              </div>
              <Button onClick={onVoltar} className="w-full">
                Voltar ao Login
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RecuperarSenha;
