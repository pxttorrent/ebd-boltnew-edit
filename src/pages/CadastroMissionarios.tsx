import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Usuario, IgrejaOptions } from '../types';
import { useToast } from '@/hooks/use-toast';
import { Edit, Trash, AlertCircle, Upload, X, Shield, User, Lock } from 'lucide-react';
import { capitalizeWords } from '../utils/textUtils';
import { hashPassword } from '../utils/passwordUtils';
import { addUsuario } from '../services/localStorage';
import EditarMissionario from '../components/EditarMissionario';
import FotoCropper from '../components/FotoCropper';

export default function CadastroMissionarios() {
  const { usuarios, currentUser, updateUsuario, deleteUsuario, refreshData } = useApp();
  const { toast } = useToast();
  
  // Verificar se o usuário atual é administrador
  const isAdmin = currentUser?.tipo === 'administrador';

  // Se não for administrador, mostrar mensagem de acesso negado
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white p-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-8 text-center">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <Lock className="w-8 h-8 text-red-600" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Acesso Restrito
            </h1>
            <p className="text-gray-600 mb-6">
              Esta página é restrita apenas para administradores. Apenas administradores podem cadastrar e gerenciar usuários do sistema.
            </p>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                <div className="text-sm text-red-800">
                  <p className="font-medium mb-1">Permissões necessárias:</p>
                  <p>• Tipo de usuário: Administrador</p>
                  <p>• Acesso atual: {currentUser?.tipo === 'administrador' ? 'Administrador' : currentUser?.tipo === 'missionario' ? 'Missionário' : 'Usuário'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const [formData, setFormData] = useState({
    nome_completo: '',
    apelido: '',
    senha: '',
    email_pessoal: '',
    igreja: '' as Usuario['igreja'] | '',
    tipo: 'missionario' as Usuario['tipo'],
    foto_perfil: ''
  });

  const [editingUsuario, setEditingUsuario] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [cropperOpen, setCropperOpen] = useState(false);
  const [tempImageSrc, setTempImageSrc] = useState('');

  const login_acesso = formData.apelido ? `${formData.apelido}@escola-biblica.app` : '';

  const handleNomeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const capitalizedName = capitalizeWords(e.target.value);
    setFormData({ ...formData, nome_completo: capitalizedName });
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
    
    if (!formData.nome_completo || !formData.apelido || !formData.senha || !formData.email_pessoal || !formData.igreja || !formData.tipo) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    // Validação de e-mail
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email_pessoal)) {
      toast({
        title: "Erro",
        description: "Por favor, insira um e-mail válido.",
        variant: "destructive"
      });
      return;
    }

    // Check if apelido already exists
    if (usuarios.some(u => u.apelido === formData.apelido)) {
      toast({
        title: "Erro",
        description: "Este apelido já está em uso. Escolha outro apelido.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      console.log('Iniciando cadastro de missionário...', { apelido: formData.apelido, igreja: formData.igreja, tipo: formData.tipo });
      
      // Hash password before storing
      const hashedPassword = await hashPassword(formData.senha);
      console.log('Senha hasheada com sucesso');
      
      // Create new user
      const usuario = addUsuario({
        nome_completo: formData.nome_completo,
        apelido: formData.apelido,
        login_acesso,
        senha: hashedPassword,
        email_pessoal: formData.email_pessoal,
        igreja: formData.igreja,
        tipo: formData.tipo,
        foto_perfil: formData.foto_perfil || null,
        aprovado: true, // Admin is creating, so auto-approve
        permissoes: {
          pode_cadastrar: true,
          pode_editar: true,
          pode_excluir: formData.tipo === 'administrador', // Only admins can delete by default
          pode_exportar: true
        }
      });

      console.log('Usuário criado com sucesso:', usuario);

      // Refresh data to update the UI
      await refreshData();
      
      toast({
        title: "Sucesso!",
        description: `${formData.tipo === 'administrador' ? 'Administrador' : 'Missionário'} ${formData.nome_completo} cadastrado com sucesso.`
      });

      // Reset form
      setFormData({
        nome_completo: '',
        apelido: '',
        senha: '',
        email_pessoal: '',
        igreja: '' as Usuario['igreja'] | '',
        tipo: 'missionario' as Usuario['tipo'],
        foto_perfil: ''
      });

    } catch (error: any) {
      console.error('Erro durante o cadastro:', error);
      toast({
        title: "Erro no Cadastro",
        description: error.message || "Erro inesperado ao cadastrar usuário. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (usuario: Usuario) => {
    setEditingUsuario(usuario);
  };

  const handleDelete = (id: string, nome: string) => {
    if (window.confirm(`Tem certeza que deseja excluir ${nome}?`)) {
      deleteUsuario(id);
      toast({
        title: "Sucesso!",
        description: "Usuário excluído com sucesso."
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          Cadastro de Usuários
        </h1>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Form Section */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Cadastrar Novo Usuário</h2>
            
            {/* Alert Card */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-2">Instruções para o Administrador:</p>
                  <ol className="list-decimal list-inside space-y-1">
                    <li>Preencha e salve os dados no formulário abaixo</li>
                    <li>O usuário será cadastrado e aprovado automaticamente</li>
                    <li>Use o "Login de Acesso" gerado para informar ao usuário suas credenciais</li>
                  </ol>
                </div>
              </div>
            </div>

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
                  onChange={(e) => setFormData({ ...formData, apelido: e.target.value.toLowerCase() })}
                  placeholder="Ex: joao.silva"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <Label htmlFor="email_pessoal" className="text-sm font-medium text-gray-700 mb-2 block">
                  E-mail Pessoal *
                </Label>
                <Input
                  id="email_pessoal"
                  type="email"
                  value={formData.email_pessoal}
                  onChange={(e) => setFormData({ ...formData, email_pessoal: e.target.value })}
                  placeholder="seu.email@exemplo.com"
                  required
                  disabled={loading}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Este e-mail será usado para recuperação de senha
                </p>
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
                  disabled={loading}
                />
              </div>

              <div>
                <Label htmlFor="tipo" className="text-sm font-medium text-gray-700 mb-2 block">
                  Tipo de Usuário *
                </Label>
                <Select 
                  value={formData.tipo} 
                  onValueChange={(value) => setFormData({ ...formData, tipo: value as Usuario['tipo'] })}
                  disabled={loading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo de usuário" />
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
                <p className="text-xs text-gray-500 mt-1">
                  Administradores podem ver dados de todas as igrejas
                </p>
              </div>

              <div>
                <Label htmlFor="igreja" className="text-sm font-medium text-gray-700 mb-2 block">
                  Igreja *
                </Label>
                <Select 
                  value={formData.igreja} 
                  onValueChange={(value) => setFormData({ ...formData, igreja: value as Usuario['igreja'] })}
                  disabled={loading}
                >
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
                disabled={loading}
              >
                {loading ? 'Cadastrando...' : 'Cadastrar Usuário'}
              </Button>
            </form>
          </div>

          {/* Table Section */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Usuários Cadastrados</h2>
            
            {usuarios.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Nenhum usuário cadastrado ainda.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="font-semibold text-gray-700">Foto</TableHead>
                    <TableHead className="font-semibold text-gray-700">Nome</TableHead>
                    <TableHead className="font-semibold text-gray-700">Tipo</TableHead>
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
                      <TableCell>
                        <Badge className={usuario.tipo === 'administrador' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}>
                          {usuario.tipo === 'administrador' ? (
                            <div className="flex items-center gap-1">
                              <Shield className="w-3 h-3" />
                              Admin
                            </div>
                          ) : (
                            <div className="flex items-center gap-1">
                              <User className="w-3 h-3" />
                              Missionário
                            </div>
                          )}
                        </Badge>
                      </TableCell>
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
    </div>
  );
}
