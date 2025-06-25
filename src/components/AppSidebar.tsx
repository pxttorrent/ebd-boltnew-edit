import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Home, UserPlus, Users, BookOpen, Settings, LogOut, UserCog } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { signOutFromSupabase } from '../services/supabaseService';
import { useToast } from '@/hooks/use-toast';

const allMenuItems = [
  {
    title: 'Boas-vindas',
    url: '/',
    icon: Home,
    allowedFor: ['administrador', 'missionario']
  },
  {
    title: 'Cadastrar Interessados',
    url: '/cadastrar-interessado',
    icon: UserPlus,
    allowedFor: ['administrador', 'missionario']
  },
  {
    title: 'Lista de Interessados',
    url: '/interessados',
    icon: Users,
    allowedFor: ['administrador', 'missionario']
  },
  {
    title: 'Meu Cadastro',
    url: '/meu-cadastro',
    icon: UserCog,
    allowedFor: ['administrador', 'missionario']
  },
  {
    title: 'Cadastro de Missionários',
    url: '/missionarios',
    icon: BookOpen,
    allowedFor: ['administrador'] // Apenas administradores
  },
  {
    title: 'Configurações',
    url: '/configuracoes',
    icon: Settings,
    allowedFor: ['administrador'] // Apenas administradores
  },
];

export function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, setCurrentUser } = useApp();
  const { state } = useSidebar();
  const { toast } = useToast();

  // Filtrar itens do menu baseado no tipo de usuário
  const menuItems = allMenuItems.filter(item => 
    currentUser && item.allowedFor.includes(currentUser.tipo)
  );

  const handleLogout = async () => {
    try {
      await signOutFromSupabase();
      setCurrentUser(null);
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado com sucesso."
      });
      navigate('/login');
    } catch (error) {
      console.error('Erro no logout:', error);
      toast({
        title: "Erro",
        description: "Erro ao fazer logout. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  return (
    <Sidebar className="border-r border-gray-200" collapsible="icon">
      <SidebarHeader className="border-b border-gray-200 p-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
            <BookOpen className="w-4 h-4 text-white" />
          </div>
          {state === 'expanded' && (
            <div>
              <h1 className="font-bold text-lg text-gray-900">Escola Bíblica</h1>
              <p className="text-sm text-gray-500">Distrital</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="p-2">
        <SidebarMenu>
          {menuItems.map((item) => {
            const isActive = location.pathname === item.url;
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild isActive={isActive} tooltip={state === 'collapsed' ? item.title : undefined}>
                  <Link
                    to={item.url}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-blue-50 text-blue-600 font-medium'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="border-t border-gray-200 p-4 space-y-4">
        {currentUser && (
          <>
            <div className="flex items-center gap-3">
              <Avatar className="w-8 h-8">
                <AvatarImage src={currentUser.foto_perfil} />
                <AvatarFallback className="text-xs bg-blue-100 text-blue-600">
                  {currentUser.nome_completo.split(' ').map(n => n[0]).join('').toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {state === 'expanded' && (
                <div className="text-sm min-w-0 flex-1">
                  <p className="font-medium text-gray-900 truncate">{currentUser.nome_completo}</p>
                  <p className="text-gray-500 truncate">{currentUser.igreja}</p>
                  <p className="text-xs text-blue-600 capitalize">{currentUser.tipo}</p>
                </div>
              )}
            </div>
            
            {state === 'expanded' && (
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="w-full flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
              >
                <LogOut className="w-4 h-4" />
                Sair
              </Button>
            )}
            
            {state === 'collapsed' && (
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="w-full p-2 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                title="Sair"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            )}
          </>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}