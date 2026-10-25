-- Migration: 001_add_email_verifications.sql
-- Description: Adds is_verified column to users and creates email_verifications table.
-- Compatibility: Completely backward-compatible; marks existing users as verified so they are never locked out.

-- 1. Add is_verified column to users table if it doesn't already exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'is_verified'
    ) THEN
        ALTER TABLE users ADD COLUMN is_verified BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- 2. Ensure all existing users are marked as verified (preserves account access for existing citizens and admins)
UPDATE users 
SET is_verified = TRUE 
WHERE is_verified IS FALSE OR is_verified IS NULL;

-- 3. Set default for newly registered users to FALSE (requires OTP verification)
ALTER TABLE users ALTER COLUMN is_verified SET DEFAULT FALSE;

-- 4. Create table for pending email OTP verifications
CREATE TABLE IF NOT EXISTS email_verifications (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    otp_hash VARCHAR(255) NOT NULL,
    verification_token VARCHAR(255),
    expires_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    attempt_count INT DEFAULT 0,
    is_verified BOOLEAN DEFAULT FALSE,
    verified_at TIMESTAMP WITHOUT TIME ZONE,
    consumed_at TIMESTAMP WITHOUT TIME ZONE,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Indexes for fast query lookup
CREATE INDEX IF NOT EXISTS idx_email_verifications_email ON email_verifications(email);
CREATE INDEX IF NOT EXISTS idx_email_verifications_token ON email_verifications(verification_token);
