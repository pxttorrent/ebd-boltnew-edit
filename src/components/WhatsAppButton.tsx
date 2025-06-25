import React from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';

interface WhatsAppButtonProps {
  telefone: string;
  nome: string;
  onWhatsAppClick: (telefone: string, nome: string) => void;
  size?: 'sm' | 'default';
  variant?: 'ghost' | 'outline' | 'default';
  currentUser: any;
}

export default function WhatsAppButton({ 
  telefone, 
  nome, 
  onWhatsAppClick, 
  size = 'sm',
  variant = 'ghost',
  currentUser
}: WhatsAppButtonProps) {
  // Só mostrar para administradores
  if (currentUser?.tipo !== 'administrador') {
    return null;
  }

  const handleClick = () => {
    if (!telefone || telefone.trim() === '') {
      return;
    }
    onWhatsAppClick(telefone, nome);
  };

  const isDisabled = !telefone || telefone.trim() === '';

  return (
    <Button 
      variant={variant}
      size={size}
      className={`text-green-600 hover:text-green-700 hover:bg-green-50 ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      onClick={handleClick}
      disabled={isDisabled}
      title={isDisabled ? 'Telefone não cadastrado' : `Enviar mensagem para ${nome}`}
    >
      <MessageCircle className="w-4 h-4" />
    </Button>
  );
}