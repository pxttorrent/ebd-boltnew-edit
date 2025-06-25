import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Camera, Upload, X, Eye, EyeOff, UserCog, Shield, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { capitalizeWords } from '../utils/textUtils';
import { hashPassword } from '../utils/passwordUtils';

export default function MeuCadastro() {
  const { currentUser, updateUsuario, igrejas } = useApp();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    nome_completo: currentUser?.nome_completo || '',
    apelido: currentUser?.apelido || '',
    email_pessoal: currentUser?.email_pessoal || '',
    igreja: currentUser?.igreja || '',
    foto_perfil: currentUser?.foto_perfil || '',
    senha: '',
    confirmarSenha: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [loading, setLoading] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Obter igrejas ativas para o select
  const igrejasAtivas = igrejas.filter(igreja => igreja.ativa);

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white p-6 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 text-lg">Usuário não encontrado.</p>
        </div>
      </div>
    );
  }

  const handleNomeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const capitalizedName = capitalizeWords(e.target.value);
    setFormData(prev => ({ ...prev, nome_completo: capitalizedName }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        toast({
          title: "Erro",
          description: "A foto deve ter no máximo 2MB.",
          variant: "destructive"
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData(prev => ({ ...prev, foto_perfil: event.target?.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 300, height: 300 } 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setIsCapturing(true);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível acessar a câmera.",
        variant: "destructive"
      });
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const photoData = canvas.toDataURL('image/jpeg', 0.8);
        setFormData(prev => ({ ...prev, foto_perfil: photoData }));
        stopCamera();
      }
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCapturing(false);
  };

  const removeFoto = () => {
    setFormData(prev => ({ ...prev, foto_perfil: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome_completo || !formData.apelido || !formData.igreja) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    // Validação de e-mail se preenchido
    if (formData.email_pessoal) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email_pessoal)) {
        toast({
          title: "Erro",
          description: "Por favor, insira um e-mail válido.",
          variant: "destructive"
        });
        return;
      }
    }

    // Validação de senha se preenchida
    if (formData.senha) {
      if (formData.senha.length < 6) {
        toast({
          title: "Erro",
          description: "A senha deve ter pelo menos 6 caracteres.",
          variant: "destructive"
        });
        return;
      }

      if (formData.senha !== formData.confirmarSenha) {
        toast({
          title: "Erro",
          description: "As senhas não coincidem.",
          variant: "destructive"
        });
        return;
      }
    }

    setLoading(true);

    try {
      const login_acesso = `${formData.apelido}@escola-biblica.app`;
      
      let updateData: any = {
        nome_completo: formData.nome_completo,
        apelido: formData.apelido,
        login_acesso,
        email_pessoal: formData.email_pessoal,
        igreja: formData.igreja,
        foto_perfil: formData.foto_perfil
      };

      // Only hash and update password if a new one was provided
      if (formData.senha.trim()) {
        const hashedPassword = await hashPassword(formData.senha);
        updateData.senha = hashedPassword;
      }

      await updateUsuario(currentUser.id, updateData);

      toast({
        title: "Sucesso!",
        description: "Seu cadastro foi atualizado com sucesso."
      });

      // Limpar campos de senha
      setFormData(prev => ({ ...prev, senha: '', confirmarSenha: '' }));

    } catch (error: any) {
      console.error('Erro ao atualizar cadastro:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar cadastro. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white p-6">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <UserCog className="w-6 h-6 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Meu Cadastro</h1>
                <p className="text-gray-600">Gerencie suas informações pessoais</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* User Info Card */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {currentUser.tipo === 'administrador' ? (
                    <Shield className="w-5 h-5 text-purple-600" />
                  ) : (
                    <User className="w-5 h-5 text-blue-600" />
                  )}
                  Informações da Conta
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Tipo de Usuário:</p>
                    <p className="font-medium capitalize">{currentUser.tipo}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Login de Acesso:</p>
                    <p className="font-medium">{currentUser.login_acesso}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Status:</p>
                    <p className="font-medium text-green-600">Aprovado</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Membro desde:</p>
                    <p className="font-medium">
                      {currentUser.created_at ? new Date(currentUser.created_at).toLocaleDateString('pt-BR') : 'N/A'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Edit Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Foto de Perfil */}
              <div className="space-y-3">
                <Label className="text-base font-semibold text-gray-700">Foto de Perfil</Label>
                <div className="flex flex-col items-center gap-4">
                  <Avatar className="w-24 h-24 border-2 border-gray-200">
                    <AvatarImage src={formData.foto_perfil} />
                    <AvatarFallback className="text-lg bg-gray-100">
                      {formData.nome_completo ? formData.nome_completo.split(' ').map(n => n[0]).join('').toUpperCase() : 'Foto'}
                    </AvatarFallback>
                  </Avatar>

                  {isCapturing ? (
                    <div className="space-y-2">
                      <video ref={videoRef} autoPlay className="w-48 h-36 border rounded" />
                      <canvas ref={canvasRef} className="hidden" />
                      <div className="flex gap-2">
                        <Button type="button" onClick={capturePhoto} size="sm">
                          Capturar
                        </Button>
                        <Button type="button" onClick={stopCamera} variant="outline" size="sm">
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2 justify-center">
                      <Button 
                        type="button" 
                        onClick={() => fileInputRef.current?.click()} 
                        variant="outline" 
                        size="sm"
                        className="flex items-center gap-2"
                        disabled={loading}
                      >
                        <Upload className="w-4 h-4" />
                        Escolher Foto
                      </Button>
                      <Button 
                        type="button" 
                        onClick={startCamera} 
                        variant="outline" 
                        size="sm"
                        className="flex items-center gap-2"
                        disabled={loading}
                      >
                        <Camera className="w-4 h-4" />
                        Câmera
                      </Button>
                      {formData.foto_perfil && (
                        <Button 
                          type="button" 
                          onClick={removeFoto} 
                          variant="outline" 
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                          disabled={loading}
                        >
                          <X className="w-4 h-4" />
                          Remover
                        </Button>
                      )}
                    </div>
                  )}

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Informações Básicas */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nome_completo" className="text-sm font-medium text-gray-700 mb-2 block">
                    Nome Completo *
                  </Label>
                  <Input
                    id="nome_completo"
                    value={formData.nome_completo}
                    onChange={handleNomeChange}
                    placeholder="Digite seu nome completo"
                    required
                    disabled={loading}
                  />
                </div>

                <div>
                  <Label htmlFor="apelido" className="text-sm font-medium text-gray-700 mb-2 block">
                    Apelido *
                  </Label>
                  <Input
                    id="apelido"
                    value={formData.apelido}
                    onChange={(e) => setFormData(prev => ({ ...prev, apelido: e.target.value.toLowerCase() }))}
                    placeholder="Ex: joao.silva"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email_pessoal" className="text-sm font-medium text-gray-700 mb-2 block">
                    E-mail Pessoal
                  </Label>
                  <Input
                    id="email_pessoal"
                    type="email"
                    value={formData.email_pessoal}
                    onChange={(e) => setFormData(prev => ({ ...prev, email_pessoal: e.target.value }))}
                    placeholder="seu.email@exemplo.com"
                    disabled={loading}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Este e-mail será usado para recuperação de senha
                  </p>
                </div>

                <div>
                  <Label htmlFor="igreja" className="text-sm font-medium text-gray-700 mb-2 block">
                    Igreja *
                  </Label>
                  <Select 
                    value={formData.igreja} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, igreja: value }))}
                    disabled={loading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione sua igreja" />
                    </SelectTrigger>
                    <SelectContent>
                      {igrejasAtivas.map((igreja) => (
                        <SelectItem key={igreja.id} value={igreja.nome}>
                          {igreja.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Alterar Senha */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Alterar Senha</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Deixe os campos em branco se não quiser alterar sua senha atual.
                </p>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="senha" className="text-sm font-medium text-gray-700 mb-2 block">
                      Nova Senha
                    </Label>
                    <div className="relative">
                      <Input
                        id="senha"
                        type={showPassword ? 'text' : 'password'}
                        value={formData.senha}
                        onChange={(e) => setFormData(prev => ({ ...prev, senha: e.target.value }))}
                        placeholder="Mínimo 6 caracteres"
                        disabled={loading}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={loading}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="confirmarSenha" className="text-sm font-medium text-gray-700 mb-2 block">
                      Confirmar Nova Senha
                    </Label>
                    <div className="relative">
                      <Input
                        id="confirmarSenha"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={formData.confirmarSenha}
                        onChange={(e) => setFormData(prev => ({ ...prev, confirmarSenha: e.target.value }))}
                        placeholder="Digite a senha novamente"
                        disabled={loading}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        disabled={loading}
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Botão de Salvar */}
              <div className="flex justify-end pt-6 border-t border-gray-200">
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-8"
                  disabled={loading}
                >
                  {loading ? 'Salvando...' : 'Salvar Alterações'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}