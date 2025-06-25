import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TableCell, TableRow } from '@/components/ui/table';
import { StatusLabels, StatusColors, Interessado, Usuario } from '../types';
import { Edit, Trash } from 'lucide-react';
import WhatsAppButton from './WhatsAppButton';

interface InteressadosTableRowProps {
  interessado: Interessado;
  usuarios: Usuario[];
  onEdit: (interessado: Interessado) => void;
  onDelete: (id: string, nome: string) => void;
  onStatusClick: (interessado: Interessado, campo: 'status') => void;
  onInstrutorClick: (interessado: Interessado) => void;
  onFrequentaCultosClick: (interessado: Interessado, campo: 'frequenta_cultos') => void;
  onWhatsAppClick: (telefone: string, nome: string) => void;
}

export default function InteressadosTableRow({
  interessado,
  usuarios,
  onEdit,
  onDelete,
  onStatusClick,
  onInstrutorClick,
  onFrequentaCultosClick,
  onWhatsAppClick
}: InteressadosTableRowProps) {
  const instrutorExiste = usuarios.some(u => 
    u.nome_completo.toLowerCase() === interessado.instrutor_biblico.toLowerCase()
  );

  return (
    <TableRow className="hover:bg-gray-50">
      <TableCell className="font-medium">{interessado.nome_completo}</TableCell>
      <TableCell>{interessado.telefone}</TableCell>
      <TableCell>{interessado.endereco || '-'}</TableCell>
      <TableCell>{interessado.cidade}</TableCell>
      <TableCell>
        <div 
          className="cursor-pointer rounded-md p-1 transition-colors hover:bg-gray-100"
          onClick={() => onStatusClick(interessado, 'status')}
          title="Clique para editar"
        >
          <Badge className={StatusColors[interessado.status]}>
            {interessado.status} - {StatusLabels[interessado.status]}
          </Badge>
        </div>
      </TableCell>
      <TableCell>
        <div 
          className={`cursor-pointer hover:text-blue-600 hover:underline ${
            !instrutorExiste && interessado.instrutor_biblico !== 'A definir' 
              ? 'text-red-600 font-medium' 
              : ''
          }`}
          onClick={() => onInstrutorClick(interessado)}
          title={
            !instrutorExiste && interessado.instrutor_biblico !== 'A definir'
              ? "Instrutor não cadastrado - Clique para cadastrar"
              : "Clique para editar"
          }
        >
          {interessado.instrutor_biblico}
          {!instrutorExiste && interessado.instrutor_biblico !== 'A definir' && (
            <span className="text-xs block">📝 Cadastrar</span>
          )}
        </div>
      </TableCell>
      <TableCell>
        {interessado.data_contato ? new Date(interessado.data_contato).toLocaleDateString('pt-BR') : '-'}
      </TableCell>
      <TableCell>
        <div 
          className="cursor-pointer hover:text-blue-600 hover:underline"
          onClick={() => onFrequentaCultosClick(interessado, 'frequenta_cultos')}
          title="Clique para editar"
        >
          {interessado.frequenta_cultos || '-'}
        </div>
      </TableCell>
      <TableCell>{interessado.estudo_biblico || '-'}</TableCell>
      <TableCell>
        <div className="max-w-[200px] truncate" title={interessado.observacoes}>
          {interessado.observacoes || '-'}
        </div>
      </TableCell>
      <TableCell>
        <div className="flex gap-1 justify-center">
          <WhatsAppButton
            telefone={interessado.telefone}
            nome={interessado.nome_completo}
            onWhatsAppClick={onWhatsAppClick}
          />
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 p-2"
            onClick={() => onEdit(interessado)}
            title="Editar interessado"
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-red-600 hover:text-red-700 hover:bg-red-50 p-2"
            onClick={() => onDelete(interessado.id, interessado.nome_completo)}
            title="Excluir interessado"
          >
            <Trash className="w-4 h-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}