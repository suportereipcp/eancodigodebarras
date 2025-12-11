-- Create the produtos table for product management
-- This table will store product information with SKU as primary key

CREATE TABLE IF NOT EXISTS produtos (
  sku VARCHAR(50) PRIMARY KEY,
  descricao TEXT NOT NULL,
  codigo_barras VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create an index on codigo_barras for faster searches
CREATE INDEX IF NOT EXISTS idx_produtos_codigo_barras ON produtos(codigo_barras);

-- Create an index on descricao for text searches
CREATE INDEX IF NOT EXISTS idx_produtos_descricao ON produtos USING gin(to_tsvector('portuguese', descricao));

-- Add a trigger to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_produtos_updated_at 
    BEFORE UPDATE ON produtos 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
