const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mysql = require('mysql2/promise');
const { Pool } = require('pg');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware de segurança
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-domain.com'] 
    : ['http://localhost:8080', 'http://localhost:5173'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// Middleware de autenticação simples
const authenticateUser = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ 
      success: false, 
      error: 'Token de autenticação necessário' 
    });
  }

  // Em produção, você deve validar o token JWT aqui
  // Por simplicidade, vamos apenas verificar se existe
  const token = authHeader.substring(7);
  if (!token) {
    return res.status(401).json({ 
      success: false, 
      error: 'Token inválido' 
    });
  }

  next();
};

// Função para salvar configurações em arquivo
const saveDbConfig = async (config) => {
  const configPath = path.join(__dirname, 'db-config.json');
  try {
    await fs.writeFile(configPath, JSON.stringify(config, null, 2));
    console.log('✅ Configurações do banco salvas com sucesso');
  } catch (error) {
    console.error('❌ Erro ao salvar configurações:', error);
    throw error;
  }
};

// Função para carregar configurações
const loadDbConfig = async () => {
  const configPath = path.join(__dirname, 'db-config.json');
  try {
    const data = await fs.readFile(configPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.log('ℹ️ Nenhuma configuração de banco encontrada');
    return null;
  }
};

// Função para testar conexão MySQL
const testMySQLConnection = async (config) => {
  const connection = await mysql.createConnection({
    host: config.hostname,
    user: config.username,
    password: config.password,
    database: config.database,
    port: config.port || 3306,
    connectTimeout: 10000,
    acquireTimeout: 10000
  });

  await connection.ping();
  await connection.end();
  
  return { success: true, message: 'Conexão MySQL estabelecida com sucesso' };
};

// Função para testar conexão PostgreSQL
const testPostgreSQLConnection = async (config) => {
  const pool = new Pool({
    host: config.hostname,
    user: config.username,
    password: config.password,
    database: config.database,
    port: config.port || 5432,
    connectionTimeoutMillis: 10000,
    idleTimeoutMillis: 10000,
    max: 1
  });

  const client = await pool.connect();
  await client.query('SELECT NOW()');
  client.release();
  await pool.end();
  
  return { success: true, message: 'Conexão PostgreSQL estabelecida com sucesso' };
};

// Rota para configurar banco de dados
app.post('/api/config-db', authenticateUser, async (req, res) => {
  const startTime = Date.now();
  
  try {
    const { hostname, username, password, database, dbType, port } = req.body;

    // Validação dos campos obrigatórios
    if (!hostname || !username || !password || !database || !dbType) {
      console.log('❌ Validação falhou - campos obrigatórios ausentes');
      return res.status(400).json({
        success: false,
        error: 'Todos os campos são obrigatórios: hostname, username, password, database, dbType'
      });
    }

    // Validação do tipo de banco
    if (!['mysql', 'postgresql'].includes(dbType)) {
      console.log('❌ Tipo de banco inválido:', dbType);
      return res.status(400).json({
        success: false,
        error: 'Tipo de banco deve ser "mysql" ou "postgresql"'
      });
    }

    console.log(`🔄 Iniciando teste de conexão ${dbType.toUpperCase()}...`);
    console.log(`📍 Host: ${hostname}:${port || (dbType === 'mysql' ? 3306 : 5432)}`);
    console.log(`👤 Usuário: ${username}`);
    console.log(`🗄️ Banco: ${database}`);

    const config = {
      hostname,
      username,
      password,
      database,
      dbType,
      port: port || (dbType === 'mysql' ? 3306 : 5432),
      configuredAt: new Date().toISOString()
    };

    let testResult;

    // Testar conexão baseado no tipo de banco
    if (dbType === 'mysql') {
      testResult = await testMySQLConnection(config);
    } else if (dbType === 'postgresql') {
      testResult = await testPostgreSQLConnection(config);
    }

    // Salvar configurações se a conexão foi bem-sucedida
    await saveDbConfig(config);

    const duration = Date.now() - startTime;
    console.log(`✅ Configuração de banco ${dbType.toUpperCase()} realizada com sucesso em ${duration}ms`);

    res.json({
      success: true,
      message: testResult.message,
      dbType: dbType.toUpperCase(),
      hostname,
      database,
      configuredAt: config.configuredAt,
      connectionTime: `${duration}ms`
    });

  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`❌ Erro na configuração do banco (${duration}ms):`, error.message);
    
    // Log detalhado do erro para debugging
    if (error.code) {
      console.error(`🔍 Código do erro: ${error.code}`);
    }
    if (error.errno) {
      console.error(`🔍 Errno: ${error.errno}`);
    }

    let errorMessage = 'Erro ao conectar com o banco de dados';
    
    // Mensagens de erro mais específicas
    if (error.code === 'ECONNREFUSED') {
      errorMessage = 'Conexão recusada. Verifique se o banco está rodando e o hostname/porta estão corretos.';
    } else if (error.code === 'ENOTFOUND') {
      errorMessage = 'Hostname não encontrado. Verifique o endereço do servidor.';
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR' || error.code === '28P01') {
      errorMessage = 'Acesso negado. Verifique o usuário e senha.';
    } else if (error.code === 'ER_BAD_DB_ERROR' || error.code === '3D000') {
      errorMessage = 'Banco de dados não encontrado. Verifique o nome do banco.';
    } else if (error.message) {
      errorMessage = error.message;
    }

    res.status(500).json({
      success: false,
      error: errorMessage,
      code: error.code || 'UNKNOWN_ERROR',
      connectionTime: `${duration}ms`
    });
  }
});

// Rota para obter configuração atual
app.get('/api/config-db', authenticateUser, async (req, res) => {
  try {
    const config = await loadDbConfig();
    
    if (!config) {
      return res.json({
        success: true,
        configured: false,
        message: 'Nenhuma configuração de banco encontrada'
      });
    }

    // Retornar configuração sem a senha
    const { password, ...safeConfig } = config;
    
    res.json({
      success: true,
      configured: true,
      config: safeConfig
    });

  } catch (error) {
    console.error('❌ Erro ao carregar configuração:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao carregar configuração do banco'
    });
  }
});

// Rota para testar conexão atual
app.post('/api/test-db', authenticateUser, async (req, res) => {
  try {
    const config = await loadDbConfig();
    
    if (!config) {
      return res.status(400).json({
        success: false,
        error: 'Nenhuma configuração de banco encontrada'
      });
    }

    console.log(`🔄 Testando conexão existente ${config.dbType.toUpperCase()}...`);

    let testResult;
    if (config.dbType === 'mysql') {
      testResult = await testMySQLConnection(config);
    } else if (config.dbType === 'postgresql') {
      testResult = await testPostgreSQLConnection(config);
    }

    console.log('✅ Teste de conexão bem-sucedido');

    res.json({
      success: true,
      message: testResult.message,
      dbType: config.dbType.toUpperCase(),
      hostname: config.hostname,
      database: config.database
    });

  } catch (error) {
    console.error('❌ Erro no teste de conexão:', error.message);
    
    res.status(500).json({
      success: false,
      error: error.message || 'Erro ao testar conexão com o banco'
    });
  }
});

// Middleware de tratamento de erros
app.use((error, req, res, next) => {
  console.error('❌ Erro não tratado:', error);
  res.status(500).json({
    success: false,
    error: 'Erro interno do servidor'
  });
});

// Rota de health check
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Servidor funcionando',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`🌍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📅 Iniciado em: ${new Date().toISOString()}`);
});

module.exports = app;