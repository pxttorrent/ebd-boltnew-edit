
-- Primeiro, vamos verificar se o usuário já existe e removê-lo se necessário
DELETE FROM public.usuario_permissoes WHERE usuario_id IN (
  SELECT id FROM public.usuarios WHERE apelido = 'filipevpeixoto'
);

DELETE FROM public.usuarios WHERE apelido = 'filipevpeixoto';

-- Inserir o super administrador com dados corretos
INSERT INTO public.usuarios (id, nome_completo, apelido, login_acesso, senha, igreja, aprovado)
VALUES (
  gen_random_uuid(),
  'Filipe Peixoto',
  'filipevpeixoto',
  'filipevpeixoto@admin.com',
  'nina123$$',
  'Armour',
  true
);

-- Inserir permissões completas do super administrador
INSERT INTO public.usuario_permissoes (usuario_id, pode_cadastrar, pode_editar, pode_excluir, pode_exportar)
SELECT id, true, true, true, true 
FROM public.usuarios 
WHERE apelido = 'filipevpeixoto';
