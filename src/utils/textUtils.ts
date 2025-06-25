export const capitalizeFirstLetter = (text: string): string => {
  if (!text) return text;
  return text.charAt(0).toUpperCase() + text.slice(1);
};

export const capitalizeWords = (text: string): string => {
  if (!text) return text;
  return text
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

// Função para detectar gênero baseado no nome
export const detectGender = (nomeCompleto: string): 'masculino' | 'feminino' | 'neutro' => {
  if (!nomeCompleto) return 'neutro';
  
  const nome = nomeCompleto.trim().toLowerCase();
  
  // Nomes tipicamente femininos
  const nomesFemininos = [
    'maria', 'ana', 'joana', 'lucia', 'luciana', 'patricia', 'fernanda', 'carla', 'sandra', 'monica',
    'claudia', 'andrea', 'juliana', 'mariana', 'cristina', 'simone', 'denise', 'vanessa', 'priscila',
    'gabriela', 'isabela', 'carolina', 'beatriz', 'leticia', 'amanda', 'camila', 'daniela', 'roberta',
    'renata', 'adriana', 'fabiana', 'viviane', 'eliane', 'rosana', 'solange', 'vera', 'silvia',
    'regina', 'helena', 'celia', 'gloria', 'rosa', 'alice', 'clara', 'laura', 'sofia', 'valentina',
    'catarina', 'barbara', 'teresa', 'rita', 'ines', 'fatima', 'conceicao', 'aparecida', 'socorro',
    'grace', 'graca', 'esperanca', 'fe', 'caridade', 'paz', 'alegria', 'vitoria', 'glória'
  ];
  
  // Terminações tipicamente femininas
  const terminacoesFemininas = ['a', 'ina', 'ana', 'iana', 'ela', 'ila', 'isa', 'esa', 'osa'];
  
  // Nomes tipicamente masculinos
  const nomesMasculinos = [
    'joao', 'jose', 'antonio', 'francisco', 'carlos', 'paulo', 'pedro', 'lucas', 'marcos', 'luis',
    'andre', 'felipe', 'rafael', 'daniel', 'bruno', 'rodrigo', 'fernando', 'gustavo', 'eduardo',
    'ricardo', 'marcelo', 'fabio', 'sergio', 'roberto', 'alexandre', 'diego', 'vinicius', 'leonardo',
    'gabriel', 'mateus', 'thiago', 'caio', 'henrique', 'guilherme', 'victor', 'igor', 'otavio',
    'cesar', 'augusto', 'mario', 'nelson', 'wilson', 'walter', 'oscar', 'arthur', 'miguel',
    'emanuel', 'samuel', 'david', 'isaac', 'abraao', 'moises', 'elias', 'jonas', 'joel'
  ];
  
  // Terminações tipicamente masculinas
  const terminacoesMasculinas = ['o', 'or', 'er', 'ar', 'ur', 'on', 'an', 'el', 'il'];
  
  // Pegar o primeiro nome
  const primeiroNome = nome.split(' ')[0];
  
  // Verificar listas específicas primeiro
  if (nomesFemininos.includes(primeiroNome)) {
    return 'feminino';
  }
  
  if (nomesMasculinos.includes(primeiroNome)) {
    return 'masculino';
  }
  
  // Verificar terminações femininas
  for (const terminacao of terminacoesFemininas) {
    if (primeiroNome.endsWith(terminacao)) {
      return 'feminino';
    }
  }
  
  // Verificar terminações masculinas
  for (const terminacao of terminacoesMasculinas) {
    if (primeiroNome.endsWith(terminacao)) {
      return 'masculino';
    }
  }
  
  // Se não conseguir determinar, retorna neutro
  return 'neutro';
};

// Função para obter o tipo de usuário com gênero correto
export const getTipoUsuarioComGenero = (tipo: 'administrador' | 'missionario', nomeCompleto: string): string => {
  if (tipo === 'administrador') {
    const genero = detectGender(nomeCompleto);
    return genero === 'feminino' ? 'Administradora' : 'Administrador';
  }
  
  if (tipo === 'missionario') {
    const genero = detectGender(nomeCompleto);
    return genero === 'feminino' ? 'Missionária' : 'Missionário';
  }
  
  return tipo;
};