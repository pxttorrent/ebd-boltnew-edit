
import React from 'react';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Interessado, Usuario } from '../types';
import InteressadosTableRow from './InteressadosTableRow';

interface InteressadosTableProps {
  interessados: Interessado[];
  usuarios: Usuario[];
  onEdit: (interessado: Interessado) => void;
  onDelete: (id: string, nome: string) => void;
  onStatusClick: (interessado: Interessado, campo: 'status') => void;
  onInstrutorClick: (interessado: Interessado) => void;
  onFrequentaCultosClick: (interessado: Interessado, campo: 'frequenta_cultos') => void;
}

export default function InteressadosTable({
  interessados,
  usuarios,
  onEdit,
  onDelete,
  onStatusClick,
  onInstrutorClick,
  onFrequentaCultosClick
}: InteressadosTableProps) {
  return (
    <div className="overflow-x-auto">
      <Table className="min-w-[1400px]">
        <TableHeader>
          <TableRow className="bg-gray-50">
            <TableHead className="font-semibold text-gray-700 min-w-[200px]">Nome</TableHead>
            <TableHead className="font-semibold text-gray-700 min-w-[120px]">Telefone</TableHead>
            <TableHead className="font-semibold text-gray-700 min-w-[200px]">Endereço</TableHead>
            <TableHead className="font-semibold text-gray-700 min-w-[120px]">Igreja</TableHead>
            <TableHead className="font-semibold text-gray-700 min-w-[180px]">Status</TableHead>
            <TableHead className="font-semibold text-gray-700 min-w-[150px]">Instrutor</TableHead>
            <TableHead className="font-semibold text-gray-700 min-w-[120px]">Data Contato</TableHead>
            <TableHead className="font-semibold text-gray-700 min-w-[150px]">Participação Eventos</TableHead>
            <TableHead className="font-semibold text-gray-700 min-w-[200px]">Estudo Bíblico</TableHead>
            <TableHead className="font-semibold text-gray-700 min-w-[250px]">Observações</TableHead>
            <TableHead className="font-semibold text-gray-700 min-w-[120px] text-center">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {interessados.map((interessado) => (
            <InteressadosTableRow
              key={interessado.id}
              interessado={interessado}
              usuarios={usuarios}
              onEdit={onEdit}
              onDelete={onDelete}
              onStatusClick={onStatusClick}
              onInstrutorClick={onInstrutorClick}
              onFrequentaCultosClick={onFrequentaCultosClick}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
