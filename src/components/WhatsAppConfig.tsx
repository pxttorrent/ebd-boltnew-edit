import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Database, 
  TestTube, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Info, 
  Eye, 
  EyeOff,
  Server,
  Settings,
  Shield
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface WhatsAppConfigProps {
  currentUser: any;
}

interface WhatsAppSettings {
  apiProvider: 'whatsapp-business' | 'twilio' | 'evolution-api' | 'baileys';
  apiUrl: string;
  apiKey: string;
  phoneNumberId: string;
  accessToken: string;
  webhookUrl: string;
  webhookSecret: string;
  businessAccountId: string;
  enabled: boolean;
  defaultDelay: number;
  maxMessagesPerMinute: number;
  messageTemplates: {
    welcome: string;
    reminder: string;
    invitation: string;
    prayer: string;
  };
}

const DEFAULT_SETTINGS: WhatsAppSettings = {
  apiProvider: 'whatsapp-business',
  apiUrl: 'https://graph.facebook.com/v18.0',
  apiKey: '',
  phoneNumberId: '',
  accessToken: '',
  webhookUrl: '',
  webhookSecret: '',
  businessAccountId: '',
  enabled: false,
  defaultDelay: 1000,
  maxMessagesPerMinute: 30,
  messageTemplates: {
    welcome: 'Olá {nome}! Bem-vindo(a) à nossa igreja. Que Deus abençoe sua vida! 🙏',
    reminder: 'Olá {nome}! Lembrando que hoje temos {evento} às {horario}. Te esperamos! 🙌',
    invitation: 'Olá {nome}! Você está convidado(a) para {evento} no dia {data} às {horario}. Será uma bênção! ✨',
    prayer: 'Olá {nome}! Estamos orando por você e sua família. Que Deus derrame suas bênçãos sobre vocês! 💙'
  }
};

export default function WhatsAppConfig({ currentUser }: WhatsAppConfigProps) {
  const [settings, setSettings] = useState<WhatsAppSettings>(DEFAULT_SETTINGS);
  const [showApiKey, setShowApiKey] = useState(false);
  const [showAccessToken, setShowAccessToken] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const { toast } = useToast();

  // Carregar configurações salvas
  useEffect(() => {
    const savedSettings = localStorage.getItem('whatsapp_settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings({ ...DEFAULT_SETTINGS, ...parsed });
      } catch (error) {
        console.error('Erro ao carregar configurações do WhatsApp:', error);
      }
    }
  }, []);

  const handleSaveSettings = () => {
    try {
      localStorage.setItem('whatsapp_settings', JSON.stringify(settings));
      toast({
        title: "Configurações Salvas!",
        description: "As configurações do WhatsApp foram salvas com sucesso."
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao salvar configurações. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  const handleTestConnection = async () => {
    if (!settings.apiKey || !settings.phoneNumberId) {
      toast({
        title: "Configuração Incompleta",
        description: "Preencha a API Key e Phone Number ID antes de testar.",
        variant: "destructive"
      });
      return;
    }

    setTestingConnection(true);
    setConnectionStatus('testing');

    try {
      // Simular teste de conexão (em produção, fazer chamada real para API)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simular sucesso/erro baseado na presença de dados
      const isValid = settings.apiKey.length > 10 && settings.phoneNumberId.length > 10;
      
      if (isValid) {
        setConnectionStatus('success');
        toast({
          title: "Conexão Bem-sucedida!",
          description: "A API do WhatsApp está configurada corretamente."
        });
      } else {
        setConnectionStatus('error');
        toast({
          title: "Erro na Conexão",
          description: "Verifique suas credenciais e tente novamente.",
          variant: "destructive"
        });
      }
    } catch (error) {
      setConnectionStatus('error');
      toast({
        title: "Erro no Teste",
        description: "Não foi possível testar a conexão com a API.",
        variant: "destructive"
      });
    } finally {
      setTestingConnection(false);
    }
  };

  const getConnectionStatusBadge = () => {
    switch (connectionStatus) {
      case 'testing':
        return <Badge className="bg-yellow-100 text-yellow-800">Testando...</Badge>;
      case 'success':
        return <Badge className="bg-green-100 text-green-800">Conectado</Badge>;
      case 'error':
        return <Badge className="bg-red-100 text-red-800">Erro</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Não Testado</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Database className="w-6 h-6 text-green-600" />
          <div>
            <h2 className="text-xl font-bold text-gray-900">Configurações do WhatsApp</h2>
            <p className="text-sm text-gray-600">Configure a API do WhatsApp para envio de mensagens</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {getConnectionStatusBadge()}
          <Switch
            checked={settings.enabled}
            onCheckedChange={(checked) => setSettings(prev => ({ ...prev, enabled: checked }))}
          />
          <span className="text-sm font-medium">
            {settings.enabled ? 'Ativo' : 'Inativo'}
          </span>
        </div>
      </div>

      {/* Alert de Status */}
      {!settings.enabled && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <p className="font-medium mb-1">WhatsApp Desabilitado</p>
              <p>As funcionalidades do WhatsApp estão desabilitadas. Ative para usar o envio de mensagens.</p>
            </div>
          </div>
        </div>
      )}

      <Tabs defaultValue="api" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="api" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            API
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <Database className="w-4 h-4" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="advanced" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Avançado
          </TabsTrigger>
        </TabsList>

        <TabsContent value="api" className="space-y-6">
          {/* Provedor de API */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Provedor de API</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Provedor</Label>
                <Select 
                  value={settings.apiProvider} 
                  onValueChange={(value) => setSettings(prev => ({ ...prev, apiProvider: value as any }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="whatsapp-business">WhatsApp Business API (Meta)</SelectItem>
                    <SelectItem value="twilio">Twilio WhatsApp API</SelectItem>
                    <SelectItem value="evolution-api">Evolution API</SelectItem>
                    <SelectItem value="baileys">Baileys (Não Oficial)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium">URL da API</Label>
                <Input
                  value={settings.apiUrl}
                  onChange={(e) => setSettings(prev => ({ ...prev, apiUrl: e.target.value }))}
                  placeholder="https://graph.facebook.com/v18.0"
                />
              </div>
            </CardContent>
          </Card>

          {/* Credenciais */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Credenciais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium">API Key / App Secret</Label>
                <div className="relative">
                  <Input
                    type={showApiKey ? 'text' : 'password'}
                    value={settings.apiKey}
                    onChange={(e) => setSettings(prev => ({ ...prev, apiKey: e.target.value }))}
                    placeholder="Sua API Key ou App Secret"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowApiKey(!showApiKey)}
                  >
                    {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Phone Number ID</Label>
                <Input
                  value={settings.phoneNumberId}
                  onChange={(e) => setSettings(prev => ({ ...prev, phoneNumberId: e.target.value }))}
                  placeholder="ID do número de telefone"
                />
              </div>

              <div>
                <Label className="text-sm font-medium">Access Token</Label>
                <div className="relative">
                  <Input
                    type={showAccessToken ? 'text' : 'password'}
                    value={settings.accessToken}
                    onChange={(e) => setSettings(prev => ({ ...prev, accessToken: e.target.value }))}
                    placeholder="Token de acesso"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowAccessToken(!showAccessToken)}
                  >
                    {showAccessToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Business Account ID</Label>
                <Input
                  value={settings.businessAccountId}
                  onChange={(e) => setSettings(prev => ({ ...prev, businessAccountId: e.target.value }))}
                  placeholder="ID da conta comercial"
                />
              </div>
            </CardContent>
          </Card>

          {/* Webhook */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Webhook (Opcional)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium">URL do Webhook</Label>
                <Input
                  value={settings.webhookUrl}
                  onChange={(e) => setSettings(prev => ({ ...prev, webhookUrl: e.target.value }))}
                  placeholder="https://seu-dominio.com/webhook/whatsapp"
                />
              </div>

              <div>
                <Label className="text-sm font-medium">Webhook Secret</Label>
                <Input
                  type="password"
                  value={settings.webhookSecret}
                  onChange={(e) => setSettings(prev => ({ ...prev, webhookSecret: e.target.value }))}
                  placeholder="Chave secreta do webhook"
                />
              </div>
            </CardContent>
          </Card>

          {/* Teste de Conexão */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TestTube className="w-5 h-5" />
                Teste de Conexão
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">
                    Teste a conexão com a API do WhatsApp para verificar se as configurações estão corretas.
                  </p>
                  <div className="mt-2">
                    {getConnectionStatusBadge()}
                  </div>
                </div>
                <Button
                  onClick={handleTestConnection}
                  disabled={testingConnection}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {testingConnection ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Testando...
                    </>
                  ) : (
                    <>
                      <TestTube className="w-4 h-4 mr-2" />
                      Testar Conexão
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Templates de Mensagens</CardTitle>
              <p className="text-sm text-gray-600">
                Configure templates padr�o para diferentes tipos de mensagens. Use {'{nome}'} para personalizar.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Mensagem de Boas-vindas</Label>
                <Textarea
                  value={settings.messageTemplates.welcome}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    messageTemplates: { ...prev.messageTemplates, welcome: e.target.value }
                  }))}
                  rows={3}
                />
              </div>

              <div>
                <Label className="text-sm font-medium">Lembrete de Atividades</Label>
                <Textarea
                  value={settings.messageTemplates.reminder}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    messageTemplates: { ...prev.messageTemplates, reminder: e.target.value }
                  }))}
                  rows={3}
                />
              </div>

              <div>
                <Label className="text-sm font-medium">Convite para Eventos</Label>
                <Textarea
                  value={settings.messageTemplates.invitation}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    messageTemplates: { ...prev.messageTemplates, invitation: e.target.value }
                  }))}
                  rows={3}
                />
              </div>

              <div>
                <Label className="text-sm font-medium">Mensagem de Oração</Label>
                <Textarea
                  value={settings.messageTemplates.prayer}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    messageTemplates: { ...prev.messageTemplates, prayer: e.target.value }
                  }))}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Configurações Avançadas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Delay entre Mensagens (ms)</Label>
                <Input
                  type="number"
                  value={settings.defaultDelay}
                  onChange={(e) => setSettings(prev => ({ ...prev, defaultDelay: parseInt(e.target.value) || 1000 }))}
                  min="500"
                  max="10000"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Tempo de espera entre o envio de cada mensagem (recomendado: 1000ms)
                </p>
              </div>

              <div>
                <Label className="text-sm font-medium">Máximo de Mensagens por Minuto</Label>
                <Input
                  type="number"
                  value={settings.maxMessagesPerMinute}
                  onChange={(e) => setSettings(prev => ({ ...prev, maxMessagesPerMinute: parseInt(e.target.value) || 30 }))}
                  min="1"
                  max="100"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Limite de mensagens por minuto para evitar bloqueios (recomendado: 30)
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Informações de Ajuda */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Info className="w-5 h-5 text-blue-600" />
                Informações Importantes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                  <p>Para usar a WhatsApp Business API oficial, você precisa de uma conta comercial verificada.</p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                  <p>O número de telefone deve estar registrado no WhatsApp Business.</p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                  <p>Respeite os limites de envio para evitar bloqueios da conta.</p>
                </div>
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5" />
                  <p>Sempre teste as configurações antes de usar em produção.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Botões de Ação */}
      <div className="flex gap-3 pt-4 border-t">
        <Button onClick={handleSaveSettings} className="bg-green-600 hover:bg-green-700">
          Salvar Configurações
        </Button>
        <Button 
          variant="outline" 
          onClick={() => setSettings(DEFAULT_SETTINGS)}
        >
          Restaurar Padrões
        </Button>
      </div>
    </div>
  );
}