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

export const getWhatsAppSettings = (): WhatsAppSettings | null => {
  try {
    const settings = localStorage.getItem('whatsapp_settings');
    return settings ? JSON.parse(settings) : null;
  } catch (error) {
    console.error('Erro ao carregar configurações do WhatsApp:', error);
    return null;
  }
};

export const saveWhatsAppSettings = (settings: WhatsAppSettings): void => {
  try {
    localStorage.setItem('whatsapp_settings', JSON.stringify(settings));
  } catch (error) {
    console.error('Erro ao salvar configurações do WhatsApp:', error);
    throw new Error('Erro ao salvar configurações');
  }
};

export const isWhatsAppEnabled = (): boolean => {
  const settings = getWhatsAppSettings();
  return settings?.enabled || false;
};

export const formatPhoneNumber = (phone: string): string => {
  // Remove formatação e adiciona código do país se necessário
  const cleanNumber = phone.replace(/\D/g, '');
  
  if (cleanNumber.length === 11 && cleanNumber.startsWith('5')) {
    return `55${cleanNumber}`;
  } else if (cleanNumber.length === 10) {
    return `555${cleanNumber}`;
  }
  return `55${cleanNumber}`;
};

export const sendWhatsAppMessage = async (
  phoneNumber: string, 
  message: string, 
  recipientName?: string
): Promise<{ success: boolean; error?: string }> => {
  const settings = getWhatsAppSettings();
  
  if (!settings || !settings.enabled) {
    return { success: false, error: 'WhatsApp não está configurado ou habilitado' };
  }

  if (!settings.apiKey || !settings.phoneNumberId) {
    return { success: false, error: 'Configurações de API incompletas' };
  }

  try {
    const formattedPhone = formatPhoneNumber(phoneNumber);
    const personalizedMessage = recipientName 
      ? message.replace(/{nome}/g, recipientName.split(' ')[0])
      : message;

    // Para desenvolvimento, usar WhatsApp Web URL
    const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(personalizedMessage)}`;
    window.open(whatsappUrl, '_blank');

    return { success: true };

    // Em produção, implementar chamada real para API
    /*
    const response = await fetch(`${settings.apiUrl}/${settings.phoneNumberId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${settings.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: formattedPhone,
        type: 'text',
        text: {
          body: personalizedMessage
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Erro na API: ${response.status}`);
    }

    const result = await response.json();
    return { success: true, messageId: result.messages[0].id };
    */
  } catch (error: any) {
    console.error('Erro ao enviar mensagem WhatsApp:', error);
    return { success: false, error: error.message || 'Erro desconhecido' };
  }
};

export const sendBulkWhatsAppMessages = async (
  recipients: Array<{ phone: string; name: string; message: string }>,
  delay: number = 1000
): Promise<{ sent: number; failed: number; errors: string[] }> => {
  const settings = getWhatsAppSettings();
  
  if (!settings || !settings.enabled) {
    throw new Error('WhatsApp não está configurado ou habilitado');
  }

  let sent = 0;
  let failed = 0;
  const errors: string[] = [];

  for (let i = 0; i < recipients.length; i++) {
    const recipient = recipients[i];
    
    try {
      const result = await sendWhatsAppMessage(
        recipient.phone, 
        recipient.message, 
        recipient.name
      );
      
      if (result.success) {
        sent++;
      } else {
        failed++;
        errors.push(`${recipient.name}: ${result.error}`);
      }
      
      // Delay entre mensagens para evitar rate limiting
      if (i < recipients.length - 1) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    } catch (error: any) {
      failed++;
      errors.push(`${recipient.name}: ${error.message}`);
    }
  }

  return { sent, failed, errors };
};

export const testWhatsAppConnection = async (): Promise<{ success: boolean; error?: string }> => {
  const settings = getWhatsAppSettings();
  
  if (!settings || !settings.enabled) {
    return { success: false, error: 'WhatsApp não está configurado ou habilitado' };
  }

  if (!settings.apiKey || !settings.phoneNumberId) {
    return { success: false, error: 'Configurações de API incompletas' };
  }

  try {
    // Em desenvolvimento, simular teste
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simular sucesso baseado na presença de dados válidos
    const isValid = settings.apiKey.length > 10 && settings.phoneNumberId.length > 10;
    
    if (isValid) {
      return { success: true };
    } else {
      return { success: false, error: 'Credenciais inválidas' };
    }

    // Em produção, implementar teste real
    /*
    const response = await fetch(`${settings.apiUrl}/${settings.phoneNumberId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${settings.accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Erro na API: ${response.status}`);
    }

    return { success: true };
    */
  } catch (error: any) {
    console.error('Erro ao testar conexão WhatsApp:', error);
    return { success: false, error: error.message || 'Erro desconhecido' };
  }
};