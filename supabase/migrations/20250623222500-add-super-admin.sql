
-- Inserir super administrador
INSERT INTO public.usuarios (id, nome_completo, apelido, login_acesso, senha, igreja, aprovado)
VALUES (
  gen_random_uuid(),
  'Filipe Peixoto',
  'filipevpeixoto',
  'filipevpeixoto',
  'nina123$$',
  'Armour',
  true
);

-- Inserir permissões completas do super administrador
INSERT INTO public.usuario_permissoes (usuario_id, pode_cadastrar, pode_editar, pode_excluir, pode_exportar)
SELECT id, true, true, true, true 
FROM public.usuarios 
WHERE apelido = 'filipevpeixoto';
