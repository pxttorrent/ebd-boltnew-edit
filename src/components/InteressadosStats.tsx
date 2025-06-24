
import React from 'react';
import { Usuario } from '../types';

interface InteressadosStatsProps {
  filteredCount: number;
  totalCount: number;
  currentUser: Usuario | null;
}

export default function InteressadosStats({
  filteredCount,
  totalCount,
  currentUser
}: InteressadosStatsProps) {
  return (
    <div className="mt-4 text-sm text-gray-600">
      Mostrando {filteredCount} de {totalCount} interessados
      {currentUser?.tipo === 'missionario' && (
        <span className="text-blue-600 font-medium"> (seus cadastros)</span>
      )}
    </div>
  );
}
