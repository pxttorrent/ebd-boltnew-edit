
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppProvider } from "./context/AppContext";
import { AppSidebar } from "./components/AppSidebar";
import BoasVindas from "./pages/BoasVindas";
import CadastrarInteressado from "./pages/CadastrarInteressado";
import ListaInteressados from "./pages/ListaInteressados";
import CadastroMissionarios from "./pages/CadastroMissionarios";
import Configuracoes from "./pages/Configuracoes";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AppProvider>
        <BrowserRouter>
          <SidebarProvider>
            <div className="min-h-screen flex w-full">
              <AppSidebar />
              <SidebarInset className="flex-1">
                <Routes>
                  <Route path="/" element={<BoasVindas />} />
                  <Route path="/cadastrar-interessado" element={<CadastrarInteressado />} />
                  <Route path="/interessados" element={<ListaInteressados />} />
                  <Route path="/missionarios" element={<CadastroMissionarios />} />
                  <Route path="/configuracoes" element={<Configuracoes />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </SidebarInset>
            </div>
          </SidebarProvider>
        </BrowserRouter>
      </AppProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
