
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, CheckCircle, Camera, Upload, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Usuario, IgrejaOptions } from '../types';
import { capitalizeWords } from '../utils/textUtils';
import { useToast } from '@/hooks/use-toast';
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
  const { addUsuario } = useApp();
  const { toast } = useToast();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
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

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        } 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play();
      }
      setIsCapturing(true);
    } catch (error) {
      console.error('Camera error:', error);
      toast({
        title: "Erro",
        description: "Não foi possível acessar a câmera. Verifique as permissões.",
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
        setTempImageSrc(photoData);
        setCropperOpen(true);
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

  const handleCropComplete = (croppedImageUrl: string) => {
    setFormData(prev => ({ ...prev, foto_perfil: croppedImageUrl }));
    setCropperOpen(false);
    setTempImageSrc('');
  };

  const removeFoto = () => {
    setFormData(prev => ({ ...prev, foto_perfil: '' }));
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
      aprovado: false,
      foto_perfil: formData.foto_perfil,
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

                {isCapturing ? (
                  <div className="space-y-3">
                    <video ref={videoRef} autoPlay playsInline className="w-48 h-36 border rounded-lg" />
                    <canvas ref={canvasRef} className="hidden" />
                    <div className="flex gap-2 justify-center">
                      <Button type="button" onClick={capturePhoto} size="sm">
                        Capturar Foto
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
                    >
                      <Upload className="w-4 h-4" />
                      Escolher da Galeria
                    </Button>
                    <Button 
                      type="button" 
                      onClick={startCamera} 
                      variant="outline" 
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <Camera className="w-4 h-4" />
                      Tirar Foto
                    </Button>
                    {formData.foto_perfil && (
                      <Button 
                        type="button" 
                        onClick={removeFoto} 
                        variant="outline" 
                        size="sm"
                        className="text-red-600 hover:text-red-700"
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
                />
              </div>
            </div>

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
