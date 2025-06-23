
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppProvider, useApp } from "./context/AppContext";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import { AppSidebar } from "./components/AppSidebar";
import BoasVindas from "./pages/BoasVindas";
import CadastrarInteressado from "./pages/CadastrarInteressado";
import ListaInteressados from "./pages/ListaInteressados";
import CadastroMissionarios from "./pages/CadastroMissionarios";
import Configuracoes from "./pages/Configuracoes";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import { useEffect } from "react";

const queryClient = new QueryClient();

const AppContent = () => {
  const { user, loading } = useAuth();

  useEffect(() => {
    // Force re-render when user changes
    console.log('User state changed:', user?.id);
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-gray-900">Escola Bíblica Distrital</h2>
            </div>
          </header>
          <main className="flex-1 overflow-auto">
            <Routes>
              <Route path="/" element={<BoasVindas />} />
              <Route path="/cadastrar-interessado" element={<CadastrarInteressado />} />
              <Route path="/interessados" element={<ListaInteressados />} />
              <Route path="/missionarios" element={<CadastroMissionarios />} />
              <Route path="/configuracoes" element={<Configuracoes />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
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
      <AuthProvider>
        <AppProvider>
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
        </AppProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
