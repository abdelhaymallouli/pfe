-- Add OAuth provider tables to the database
ALTER TABLE users ADD COLUMN oauth_provider VARCHAR(20) DEFAULT NULL;
ALTER TABLE users ADD COLUMN oauth_id VARCHAR(255) DEFAULT NULL;
ALTER TABLE users ADD COLUMN oauth_data TEXT DEFAULT NULL;

-- Create index for faster OAuth lookups
CREATE INDEX idx_oauth ON users(oauth_provider, oauth_id);

-- Create table for multiple OAuth providers per user
CREATE TABLE IF NOT EXISTS user_oauth_providers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    provider VARCHAR(20) NOT NULL,
    provider_id VARCHAR(255) NOT NULL,
    provider_data TEXT DEFAULT NULL,
    access_token VARCHAR(255) DEFAULT NULL,
    refresh_token VARCHAR(255) DEFAULT NULL,
    token_expires_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_provider (user_id, provider)
);

-- Add indexes for faster queries
CREATE INDEX idx_provider_id ON user_oauth_providers(provider, provider_id);
