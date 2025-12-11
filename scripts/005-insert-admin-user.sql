-- Limpar e recriar usuário admin
DELETE FROM users WHERE username = 'admin';
INSERT INTO users (username, password) VALUES ('admin', 'admin2025');
