
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { UserPlus, Users, BookOpen, Settings, Quote } from 'lucide-react';

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

  useEffect(() => {
    const indiceAleatorio = Math.floor(Math.random() * versosBiblicos.length);
    setVersoAtual(versosBiblicos[indiceAleatorio]);
  }, []);

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
          <div className="bg-gradient-to-r from-blue-100 to-blue-50 rounded-xl p-6 mx-auto max-w-4xl border-l-4 border-blue-500 shadow-sm">
            <div className="flex items-start gap-3">
              <Quote className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
              <div className="text-left">
                <p className="text-lg text-blue-900 font-medium italic leading-relaxed mb-2">
                  "{versoAtual.verso}"
                </p>
                <p className="text-blue-700 font-semibold">
                  - {versoAtual.referencia}
                </p>
              </div>
            </div>
          </div>
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
