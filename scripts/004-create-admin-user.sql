-- Ensure admin user exists
INSERT INTO users (username, password, created_at, updated_at)
VALUES ('admin', 'admin2025', NOW(), NOW())
ON CONFLICT (username) DO NOTHING;
