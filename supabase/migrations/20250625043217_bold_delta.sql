/*
  # Populate initial churches data

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
    
  3. Notes
    - This resolves the registration error where churches are not found
    - Churches are inserted with proper UUID generation and timestamps
*/

INSERT INTO igrejas (nome, ativa) VALUES
  ('Armour', true),
  ('Dom Pedrito', true),
  ('Quaraí', true),
  ('Santana do Livramento', true),
  ('Argeni', true),
  ('Parque São José', true)
ON CONFLICT (nome) DO NOTHING;