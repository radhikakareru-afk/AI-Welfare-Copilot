import os
from dotenv import load_dotenv

# Load .env file
load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))

class Config:
    # Environment
    ENV = os.getenv('FLASK_ENV', os.getenv('ENV', 'development')).lower().strip()
    IS_PRODUCTION = ENV in ('production', 'prod') or os.getenv('PRODUCTION', 'false').lower().strip() in ('true', '1')

    # OTP Delivery Mode: 'local_demo' or 'email' (default: 'email')
    OTP_MODE = os.getenv('OTP_MODE', 'email').lower().strip()
    if OTP_MODE == 'local_demo' and IS_PRODUCTION:
        raise RuntimeError("Security Violation: OTP_MODE='local_demo' is prohibited in production. Use OTP_MODE=email.")

    # Database configuration
    DB_HOST = os.getenv('DB_HOST', 'localhost')
    DB_PORT = int(os.getenv('DB_PORT', 5432))
    DB_NAME = os.getenv('DB_NAME', 'AI-Welfare-Copilot')
    DB_USER = os.getenv('DB_USER', 'postgres')
    DB_PASSWORD = os.getenv('DB_PASSWORD', '')

    # Flask settings
    PORT = int(os.getenv('FLASK_PORT', 5001))
    DEBUG = os.getenv('FLASK_DEBUG', 'False').lower() in ('true', '1', 't')
    SECRET_KEY = os.getenv('SECRET_KEY', 'default_copilot_secret_key_change_in_prod')
    FRONTEND_URL = os.getenv('FRONTEND_URL', 'http://localhost:5173')

    # Gmail SMTP configuration
    SMTP_HOST = os.getenv('SMTP_HOST', 'smtp.gmail.com')
    SMTP_PORT = int(os.getenv('SMTP_PORT', 587))
    SMTP_EMAIL = os.getenv('SMTP_EMAIL', '').strip()
    SMTP_APP_PASSWORD = os.getenv('SMTP_APP_PASSWORD', '').replace(' ', '').strip()

    # OTP security policy
    OTP_EXPIRY_MINUTES = int(os.getenv('OTP_EXPIRY_MINUTES', 5))
    RESEND_COOLDOWN_SECONDS = int(os.getenv('RESEND_COOLDOWN_SECONDS', 60))
    MAX_OTP_ATTEMPTS = int(os.getenv('MAX_OTP_ATTEMPTS', 5))
    VERIFICATION_TOKEN_EXPIRY_MINUTES = 15
