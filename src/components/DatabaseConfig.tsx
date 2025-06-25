import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

interface DatabaseConfigProps {
  currentUser: any;
}

interface DbConfig {
  hostname: string;
  username: string;
  password: string;
  database: string;
  dbType: 'mysql' | 'postgresql';
  port: number;
  configuredAt?: string;
}

interface ConnectionStatus {
  status: 'idle' | 'testing' | 'success' | 'error';
  message?: string;
  details?: any;
}

export default function DatabaseConfig({ currentUser }: DatabaseConfigProps) {
  const [config, setConfig] = useState<DbConfig>({
    hostname: 'localhost',
    username: '',
    password: '',
    database: '',
    dbType: 'mysql',
    port: 3306
  });

  const [showPassword, setShowPassword] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({ status: 'idle' });
  const [isConfigured, setIsConfigured] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentConfig, setCurrentConfig] = useState<any>(null);
  const { toast } = useToast();

  // Verificar se o usuário é administrador
  if (currentUser?.tipo !== 'administrador') {
    return (
      <div className="text-center py-8">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <Shield className="w-8 h-8 text-red-600" />
          </div>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Acesso Restrito</h3>
        <p className="text-gray-600">Apenas administradores podem configurar o banco de dados.</p>
      </div>
    );
  }

  // Carregar configuração atual ao montar o componente
  useEffect(() => {
    loadCurrentConfig();
  }, []);

  // Atualizar porta padrão quando o tipo de banco mudar
  useEffect(() => {
    setConfig(prev => ({
      ...prev,
      port: prev.dbType === 'mysql' ? 3306 : 5432
    }));
  }, [config.dbType]);

  const getAuthToken = () => {
    // Em produção, você deve usar um token JWT real
    return 'admin-token-' + Date.now();
  };

  const loadCurrentConfig = async () => {
    try {
      const response = await fetch('/api/config-db', {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success && data.configured) {
        setCurrentConfig(data.config);
        setIsConfigured(true);
        setConnectionStatus({ 
          status: 'success', 
          message: `Conectado ao ${data.config.dbType.toUpperCase()}` 
        });
      } else {
        setIsConfigured(false);
        setConnectionStatus({ status: 'idle' });
      }
    } catch (error) {
      console.error('Erro ao carregar configuração:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar configuração do banco de dados.",
        variant: "destructive"
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!config.hostname || !config.username || !config.password || !config.database) {
      toast({
        title: "Erro",
        description: "Todos os campos são obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    setConnectionStatus({ status: 'testing', message: 'Testando conexão...' });

    try {
      const response = await fetch('/api/config-db', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(config)
      });

      const data = await response.json();

      if (data.success) {
        setConnectionStatus({ 
          status: 'success', 
          message: data.message,
          details: {
            dbType: data.dbType,
            hostname: data.hostname,
            database: data.database,
            connectionTime: data.connectionTime
          }
        });
        setIsConfigured(true);
        await loadCurrentConfig();
        
        toast({
          title: "Sucesso!",
          description: `Banco ${data.dbType} configurado com sucesso!`
        });
      } else {
        setConnectionStatus({ 
          status: 'error', 
          message: data.error,
          details: { code: data.code, connectionTime: data.connectionTime }
        });
        
        toast({
          title: "Erro na Conexão",
          description: data.error,
          variant: "destructive"
        });
      }
    } catch (error: any) {
      console.error('Erro na configuração:', error);
      setConnectionStatus({ 
        status: 'error', 
        message: 'Erro de comunicação com o servidor' 
      });
      
      toast({
        title: "Erro",
        description: "Erro de comunicação com o servidor.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const testConnection = async () => {
    setLoading(true);
    setConnectionStatus({ status: 'testing', message: 'Testando conexão atual...' });

    try {
      const response = await fetch('/api/test-db', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        setConnectionStatus({ 
          status: 'success', 
          message: data.message,
          details: {
            dbType: data.dbType,
            hostname: data.hostname,
            database: data.database
          }
        });
        
        toast({
          title: "Conexão OK!",
          description: `Conexão com ${data.dbType} funcionando perfeitamente.`
        });
      } else {
        setConnectionStatus({ 
          status: 'error', 
          message: data.error 
        });
        
        toast({
          title: "Erro na Conexão",
          description: data.error,
          variant: "destructive"
        });
      }
    } catch (error: any) {
      console.error('Erro no teste:', error);
      setConnectionStatus({ 
        status: 'error', 
        message: 'Erro de comunicação com o servidor' 
      });
      
      toast({
        title: "Erro",
        description: "Erro de comunicação com o servidor.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = () => {
    switch (connectionStatus.status) {
      case 'testing':
        return <Badge className="bg-yellow-100 text-yellow-800">Testando...</Badge>;
      case 'success':
        return <Badge className="bg-green-100 text-green-800">Conectado</Badge>;
      case 'error':
        return <Badge className="bg-red-100 text-red-800">Erro</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Não Configurado</Badge>;
    }
  };

  const getStatusIcon = () => {
    switch (connectionStatus.status) {
      case 'testing':
        return <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600"></div>;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Database className="w-4 h-4 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Database className="w-6 h-6 text-blue-600" />
          <div>
            <h2 className="text-xl font-bold text-gray-900">Configuração do Banco de Dados</h2>
            <p className="text-sm text-gray-600">Configure a conexão com o banco de dados do sistema</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {getStatusIcon()}
          {getStatusBadge()}
        </div>
      </div>

      {/* Status Alert */}
      {connectionStatus.message && (
        <Alert className={`${
          connectionStatus.status === 'success' ? 'border-green-200 bg-green-50' :
          connectionStatus.status === 'error' ? 'border-red-200 bg-red-50' :
          'border-yellow-200 bg-yellow-50'
        }`}>
          <div className="flex items-start gap-3">
            {connectionStatus.status === 'success' && <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />}
            {connectionStatus.status === 'error' && <XCircle className="w-5 h-5 text-red-600 mt-0.5" />}
            {connectionStatus.status === 'testing' && <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-yellow-600 mt-0.5"></div>}
            <div className="flex-1">
              <AlertDescription className={`${
                connectionStatus.status === 'success' ? 'text-green-800' :
                connectionStatus.status === 'error' ? 'text-red-800' :
                'text-yellow-800'
              }`}>
                <p className="font-medium">{connectionStatus.message}</p>
                {connectionStatus.details && (
                  <div className="mt-2 text-sm space-y-1">
                    {connectionStatus.details.dbType && (
                      <p>• Tipo: {connectionStatus.details.dbType}</p>
                    )}
                    {connectionStatus.details.hostname && (
                      <p>• Servidor: {connectionStatus.details.hostname}</p>
                    )}
                    {connectionStatus.details.database && (
                      <p>• Banco: {connectionStatus.details.database}</p>
                    )}
                    {connectionStatus.details.connectionTime && (
                      <p>• Tempo de resposta: {connectionStatus.details.connectionTime}</p>
                    )}
                    {connectionStatus.details.code && (
                      <p>• Código do erro: {connectionStatus.details.code}</p>
                    )}
                  </div>
                )}
              </AlertDescription>
            </div>
          </div>
        </Alert>
      )}

      <Tabs defaultValue="config" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="config" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Configuração
          </TabsTrigger>
          <TabsTrigger value="status" className="flex items-center gap-2">
            <Server className="w-4 h-4" />
            Status
          </TabsTrigger>
          <TabsTrigger value="help" className="flex items-center gap-2">
            <Info className="w-4 h-4" />
            Ajuda
          </TabsTrigger>
        </TabsList>

        <TabsContent value="config" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Configurar Conexão</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Tipo de Banco *</Label>
                    <Select 
                      value={config.dbType} 
                      onValueChange={(value) => setConfig(prev => ({ ...prev, dbType: value as 'mysql' | 'postgresql' }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mysql">MySQL</SelectItem>
                        <SelectItem value="postgresql">PostgreSQL</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Porta</Label>
                    <Input
                      type="number"
                      value={config.port}
                      onChange={(e) => setConfig(prev => ({ ...prev, port: parseInt(e.target.value) || 3306 }))}
                      placeholder={config.dbType === 'mysql' ? '3306' : '5432'}
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Hostname/Servidor *</Label>
                  <Input
                    value={config.hostname}
                    onChange={(e) => setConfig(prev => ({ ...prev, hostname: e.target.value }))}
                    placeholder="localhost ou IP do servidor"
                    required
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Usuário *</Label>
                    <Input
                      value={config.username}
                      onChange={(e) => setConfig(prev => ({ ...prev, username: e.target.value }))}
                      placeholder="Nome do usuário do banco"
                      required
                    />
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Nome do Banco *</Label>
                    <Input
                      value={config.database}
                      onChange={(e) => setConfig(prev => ({ ...prev, database: e.target.value }))}
                      placeholder="Nome do banco de dados"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Senha *</Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      value={config.password}
                      onChange={(e) => setConfig(prev => ({ ...prev, password: e.target.value }))}
                      placeholder="Senha do banco de dados"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div className="text-sm text-blue-800">
                      <p className="font-medium mb-1">Informações de Segurança:</p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>As credenciais são criptografadas antes do armazenamento</li>
                        <li>A conexão é testada antes de salvar as configurações</li>
                        <li>Apenas administradores podem acessar esta configuração</li>
                        <li>Em produção, use sempre conexões SSL/TLS</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button 
                    type="submit" 
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Testando...
                      </>
                    ) : (
                      <>
                        <Database className="w-4 h-4 mr-2" />
                        Configurar Banco
                      </>
                    )}
                  </Button>

                  {isConfigured && (
                    <Button 
                      type="button"
                      variant="outline"
                      onClick={testConnection}
                      disabled={loading}
                    >
                      <TestTube className="w-4 h-4 mr-2" />
                      Testar Conexão
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="status" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Status da Conexão</CardTitle>
            </CardHeader>
            <CardContent>
              {currentConfig ? (
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Tipo de Banco</Label>
                      <p className="text-lg font-semibold">{currentConfig.dbType?.toUpperCase()}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Servidor</Label>
                      <p className="text-lg font-semibold">{currentConfig.hostname}:{currentConfig.port}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Banco de Dados</Label>
                      <p className="text-lg font-semibold">{currentConfig.database}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Usuário</Label>
                      <p className="text-lg font-semibold">{currentConfig.username}</p>
                    </div>
                  </div>
                  
                  {currentConfig.configuredAt && (
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Configurado em</Label>
                      <p className="text-sm text-gray-800">
                        {new Date(currentConfig.configuredAt).toLocaleString('pt-BR')}
                      </p>
                    </div>
                  )}

                  <Button 
                    onClick={testConnection}
                    disabled={loading}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <TestTube className="w-4 h-4 mr-2" />
                    Testar Conexão Atual
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Database className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Nenhuma configuração de banco encontrada.</p>
                  <p className="text-sm text-gray-400 mt-2">Configure uma conexão na aba "Configuração".</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="help" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Guia de Configuração</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Tipos de Banco Suportados</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">MySQL</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Porta padrão: 3306</li>
                      <li>• Versões suportadas: 5.7+</li>
                      <li>• Recomendado para aplicações web</li>
                    </ul>
                  </div>
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">PostgreSQL</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Porta padrão: 5432</li>
                      <li>• Versões suportadas: 12+</li>
                      <li>• Ideal para dados complexos</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Exemplos de Configuração</h3>
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Servidor Local</h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>• Hostname: <code className="bg-gray-200 px-1 rounded">localhost</code></p>
                      <p>• Usuário: <code className="bg-gray-200 px-1 rounded">root</code> (MySQL) ou <code className="bg-gray-200 px-1 rounded">postgres</code> (PostgreSQL)</p>
                      <p>• Banco: <code className="bg-gray-200 px-1 rounded">escola_biblica</code></p>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Servidor Remoto</h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>• Hostname: <code className="bg-gray-200 px-1 rounded">192.168.1.100</code> ou <code className="bg-gray-200 px-1 rounded">db.exemplo.com</code></p>
                      <p>• Porta: Especificar se diferente do padrão</p>
                      <p>• Certificar-se de que o firewall permite conexões</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Solução de Problemas</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-gray-900">Conexão Recusada</p>
                      <p className="text-gray-600">Verifique se o banco está rodando e se o hostname/porta estão corretos.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-gray-900">Acesso Negado</p>
                      <p className="text-gray-600">Confirme o usuário e senha. Verifique as permissões do usuário no banco.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-gray-900">Banco Não Encontrado</p>
                      <p className="text-gray-600">Certifique-se de que o banco de dados existe e o nome está correto.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-red-600 mt-0.5" />
                  <div className="text-sm text-red-800">
                    <p className="font-medium mb-1">Importante - Segurança:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Nunca use credenciais de administrador do banco em produção</li>
                      <li>Crie um usuário específico com permissões limitadas</li>
                      <li>Use sempre conexões SSL/TLS em produção</li>
                      <li>Mantenha o banco atualizado com patches de segurança</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}