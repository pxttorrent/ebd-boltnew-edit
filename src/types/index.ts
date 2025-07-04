export interface Usuario {
  id: string;
  nome_completo: string;
  apelido: string;
  login_acesso: string;
  senha: string;
  email_pessoal?: string;
  igreja: string;
  aprovado: boolean;
  foto_perfil?: string;
  tipo: 'administrador' | 'missionario';
  created_at?: string;
  updated_at?: string;
  permissoes: {
    pode_cadastrar: boolean;
    pode_editar: boolean;
    pode_excluir: boolean;
    pode_exportar: boolean;
  };
}

export interface Interessado {
  id: string;
  nome_completo: string;
  telefone: string;
  endereco?: string;
  cidade: string;
  igreja?: string;
  status: 'A' | 'B' | 'C' | 'D' | 'E';
  instrutor_biblico: string;
  data_contato: string;
  observacoes?: string;
  frequenta_cultos?: string;
  estudo_biblico?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Igreja {
  id: string;
  nome: string;
  ativa: boolean;
  created_at?: string;
  updated_at?: string;
}

export const StatusLabels = {
  'A': 'Pronto para batismo',
  'B': 'Decidido, com detalhes a resolver',
  'C': 'Estudando, indeciso',
  'D': 'Estudando atualmente',
  'E': 'Contato inicial'
};

export const StatusColors = {
  'A': 'bg-green-100 text-green-800',
  'B': 'bg-blue-100 text-blue-800',
  'C': 'bg-yellow-100 text-yellow-800',
  'D': 'bg-purple-100 text-purple-800',
  'E': 'bg-gray-100 text-gray-800'
};

export const TipoUsuarioLabels = {
  'administrador': 'Administrador',
  'missionario': 'Missionário'
};

export const IgrejaOptions = [
  'Armour',
  'Dom Pedrito',
  'Quaraí',
  'Santana do Livramento',
  'Argeni',
  'Parque São José'
];