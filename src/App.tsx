
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppProvider, useApp } from "./context/AppContext";
import { AppSidebar } from "./components/AppSidebar";
import BoasVindas from "./pages/BoasVindas";
import CadastrarInteressado from "./pages/CadastrarInteressado";
import ListaInteressados from "./pages/ListaInteressados";
import CadastroMissionarios from "./pages/CadastroMissionarios";
import Configuracoes from "./pages/Configuracoes";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppContent = () => {
  const { currentUser } = useApp();

  if (!currentUser) {
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
      <AppProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </AppProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
