/*
  # Insert initial churches data

  1. New Data
    - Insert initial churches into `igrejas` table:
      - Armour
      - Dom Pedrito
      - Quaraí
      - Santana do Livramento
      - Argeni
      - Parque São José
    
  2. Configuration
    - All churches are set as active (`ativa = true`)
    - Uses `ON CONFLICT DO NOTHING` to prevent duplicate entries if migration runs multiple times
    
  3. Verification
    - Count total churches after insertion
    - List all churches for verification
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
    igreja_nome TEXT;
BEGIN
    SELECT COUNT(*) INTO igreja_count FROM igrejas;
    RAISE NOTICE 'Total de igrejas após inserção: %', igreja_count;
    
    -- Listar todas as igrejas
    FOR igreja_nome IN 
        SELECT nome FROM igrejas ORDER BY nome
    LOOP
        RAISE NOTICE 'Igreja encontrada: %', igreja_nome;
    END LOOP;
END $$;