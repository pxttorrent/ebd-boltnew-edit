
import React from 'react';
import { Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface InteressadosFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  cidadeFilter: string;
  setCidadeFilter: (value: string) => void;
  cidadesUnicas: string[];
}

export default function InteressadosFilters({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  cidadeFilter,
  setCidadeFilter,
  cidadesUnicas
}: InteressadosFiltersProps) {
  return (
    <div className="flex flex-col md:flex-row gap-4 flex-1">
      {/* Busca */}
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Buscar por nome, telefone ou igreja..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>
      
      {/* Filtros */}
      <div className="flex gap-2">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os Status</SelectItem>
            <SelectItem value="A">A - Pronto para batismo</SelectItem>
            <SelectItem value="B">B - Decidido, com detalhes</SelectItem>
            <SelectItem value="C">C - Estudando, indeciso</SelectItem>
            <SelectItem value="D">D - Estudando atualmente</SelectItem>
            <SelectItem value="E">E - Contato inicial</SelectItem>
          </SelectContent>
        </Select>

        <Select value={cidadeFilter} onValueChange={setCidadeFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Igreja" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas as Igrejas</SelectItem>
            {cidadesUnicas.map(cidade => (
              <SelectItem key={cidade} value={cidade}>{cidade}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
