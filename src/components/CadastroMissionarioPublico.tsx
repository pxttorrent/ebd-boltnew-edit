import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, CheckCircle, Upload, X } from 'lucide-react';
import { IgrejaOptions } from '../types';
import { capitalizeWords } from '../utils/textUtils';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '../hooks/useAuth';
import FotoCropper from './FotoCropper';

interface CadastroMissionarioPublicoProps {
  onVoltar: () => void;
}

const CadastroMissionarioPublico = ({ onVoltar }: CadastroMissionarioPublicoProps) => {
  const [formData, setFormData] = useState({
    nome_completo: '',
    apelido: '',
    senha: '',
    igreja: '' as any,
    foto_perfil: ''
  });
  const [cadastroRealizado, setCadastroRealizado] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const { toast } = useToast();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [cropperOpen, setCropperOpen] = useState(false);
  const [tempImageSrc, setTempImageSrc] = useState('');

  const handleNomeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const capitalizedName = capitalizeWords(e.target.value);
    setFormData(prev => ({ ...prev, nome_completo: capitalizedName }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: "Erro",
          description: "A foto deve ter no máximo 5MB.",
          variant: "destructive"
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const imageSrc = event.target?.result as string;
        setTempImageSrc(imageSrc);
        setCropperOpen(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropComplete = (croppedImageUrl: string) => {
    setFormData(prev => ({ ...prev, foto_perfil: croppedImageUrl }));
    setCropperOpen(false);
    setTempImageSrc('');
  };

  const removeFoto = () => {
    setFormData(prev => ({ ...prev, foto_perfil: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome_completo || !formData.apelido || !formData.senha || !formData.igreja) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      console.log('Submitting form data:', formData);
      
      const userData = {
        nome_completo: formData.nome_completo,
        apelido: formData.apelido,
        login_acesso: `${formData.apelido}@escola-biblica.app`,
        senha: formData.senha,
        igreja: formData.igreja,
        foto_perfil: formData.foto_perfil
      };

      console.log('Calling signUp with userData:', userData);
      const { error } = await signUp(userData);

      if (error) {
        console.error('SignUp error:', error);
        toast({
          title: "Erro no Cadastro",
          description: error,
          variant: "destructive"
        });
        return;
      }

      console.log('Signup successful');
      setCadastroRealizado(true);
      toast({
        title: "Cadastro realizado!",
        description: "Sua solicitação foi enviada para aprovação."
      });

    } catch (error: any) {
      console.error('Unexpected error during signup:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao realizar cadastro. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
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
            <Button variant="ghost" size="sm" onClick={onVoltar} disabled={loading}>
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
            {/* Foto de Perfil */}
            <div className="space-y-3 border-b border-gray-200 pb-4">
              <Label className="text-base font-semibold text-gray-700">Foto de Perfil (Opcional)</Label>
              <div className="flex flex-col items-center gap-4">
                <Avatar className="w-24 h-24 border-2 border-gray-200">
                  <AvatarImage src={formData.foto_perfil} />
                  <AvatarFallback className="text-lg bg-gray-100">
                    {formData.nome_completo ? formData.nome_completo.split(' ').map(n => n[0]).join('').toUpperCase() : 'Foto'}
                  </AvatarFallback>
                </Avatar>

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
                    Escolher da Galeria
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

            <div className="space-y-2">
              <Label htmlFor="nome_completo">Nome Completo *</Label>
              <Input
                id="nome_completo"
                value={formData.nome_completo}
                onChange={handleNomeChange}
                placeholder="Digite seu nome completo"
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="apelido">Apelido de Usuário *</Label>
              <Input
                id="apelido"
                value={formData.apelido}
                onChange={(e) => setFormData(prev => ({ ...prev, apelido: e.target.value.toLowerCase() }))}
                placeholder="ex: joao.silva"
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="senha">Senha *</Label>
              <Input
                id="senha"
                type="password"
                value={formData.senha}
                onChange={(e) => setFormData(prev => ({ ...prev, senha: e.target.value }))}
                placeholder="Digite uma senha segura"
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="igreja">Igreja *</Label>
              <Select 
                value={formData.igreja} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, igreja: value as any }))}
                disabled={loading}
              >
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
                Você será notificado quando sua conta for aprovada.
              </p>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={loading}
            >
              {loading ? 'Enviando...' : 'Solicitar Cadastro'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <FotoCropper
        isOpen={cropperOpen}
        onClose={() => {
          setCropperOpen(false);
          setTempImageSrc('');
        }}
        imageSrc={tempImageSrc}
        onCropComplete={handleCropComplete}
      />
    </div>
  );
};

export default CadastroMissionarioPublico;
