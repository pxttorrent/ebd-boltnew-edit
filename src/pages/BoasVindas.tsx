import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { UserPlus, Users, BookOpen, Settings, Quote, UserCog, ChevronUp, ChevronDown, Building, BarChart3 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusLabels } from '../types';

const allFeatures = [
  {
    title: 'Cadastrar Interessados',
    description: 'Registre novos contatos interessados nos estudos bíblicos',
    icon: UserPlus,
    link: '/cadastrar-interessado',
    color: 'from-green-500 to-green-600',
    allowedFor: ['administrador', 'missionario']
  },
  {
    title: 'Gerenciar Interessados',
    description: 'Acompanhe o progresso e status de cada interessado',
    icon: Users,
    link: '/interessados',
    color: 'from-blue-500 to-blue-600',
    allowedFor: ['administrador', 'missionario']
  },
  {
    title: 'Meu Cadastro',
    description: 'Gerencie suas informações pessoais e configurações',
    icon: UserCog,
    link: '/meu-cadastro',
    color: 'from-indigo-500 to-indigo-600',
    allowedFor: ['administrador', 'missionario']
  },
  {
    title: 'Cadastrar Missionários',
    description: 'Gerencie a equipe de instrutores bíblicos',
    icon: BookOpen,
    link: '/missionarios',
    color: 'from-purple-500 to-purple-600',
    allowedFor: ['administrador'] // Apenas administradores
  },
  {
    title: 'Configurações',
    description: 'Configure permissões e ajustes do sistema',
    icon: Settings,
    link: '/configuracoes',
    color: 'from-gray-500 to-gray-600',
    allowedFor: ['administrador'] // Apenas administradores
  }
];

const versosBiblicos = [
  {
    verso: "Portanto ide, fazei discípulos de todas as nações, batizando-os em nome do Pai, e do Filho, e do Espírito Santo.",
    referencia: "Mateus 28:19"
  },
  {
    verso: "E ser-me-eis testemunhas, tanto em Jerusalém como em toda a Judéia e Samaria, e até aos confins da terra.",
    referencia: "Atos 1:8"
  },
  {
    verso: "E disse-lhes: Ide por todo o mundo, pregai o evangelho a toda criatura.",
    referencia: "Marcos 16:15"
  },
  {
    verso: "Como são formosos os pés dos que anunciam a paz, dos que anunciam coisas boas!",
    referencia: "Romanos 10:15"
  },
  {
    verso: "Mas, como invocarão aquele em quem não creram? E como crerão naquele de quem não ouviram? E como ouvirão, se não há quem pregue?",
    referencia: "Romanos 10:14"
  },
  {
    verso: "Porque não me envergonho do evangelho de Cristo, pois é o poder de Deus para salvação de todo aquele que crê.",
    referencia: "Romanos 1:16"
  },
  {
    verso: "E todos os dias, no templo e nas casas, não cessavam de ensinar, e de anunciar a Jesus Cristo.",
    referencia: "Atos 5:42"
  },
  {
    verso: "A seara é realmente grande, mas poucos os ceifeiros; rogai, pois, ao Senhor da seara, que mande ceifeiros para a sua seara.",
    referencia: "Lucas 10:2"
  }
];

export default function BoasVindas() {
  const [versoAtual, setVersoAtual] = useState(versosBiblicos[0]);
  const [showIgrejasStats, setShowIgrejasStats] = useState(true);
  const [showStatusStats, setShowStatusStats] = useState(true);
  const { usuarios, interessados, totalInteressados, currentUser, igrejas } = useApp();

  useEffect(() => {
    const indiceAleatorio = Math.floor(Math.random() * versosBiblicos.length);
    setVersoAtual(versosBiblicos[indiceAleatorio]);
  }, []);

  // Filtrar features baseado no tipo de usuário
  const features = allFeatures.filter(feature => 
    currentUser && feature.allowedFor.includes(currentUser.tipo)
  );

  // Calcular estatísticas baseado no tipo de usuário
  const numeroMissionarios = usuarios.filter(u => u.aprovado).length;
  
  // Para missionários: mostrar contagem total do sistema, mas lista filtrada
  // Para administradores: mostrar contagem da lista atual (que é total mesmo)
  const numeroInteressados = currentUser?.tipo === 'missionario' ? totalInteressados : interessados.length;
  
  const missionariosAguardandoAprovacao = usuarios.filter(u => !u.aprovado).length;
  const prontosParaBatismo = interessados.filter(i => i.status === 'A').length;

  // Calcular estatísticas por igreja
  const estatisticasPorIgreja = useMemo(() => {
    const stats = new Map();
    
    // Inicializar com todas as igrejas ativas
    igrejas.filter(igreja => igreja.ativa).forEach(igreja => {
      stats.set(igreja.nome, 0);
    });
    
    // Contar interessados por igreja
    interessados.forEach(interessado => {
      const igreja = interessado.cidade || interessado.igreja;
      if (igreja) {
        stats.set(igreja, (stats.get(igreja) || 0) + 1);
      }
    });
    
    // Converter para array e ordenar por quantidade (decrescente)
    return Array.from(stats.entries())
      .map(([nome, quantidade]) => ({ nome, quantidade }))
      .sort((a, b) => b.quantidade - a.quantidade);
  }, [interessados, igrejas]);

  // Calcular estatísticas por status
  const estatisticasPorStatus = useMemo(() => {
    const stats = new Map();
    
    // Inicializar com todos os status
    Object.keys(StatusLabels).forEach(status => {
      stats.set(status, 0);
    });
    
    // Contar interessados por status
    interessados.forEach(interessado => {
      stats.set(interessado.status, (stats.get(interessado.status) || 0) + 1);
    });
    
    // Converter para array e ordenar por prioridade (A > B > C > D > E)
    const statusOrder = ['A', 'B', 'C', 'D', 'E'];
    return statusOrder.map(status => ({
      status,
      label: StatusLabels[status as keyof typeof StatusLabels],
      quantidade: stats.get(status) || 0
    }));
  }, [interessados]);

  // Cores para os status
  const statusColors = {
    'A': 'from-green-500 to-green-600',
    'B': 'from-blue-500 to-blue-600', 
    'C': 'from-yellow-500 to-yellow-600',
    'D': 'from-purple-500 to-purple-600',
    'E': 'from-gray-500 to-gray-600'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Bem-vindos à Escola Bíblica Distrital
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Uma ferramenta para organizar e acompanhar o progresso espiritual dos interessados.
            Gerencie contatos, acompanhe estudos e organize sua equipe de missionários de forma eficiente.
          </p>

          {/* Verso Bíblico */}
          <div className="bg-gradient-to-r from-blue-100 to-blue-50 rounded-lg p-3 mx-auto max-w-4xl border-l-2 border-blue-500 shadow-sm">
            <div className="flex items-center gap-2 justify-center">
              <Quote className="w-4 h-4 text-blue-600 flex-shrink-0" />
              <p className="text-sm text-blue-900 font-medium italic">
                "{versoAtual.verso}" - {versoAtual.referencia}
              </p>
            </div>
          </div>
        </div>

        {/* Cards de Estatísticas Principais */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {currentUser?.tipo === 'administrador' && (
            <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Missionários Ativos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{numeroMissionarios}</div>
              </CardContent>
            </Card>
          )}

          <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {currentUser?.tipo === 'missionario' ? 'Total de Interessados (Sistema)' : 'Total de Interessados'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{numeroInteressados}</div>
              {currentUser?.tipo === 'missionario' && (
                <p className="text-xs text-gray-500 mt-1">
                  Você gerencia: {interessados.length}
                </p>
              )}
            </CardContent>
          </Card>

          {currentUser?.tipo === 'administrador' && (
            <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Aguardando Aprovação</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{missionariosAguardandoAprovacao}</div>
              </CardContent>
            </Card>
          )}

          <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {currentUser?.tipo === 'missionario' ? 'Prontos para Batismo (Seus)' : 'Prontos para Batismo'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{prontosParaBatismo}</div>
            </CardContent>
          </Card>
        </div>

        {/* Estatísticas por Igreja */}
        <div className="mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Building className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-bold text-gray-900">Interessados por Igreja</h2>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowIgrejasStats(!showIgrejasStats)}
                className="text-gray-500 hover:text-gray-700 p-1"
              >
                {showIgrejasStats ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </Button>
            </div>
            
            {showIgrejasStats && (
              <div className="p-4">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
                  {estatisticasPorIgreja.map((item, index) => (
                    <div
                      key={item.nome}
                      className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200 hover:shadow-md transition-shadow"
                    >
                      <div className="text-center">
                        <div className="text-lg font-bold text-blue-700">{item.quantidade}</div>
                        <div className="text-xs text-blue-600 font-medium truncate" title={item.nome}>
                          {item.nome}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {estatisticasPorIgreja.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Building className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Nenhuma igreja com interessados cadastrados ainda.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Estatísticas por Status */}
        <div className="mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <BarChart3 className="w-5 h-5 text-green-600" />
                <h2 className="text-lg font-bold text-gray-900">Interessados por Status</h2>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowStatusStats(!showStatusStats)}
                className="text-gray-500 hover:text-gray-700 p-1"
              >
                {showStatusStats ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </Button>
            </div>
            
            {showStatusStats && (
              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {estatisticasPorStatus.map((item) => (
                    <div
                      key={item.status}
                      className={`bg-gradient-to-br ${statusColors[item.status as keyof typeof statusColors]} rounded-lg p-4 text-white hover:shadow-lg transition-shadow`}
                    >
                      <div className="text-center">
                        <div className="text-2xl font-bold mb-2">{item.quantidade}</div>
                        <div className="text-sm font-medium leading-tight">{item.label}</div>
                      </div>
                    </div>
                  ))}
                </div>
                {estatisticasPorStatus.every(item => item.quantidade === 0) && (
                  <div className="text-center py-8 text-gray-500">
                    <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Nenhum interessado cadastrado ainda.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Features Grid */}
        <div className={`grid gap-6 mb-12 ${features.length <= 3 ? 'md:grid-cols-3' : 'md:grid-cols-2 lg:grid-cols-3'}`}>
          {features.map((feature, index) => (
            <Link
              key={index}
              to={feature.link}
              className="group bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <div className={`w-12 h-12 bg-gradient-to-br ${feature.color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600 text-sm">{feature.description}</p>
            </Link>
          ))}
        </div>

        {/* Stats Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-8 shadow-lg">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Sistema de Gestão Completo
          </h2>
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Gestão de Contatos</h3>
              <p className="text-gray-600">
                Organize todos os interessados com informações detalhadas e acompanhamento do status.
              </p>
            </div>
            <div>
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Equipe Organizada</h3>
              <p className="text-gray-600">
                {currentUser?.tipo === 'administrador' 
                  ? 'Gerencie missionários e instrutores com permissões personalizadas para cada função.'
                  : 'Trabalhe em equipe com outros missionários para alcançar mais pessoas.'
                }
              </p>
            </div>
            <div>
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <UserCog className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Perfil Personalizado</h3>
              <p className="text-gray-600">
                {currentUser?.tipo === 'administrador'
                  ? 'Configure seu perfil e gerencie todas as funcionalidades administrativas do sistema.'
                  : 'Mantenha suas informações atualizadas e personalize sua experiência no sistema.'
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}