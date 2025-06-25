import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Send, Users, Filter, X, Settings } from 'lucide-react';
import { Interessado } from '../types';
import { useToast } from '@/hooks/use-toast';
import { getWhatsAppSettings, isWhatsAppEnabled } from '../services/whatsappService';

interface WhatsAppMassMessageProps {
  isOpen: boolean;
  onClose: () => void;
  interessados: Interessado[];
}

const MENSAGENS_PREDEFINIDAS = {
  lembretes: {
    culto: "🙏 Olá {nome}! Lembrando que hoje temos culto às 19h30. Sua presença é muito importante para nós! Que Deus abençoe! 🙌",
    escola_sabatina: "📖 Bom dia {nome}! Hoje temos Escola Sabatina às 9h. Venha estudar a Palavra de Deus conosco! Te esperamos! ✨",
    pequeno_grupo: "👥 Oi {nome}! Hoje temos nosso Pequeno Grupo às 19h30. Será um momento especial de comunhão e estudo bíblico! 💙",
    jovens: "🎵 E aí {nome}! Hoje tem encontro dos jovens às 19h. Vamos louvar e aprender juntos! Não perca! 🔥"
  },
  oracao: {
    geral: "🙏 {nome}, que a paz de Cristo esteja com você hoje! Saiba que estamos orando por você e sua família. Deus tem planos maravilhosos para sua vida! 💙",
    enfermidade: "💙 {nome}, estamos orando pela sua saúde e recuperação. Que o Senhor Jesus traga cura e conforto para você. Conte conosco! 🙏",
    gratidao: "🙌 {nome}, queremos agradecer a Deus por sua vida! Você é uma bênção para nossa igreja. Que o Senhor continue te abençoando! ✨",
    aniversario: "🎉 Feliz aniversário {nome}! Que este novo ano de vida seja repleto das bênçãos de Deus! Celebramos sua vida conosco! 🎂"
  },
  convites: {
    batismo: "💒 {nome}, temos uma cerimônia de batismo no próximo sábado às 15h. Venha presenciar este momento especial de entrega a Jesus! 🙏",
    evangelismo: "📢 {nome}, convite especial! Teremos uma programação evangelística no sábado às 19h. Traga seus amigos e familiares! 🌟",
    festa_igreja: "🎊 {nome}, você está convidado(a) para nossa confraternização no domingo às 16h. Será um momento de alegria e comunhão! 🍽️",
    seminario: "📚 {nome}, temos um seminário especial sobre família cristã no próximo fim de semana. Inscrições abertas! Não perca! 💑"
  },
  anuncios: {
    novo_horario: "⏰ {nome}, informamos que a partir desta semana o horário do culto será às 19h30. Esperamos você! 🙏",
    reforma: "🔨 {nome}, nossa igreja passará por uma pequena reforma. Os cultos serão no salão social temporariamente. Obrigado pela compreensão! 💙",
    novo_pastor: "👨‍💼 {nome}, temos a alegria de anunciar nosso novo pastor! Venha conhecê-lo no culto de apresentação no sábado! 🙌",
    campanha: "💝 {nome}, estamos com uma campanha de arrecadação para ajudar famílias necessitadas. Sua colaboração é muito importante! 🤝"
  }
};

export default function WhatsAppMassMessage({ isOpen, onClose, interessados }: WhatsAppMassMessageProps) {
  const [mensagem, setMensagem] = useState('');
  const [categoria, setCategoria] = useState('');
  const [tipoMensagem, setTipoMensagem] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [filtroIgreja, setFiltroIgreja] = useState('todas');
  const [interessadosSelecionados, setInteressadosSelecionados] = useState<string[]>([]);
  const [selecionarTodos, setSelecionarTodos] = useState(false);
  const { toast } = useToast();

  // Verificar se WhatsApp está habilitado
  const whatsappEnabled = isWhatsAppEnabled();
  const whatsappSettings = getWhatsAppSettings();

  // Filtrar interessados com telefone
  const interessadosComTelefone = interessados.filter(i => i.telefone && i.telefone.trim() !== '');

  // Aplicar filtros
  const interessadosFiltrados = interessadosComTelefone.filter(interessado => {
    const matchesStatus = filtroStatus === 'todos' || interessado.status === filtroStatus;
    const matchesIgreja = filtroIgreja === 'todas' || interessado.cidade === filtroIgreja;
    return matchesStatus && matchesIgreja;
  });

  // Obter igrejas únicas
  const igrejasUnicas = [...new Set(interessadosComTelefone.map(i => i.cidade))].sort();

  const handleCategoriaChange = (value: string) => {
    setCategoria(value);
    setTipoMensagem('');
    setMensagem('');
  };

  const handleTipoMensagemChange = (value: string) => {
    setTipoMensagem(value);
    if (categoria && value) {
      const mensagemTemplate = MENSAGENS_PREDEFINIDAS[categoria as keyof typeof MENSAGENS_PREDEFINIDAS][value];
      setMensagem(mensagemTemplate);
    }
  };

  const handleSelecionarTodos = (checked: boolean) => {
    setSelecionarTodos(checked);
    if (checked) {
      setInteressadosSelecionados(interessadosFiltrados.map(i => i.id));
    } else {
      setInteressadosSelecionados([]);
    }
  };

  const handleSelecionarInteressado = (id: string, checked: boolean) => {
    if (checked) {
      setInteressadosSelecionados(prev => [...prev, id]);
    } else {
      setInteressadosSelecionados(prev => prev.filter(i => i !== id));
      setSelecionarTodos(false);
    }
  };

  const formatarTelefone = (telefone: string) => {
    // Remove formatação e adiciona código do país se necessário
    const numeroLimpo = telefone.replace(/\D/g, '');
    if (numeroLimpo.length === 11 && numeroLimpo.startsWith('5')) {
      return `55${numeroLimpo}`;
    } else if (numeroLimpo.length === 10) {
      return `555${numeroLimpo}`;
    }
    return `55${numeroLimpo}`;
  };

  const enviarMensagens = () => {
    if (!whatsappEnabled) {
      toast({
        title: "WhatsApp Desabilitado",
        description: "Configure o WhatsApp nas configurações do sistema antes de enviar mensagens.",
        variant: "destructive"
      });
      return;
    }

    if (!mensagem.trim()) {
      toast({
        title: "Erro",
        description: "Digite uma mensagem para enviar.",
        variant: "destructive"
      });
      return;
    }

    if (interessadosSelecionados.length === 0) {
      toast({
        title: "Erro",
        description: "Selecione pelo menos um interessado para enviar a mensagem.",
        variant: "destructive"
      });
      return;
    }

    const interessadosParaEnvio = interessadosFiltrados.filter(i => 
      interessadosSelecionados.includes(i.id)
    );

    let mensagensEnviadas = 0;
    const delay = whatsappSettings?.defaultDelay || 1000;

    interessadosParaEnvio.forEach((interessado, index) => {
      setTimeout(() => {
        const mensagemPersonalizada = mensagem.replace(/{nome}/g, interessado.nome_completo.split(' ')[0]);
        const telefoneFormatado = formatarTelefone(interessado.telefone);
        const mensagemCodificada = encodeURIComponent(mensagemPersonalizada);
        
        const urlWhatsApp = `https://wa.me/${telefoneFormatado}?text=${mensagemCodificada}`;
        window.open(urlWhatsApp, '_blank');
        
        mensagensEnviadas++;
        
        if (mensagensEnviadas === interessadosParaEnvio.length) {
          toast({
            title: "Mensagens Enviadas!",
            description: `${mensagensEnviadas} conversas do WhatsApp foram abertas com sucesso.`
          });
        }
      }, index * delay);
    });

    onClose();
  };

  const limparSelecoes = () => {
    setMensagem('');
    setCategoria('');
    setTipoMensagem('');
    setFiltroStatus('todos');
    setFiltroIgreja('todas');
    setInteressadosSelecionados([]);
    setSelecionarTodos(false);
  };

  // Se WhatsApp não estiver configurado, mostrar aviso
  if (!whatsappEnabled) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-red-600" />
              WhatsApp Não Configurado
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <Settings className="w-8 h-8 text-red-600" />
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Configure o WhatsApp
              </h3>
              <p className="text-gray-600 mb-4">
                Para usar o envio de mensagens em massa, você precisa configurar a API do WhatsApp nas configurações do sistema.
              </p>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                <strong>Como configurar:</strong><br />
                1. Vá em Configurações → WhatsApp<br />
                2. Configure sua API Key e credenciais<br />
                3. Ative o WhatsApp<br />
                4. Teste a conexão
              </p>
            </div>

            <Button onClick={onClose} className="w-full">
              Entendi
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-green-600" />
            Envio em Massa - WhatsApp
            {whatsappEnabled && (
              <Badge className="bg-green-100 text-green-800 ml-2">
                Configurado
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Coluna da Esquerda - Configuração da Mensagem */}
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Categoria da Mensagem</Label>
              <Select value={categoria} onValueChange={handleCategoriaChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lembretes">🔔 Lembretes de Atividades</SelectItem>
                  <SelectItem value="oracao">🙏 Mensagens de Oração</SelectItem>
                  <SelectItem value="convites">📨 Convites Especiais</SelectItem>
                  <SelectItem value="anuncios">📢 Anúncios Gerais</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {categoria && (
              <div>
                <Label className="text-sm font-medium">Tipo de Mensagem</Label>
                <Select value={tipoMensagem} onValueChange={handleTipoMensagemChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(MENSAGENS_PREDEFINIDAS[categoria as keyof typeof MENSAGENS_PREDEFINIDAS]).map((tipo) => (
                      <SelectItem key={tipo} value={tipo}>
                        {tipo.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <Label className="text-sm font-medium">Mensagem</Label>
              <Textarea
                value={mensagem}
                onChange={(e) => setMensagem(e.target.value)}
                placeholder="Digite sua mensagem aqui... Use {nome} para personalizar com o nome do interessado."
                rows={8}
                className="resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                Use {'{nome}'} para inserir automaticamente o primeiro nome de cada pessoa.
              </p>
            </div>

            <div className="flex gap-2">
              <Button onClick={limparSelecoes} variant="outline" className="flex-1">
                <X className="w-4 h-4 mr-2" />
                Limpar
              </Button>
              <Button onClick={enviarMensagens} className="flex-1 bg-green-600 hover:bg-green-700">
                <Send className="w-4 h-4 mr-2" />
                Enviar ({interessadosSelecionados.length})
              </Button>
            </div>
          </div>

          {/* Coluna da Direita - Seleção de Destinatários */}
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Filtros</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os Status</SelectItem>
                    <SelectItem value="A">A - Pronto para batismo</SelectItem>
                    <SelectItem value="B">B - Decidido</SelectItem>
                    <SelectItem value="C">C - Indeciso</SelectItem>
                    <SelectItem value="D">D - Estudando</SelectItem>
                    <SelectItem value="E">E - Contato inicial</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filtroIgreja} onValueChange={setFiltroIgreja}>
                  <SelectTrigger>
                    <SelectValue placeholder="Igreja" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todas">Todas as Igrejas</SelectItem>
                    {igrejasUnicas.map(igreja => (
                      <SelectItem key={igreja} value={igreja}>{igreja}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="selecionar-todos"
                  checked={selecionarTodos}
                  onCheckedChange={handleSelecionarTodos}
                />
                <Label htmlFor="selecionar-todos" className="text-sm font-medium">
                  Selecionar Todos
                </Label>
              </div>
              <Badge variant="outline" className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                {interessadosFiltrados.length} disponíveis
              </Badge>
            </div>

            <div className="border rounded-lg max-h-64 overflow-y-auto">
              {interessadosFiltrados.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>Nenhum interessado com telefone encontrado</p>
                </div>
              ) : (
                <div className="p-2 space-y-2">
                  {interessadosFiltrados.map((interessado) => (
                    <div key={interessado.id} className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded">
                      <Checkbox
                        id={`interessado-${interessado.id}`}
                        checked={interessadosSelecionados.includes(interessado.id)}
                        onCheckedChange={(checked) => handleSelecionarInteressado(interessado.id, checked as boolean)}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{interessado.nome_completo}</p>
                        <p className="text-xs text-gray-500">{interessado.telefone} • {interessado.cidade}</p>
                      </div>
                      <Badge className="text-xs">
                        {interessado.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}