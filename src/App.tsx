import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppProvider } from "./context/AppContext";
import { AppSidebar } from "./components/AppSidebar";
import BoasVindas from "./pages/BoasVindas";
import CadastrarInteressado from "./pages/CadastrarInteressado";
import ListaInteressados from "./pages/ListaInteressados";
import CadastroMissionarios from "./pages/CadastroMissionarios";
import Configuracoes from "./pages/Configuracoes";
import MeuCadastro from "./pages/MeuCadastro";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import { useApp } from "./context/AppContext";

const queryClient = new QueryClient();

// Protected Route Component
const ProtectedRoute = ({ children, requiredRole }: { children: React.ReactNode, requiredRole?: 'administrador' | 'missionario' }) => {
  const { currentUser, loading } = useApp();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // Verificar se o usuário tem o papel necessário
  if (requiredRole && currentUser.tipo !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

// Admin Only Route Component
const AdminOnlyRoute = ({ children }: { children: React.ReactNode }) => {
  return (
    <ProtectedRoute requiredRole="administrador">
      {children}
    </ProtectedRoute>
  );
};

// Main App Layout
const AppLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-gray-900">Escola Bíblica Distrital</h2>
            </div>
          </header>
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AppProvider>
        <BrowserRouter>
          <Routes>
            {/* Public route - Login */}
            <Route path="/login" element={<Login />} />
            
            {/* Protected routes - Available for all authenticated users */}
            <Route path="/" element={
              <ProtectedRoute>
                <AppLayout>
                  <BoasVindas />
                </AppLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/cadastrar-interessado" element={
              <ProtectedRoute>
                <AppLayout>
                  <CadastrarInteressado />
                </AppLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/interessados" element={
              <ProtectedRoute>
                <AppLayout>
                  <ListaInteressados />
                </AppLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/meu-cadastro" element={
              <ProtectedRoute>
                <AppLayout>
                  <MeuCadastro />
                </AppLayout>
              </ProtectedRoute>
            } />
            
            {/* Admin-only routes */}
            <Route path="/missionarios" element={
              <AdminOnlyRoute>
                <AppLayout>
                  <CadastroMissionarios />
                </AppLayout>
              </AdminOnlyRoute>
            } />
            
            <Route path="/configuracoes" element={
              <AdminOnlyRoute>
                <AppLayout>
                  <Configuracoes />
                </AppLayout>
              </AdminOnlyRoute>
            } />
            
            {/* 404 route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;