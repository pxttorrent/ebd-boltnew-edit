import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera, Upload, X, Shield, User } from 'lucide-react';
import { Usuario, IgrejaOptions } from '../types';
import { capitalizeWords } from '../utils/textUtils';
import { useToast } from '@/hooks/use-toast';
import { hashPassword } from '../utils/passwordUtils';

interface EditarMissionarioProps {
  usuario: Usuario;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, usuario: Partial<Usuario>) => void;
}

const EditarMissionario = ({ usuario, isOpen, onClose, onSave }: EditarMissionarioProps) => {
  const [formData, setFormData] = useState({
    nome_completo: usuario.nome_completo,
    apelido: usuario.apelido,
    senha: '',
    email_pessoal: usuario.email_pessoal || '',
    igreja: usuario.igreja,
    tipo: usuario.tipo,
    foto_perfil: usuario.foto_perfil || ''
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const { toast } = useToast();

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
    
    if (!formData.nome_completo || !formData.apelido || !formData.igreja || !formData.tipo) {
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

    const login_acesso = `${formData.apelido}@escola-biblica.app`;
    
    let updateData: any = {
      nome_completo: formData.nome_completo,
      apelido: formData.apelido,
      login_acesso,
      email_pessoal: formData.email_pessoal,
      igreja: formData.igreja,
      tipo: formData.tipo,
      foto_perfil: formData.foto_perfil
    };

    // Only hash and update password if a new one was provided
    if (formData.senha.trim()) {
      try {
        const hashedPassword = await hashPassword(formData.senha);
        updateData.senha = hashedPassword;
      } catch (error) {
        toast({
          title: "Erro",
          description: "Erro ao processar senha. Tente novamente.",
          variant: "destructive"
        });
        return;
      }
    }

    onSave(usuario.id, updateData);

    toast({
      title: "Sucesso!",
      description: "Missionário atualizado com sucesso."
    });

    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Editar Missionário</DialogTitle>
        </DialogHeader>

        {/* Container com scroll para o conteúdo do formulário */}
        <div className="flex-1 overflow-y-auto pr-2 -mr-2">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Foto de Perfil */}
            <div className="space-y-2">
              <Label>Foto de Perfil</Label>
              <div className="flex flex-col items-center gap-3">
                <Avatar className="w-20 h-20">
                  <AvatarImage src={formData.foto_perfil} />
                  <AvatarFallback className="text-lg">
                    {formData.nome_completo.split(' ').map(n => n[0]).join('').toUpperCase()}
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
                  <div className="flex gap-2">
                    <Button 
                      type="button" 
                      onClick={() => fileInputRef.current?.click()} 
                      variant="outline" 
                      size="sm"
                    >
                      <Upload className="w-4 h-4 mr-1" />
                      Upload
                    </Button>
                    <Button type="button" onClick={startCamera} variant="outline" size="sm">
                      <Camera className="w-4 h-4 mr-1" />
                      Câmera
                    </Button>
                    {formData.foto_perfil && (
                      <Button type="button" onClick={removeFoto} variant="outline" size="sm">
                        <X className="w-4 h-4" />
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
              <Label htmlFor="nome_completo">Nome Completo *</Label>
              <Input
                id="nome_completo"
                value={formData.nome_completo}
                onChange={handleNomeChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="apelido">Apelido *</Label>
              <Input
                id="apelido"
                value={formData.apelido}
                onChange={(e) => setFormData(prev => ({ ...prev, apelido: e.target.value.toLowerCase() }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email_pessoal">E-mail Pessoal</Label>
              <Input
                id="email_pessoal"
                type="email"
                value={formData.email_pessoal}
                onChange={(e) => setFormData(prev => ({ ...prev, email_pessoal: e.target.value }))}
                placeholder="seu.email@exemplo.com"
              />
              <p className="text-xs text-gray-500">
                Este e-mail será usado para recuperação de senha
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="senha">Nova Senha (deixe em branco para manter atual)</Label>
              <Input
                id="senha"
                type="password"
                placeholder="Digite nova senha ou deixe em branco"
                value={formData.senha}
                onChange={(e) => setFormData(prev => ({ ...prev, senha: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo de Usuário *</Label>
              <Select value={formData.tipo} onValueChange={(value) => setFormData(prev => ({ ...prev, tipo: value as Usuario['tipo'] }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="missionario">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Missionário
                    </div>
                  </SelectItem>
                  <SelectItem value="administrador">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      Administrador
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="igreja">Igreja *</Label>
              <Select value={formData.igreja} onValueChange={(value) => setFormData(prev => ({ ...prev, igreja: value as Usuario['igreja'] }))}>
                <SelectTrigger>
                  <SelectValue />
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
          </form>
        </div>

        {/* Botões fixos na parte inferior */}
        <div className="flex gap-2 pt-4 border-t flex-shrink-0">
          <Button type="submit" className="flex-1" onClick={handleSubmit}>
            Salvar Alterações
          </Button>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditarMissionario;