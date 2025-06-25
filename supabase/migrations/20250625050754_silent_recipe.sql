/*
  # Inserir igrejas iniciais

  1. Inserir igrejas padrão do sistema
    - Armour
    - Dom Pedrito
    - Quaraí
    - Santana do Livramento
    - Argeni
    - Parque São José

  2. Todas as igrejas serão criadas como ativas por padrão
*/

-- Inserir igrejas iniciais (usando INSERT ... ON CONFLICT para evitar duplicatas)
INSERT INTO igrejas (nome, ativa) VALUES
  ('Armour', true),
  ('Dom Pedrito', true),
  ('Quaraí', true),
  ('Santana do Livramento', true),
  ('Argeni', true),
  ('Parque São José', true)
ON CONFLICT (nome) DO NOTHING;

-- Verificar se as igrejas foram inseridas
DO $$
DECLARE
    igreja_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO igreja_count FROM igrejas;
    RAISE NOTICE 'Total de igrejas após inserção: %', igreja_count;
    
    -- Listar todas as igrejas
    FOR igreja_count IN 
        SELECT nome FROM igrejas ORDER BY nome
    LOOP
        RAISE NOTICE 'Igreja encontrada: %', igreja_count;
    END LOOP;
END $$;