
import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Usuario, IgrejaOptions } from '../types';
import { useToast } from '@/hooks/use-toast';
import { Edit, Trash, AlertCircle, Camera, Upload, X } from 'lucide-react';
import { capitalizeWords } from '../utils/textUtils';
import EditarMissionario from '../components/EditarMissionario';

export default function CadastroMissionarios() {
  const { usuarios, addUsuario, updateUsuario, deleteUsuario } = useApp();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    nome_completo: '',
    apelido: '',
    senha: '',
    igreja: '' as Usuario['igreja'] | '',
    foto_perfil: ''
  });

  const [editingUsuario, setEditingUsuario] = useState<Usuario | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const login_acesso = formData.apelido ? `${formData.apelido}@escola-biblica.app` : '';

  const handleNomeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const capitalizedName = capitalizeWords(e.target.value);
    setFormData({ ...formData, nome_completo: capitalizedName });
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome_completo || !formData.apelido || !formData.senha || !formData.igreja) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive"
      });
      return;
    }

    // Check if apelido already exists
    if (usuarios.some(u => u.apelido === formData.apelido)) {
      toast({
        title: "Erro",
        description: "Este apelido já está em uso.",
        variant: "destructive"
      });
      return;
    }

    const novoUsuario: Usuario = {
      id: Date.now().toString(),
      nome_completo: formData.nome_completo,
      apelido: formData.apelido,
      login_acesso,
      senha: formData.senha,
      igreja: formData.igreja as Usuario['igreja'],
      foto_perfil: formData.foto_perfil,
      aprovado: true,
      permissoes: {
        pode_cadastrar: true,
        pode_editar: true,
        pode_excluir: false,
        pode_exportar: true
      }
    };

    addUsuario(novoUsuario);
    
    toast({
      title: "Sucesso!",
      description: "Missionário cadastrado com sucesso."
    });

    // Reset form
    setFormData({
      nome_completo: '',
      apelido: '',
      senha: '',
      igreja: '' as Usuario['igreja'] | '',
      foto_perfil: ''
    });
  };

  const handleEdit = (usuario: Usuario) => {
    setEditingUsuario(usuario);
  };

  const handleDelete = (id: string, nome: string) => {
    if (window.confirm(`Tem certeza que deseja excluir ${nome}?`)) {
      deleteUsuario(id);
      toast({
        title: "Sucesso!",
        description: "Missionário excluído com sucesso."
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          Cadastro de Missionários
        </h1>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Form Section */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Cadastrar Novo Missionário</h2>
            
            {/* Alert Card */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-2">Instruções para o Administrador:</p>
                  <ol className="list-decimal list-inside space-y-1">
                    <li>Preencha e salve os dados no formulário abaixo</li>
                    <li>Use o "Login de Acesso" gerado para convidar o usuário através do painel de administração principal da plataforma</li>
                  </ol>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Foto de Perfil - Moved to the top and made more prominent */}
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
                      <video ref={videoRef} autoPlay className="w-48 h-36 border rounded-lg" />
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

              <div>
                <Label htmlFor="nome_completo" className="text-sm font-medium text-gray-700 mb-2 block">
                  Nome Completo *
                </Label>
                <Input
                  id="nome_completo"
                  value={formData.nome_completo}
                  onChange={handleNomeChange}
                  placeholder="Digite o nome completo"
                  required
                />
              </div>

              <div>
                <Label htmlFor="apelido" className="text-sm font-medium text-gray-700 mb-2 block">
                  Apelido *
                </Label>
                <Input
                  id="apelido"
                  value={formData.apelido}
                  onChange={(e) => setFormData({ ...formData, apelido: e.target.value.toLowerCase().replace(/\s/g, '.') })}
                  placeholder="Ex: joao.silva"
                  required
                />
              </div>

              <div>
                <Label htmlFor="login_acesso" className="text-sm font-medium text-gray-700 mb-2 block">
                  Login de Acesso (Gerado Automaticamente)
                </Label>
                <Input
                  id="login_acesso"
                  value={login_acesso}
                  readOnly
                  className="bg-gray-50 text-gray-600"
                  placeholder="será gerado automaticamente"
                />
              </div>

              <div>
                <Label htmlFor="senha" className="text-sm font-medium text-gray-700 mb-2 block">
                  Senha *
                </Label>
                <Input
                  id="senha"
                  type="password"
                  value={formData.senha}
                  onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
                  placeholder="Digite a senha"
                  required
                />
              </div>

              <div>
                <Label htmlFor="igreja" className="text-sm font-medium text-gray-700 mb-2 block">
                  Igreja *
                </Label>
                <Select value={formData.igreja} onValueChange={(value) => setFormData({ ...formData, igreja: value as Usuario['igreja'] })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a igreja" />
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

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-medium py-3 rounded-lg"
              >
                Cadastrar Missionário
              </Button>
            </form>
          </div>

          {/* Table Section */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Missionários Cadastrados</h2>
            
            {usuarios.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Nenhum missionário cadastrado ainda.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="font-semibold text-gray-700">Foto</TableHead>
                    <TableHead className="font-semibold text-gray-700">Nome</TableHead>
                    <TableHead className="font-semibold text-gray-700">Igreja</TableHead>
                    <TableHead className="font-semibold text-gray-700">Login</TableHead>
                    <TableHead className="font-semibold text-gray-700">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usuarios.map((usuario) => (
                    <TableRow key={usuario.id} className="hover:bg-gray-50">
                      <TableCell>
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={usuario.foto_perfil} />
                          <AvatarFallback className="text-xs">
                            {usuario.nome_completo.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </TableCell>
                      <TableCell className="font-medium">{usuario.nome_completo}</TableCell>
                      <TableCell>{usuario.igreja}</TableCell>
                      <TableCell className="text-sm text-gray-600">{usuario.login_acesso}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-blue-600 hover:text-blue-700"
                            onClick={() => handleEdit(usuario)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-red-600 hover:text-red-700"
                            onClick={() => handleDelete(usuario.id, usuario.nome_completo)}
                          >
                            <Trash className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </div>

        {editingUsuario && (
          <EditarMissionario
            usuario={editingUsuario}
            isOpen={!!editingUsuario}
            onClose={() => setEditingUsuario(null)}
            onSave={updateUsuario}
          />
        )}
      </div>
    </div>
  );
}
