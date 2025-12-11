-- Ensure admin user exists with correct credentials
-- This script can be run multiple times safely

DO $$
BEGIN
    -- Check if admin user exists
    IF NOT EXISTS (SELECT 1 FROM users WHERE username = 'admin') THEN
        -- Insert admin user if it doesn't exist
        INSERT INTO users (username, password) 
        VALUES ('admin', 'admin2025');
        
        RAISE NOTICE 'Admin user created successfully';
    ELSE
        -- Update admin password if user exists
        UPDATE users 
        SET password = 'admin2025', updated_at = CURRENT_TIMESTAMP 
        WHERE username = 'admin';
        
        RAISE NOTICE 'Admin user password updated';
    END IF;
END $$;

-- Verify admin user exists
SELECT 
    id, 
    username, 
    created_at,
    updated_at
FROM users 
WHERE username = 'admin';
