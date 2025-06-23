
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Mail, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

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
      const { data: usuario, error: userError } = await supabase
        .from('usuarios')
        .select('id, nome_completo, email_pessoal')
        .eq('email_pessoal', email)
        .maybeSingle();

      if (userError) {
        console.error('Erro ao buscar usuário:', userError);
        toast({
          title: "Erro",
          description: "Erro ao processar solicitação. Tente novamente.",
          variant: "destructive"
        });
        return;
      }

      if (!usuario) {
        toast({
          title: "E-mail não encontrado",
          description: "Não encontramos nenhuma conta com este e-mail.",
          variant: "destructive"
        });
        return;
      }

      // Gerar código de 6 dígitos
      const codigoRecuperacao = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Salvar código no banco (válido por 30 minutos)
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 30);

      const { error: insertError } = await supabase
        .from('codigos_recuperacao')
        .insert({
          usuario_id: usuario.id,
          codigo: codigoRecuperacao,
          email_pessoal: email,
          expires_at: expiresAt.toISOString()
        });

      if (insertError) {
        console.error('Erro ao salvar código:', insertError);
        toast({
          title: "Erro",
          description: "Erro ao gerar código de recuperação. Tente novamente.",
          variant: "destructive"
        });
        return;
      }

      // TODO: Aqui você implementará o envio de e-mail com o código
      console.log(`Código de recuperação para ${email}: ${codigoRecuperacao}`);
      
      toast({
        title: "Código enviado!",
        description: `Um código de recuperação foi enviado para ${email}`,
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
      // Verificar se o código é válido e não expirou
      const { data: codigoData, error: codigoError } = await supabase
        .from('codigos_recuperacao')
        .select('*')
        .eq('codigo', codigo)
        .eq('email_pessoal', email)
        .eq('usado', false)
        .gt('expires_at', new Date().toISOString())
        .maybeSingle();

      if (codigoError) {
        console.error('Erro ao verificar código:', codigoError);
        toast({
          title: "Erro",
          description: "Erro ao verificar código. Tente novamente.",
          variant: "destructive"
        });
        return;
      }

      if (!codigoData) {
        toast({
          title: "Código inválido",
          description: "Código inválido ou expirado. Solicite um novo código.",
          variant: "destructive"
        });
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
      // Buscar o código válido
      const { data: codigoData, error: codigoError } = await supabase
        .from('codigos_recuperacao')
        .select('usuario_id')
        .eq('codigo', codigo)
        .eq('email_pessoal', email)
        .eq('usado', false)
        .gt('expires_at', new Date().toISOString())
        .maybeSingle();

      if (codigoError || !codigoData) {
        toast({
          title: "Erro",
          description: "Sessão expirada. Inicie o processo novamente.",
          variant: "destructive"
        });
        setStep('email');
        return;
      }

      // Hash da nova senha
      const bcrypt = await import('bcryptjs');
      const hashedPassword = await bcrypt.hash(novaSenha, 12);

      // Atualizar senha do usuário
      const { error: updateError } = await supabase
        .from('usuarios')
        .update({ senha: hashedPassword })
        .eq('id', codigoData.usuario_id);

      if (updateError) {
        console.error('Erro ao atualizar senha:', updateError);
        toast({
          title: "Erro",
          description: "Erro ao atualizar senha. Tente novamente.",
          variant: "destructive"
        });
        return;
      }

      // Marcar código como usado
      await supabase
        .from('codigos_recuperacao')
        .update({ usado: true })
        .eq('codigo', codigo)
        .eq('email_pessoal', email);

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
