
import React from 'react';
import { Link } from 'react-router-dom';
import { UserPlus, Users, BookOpen, Settings } from 'lucide-react';

const features = [
  {
    title: 'Cadastrar Interessados',
    description: 'Registre novos contatos interessados nos estudos bíblicos',
    icon: UserPlus,
    link: '/cadastrar-interessado',
    color: 'from-green-500 to-green-600'
  },
  {
    title: 'Gerenciar Interessados',
    description: 'Acompanhe o progresso e status de cada interessado',
    icon: Users,
    link: '/interessados',
    color: 'from-blue-500 to-blue-600'
  },
  {
    title: 'Cadastrar Missionários',
    description: 'Gerencie a equipe de instrutores bíblicos',
    icon: BookOpen,
    link: '/missionarios',
    color: 'from-purple-500 to-purple-600'
  },
  {
    title: 'Configurações',
    description: 'Configure permissões e ajustes do sistema',
    icon: Settings,
    link: '/configuracoes',
    color: 'from-gray-500 to-gray-600'
  }
];

export default function BoasVindas() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Bem-vindos à Escola Bíblica Distrital
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Uma ferramenta para organizar e acompanhar o progresso espiritual dos interessados.
            Gerencie contatos, acompanhe estudos e organize sua equipe de missionários de forma eficiente.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
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
                Gerencie missionários e instrutores com permissões personalizadas para cada função.
              </p>
            </div>
            <div>
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Settings className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Controle Total</h3>
              <p className="text-gray-600">
                Configure permissões, exporte dados e mantenha total controle sobre as informações.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
