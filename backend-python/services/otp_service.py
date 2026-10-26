import secrets
import string
import hashlib
import hmac
from datetime import datetime, timedelta, timezone
from config import Config
from db import query_one, execute, get_db_cursor

def generate_secure_otp(length: int = 6) -> str:
    """Generate a cryptographically secure numeric OTP."""
    digits = string.digits
    return ''.join(secrets.choice(digits) for _ in range(length))

def hash_otp(email: str, otp: str) -> str:
    """Hash the OTP with email and server secret using HMAC-SHA256."""
    key = Config.SECRET_KEY.encode('utf-8')
    data = f"{email.lower().strip()}:{otp}".encode('utf-8')
    return hmac.new(key, data, hashlib.sha256).hexdigest()

def verify_otp_hash(email: str, submitted_otp: str, stored_hash: str) -> bool:
    """Safely verify OTP hash in constant time."""
    computed_hash = hash_otp(email, submitted_otp)
    return hmac.compare_digest(computed_hash, stored_hash)

def create_pending_verification(email: str) -> tuple[str, int]:
    """
    Creates a new pending verification request in the database.
    Enforces cooldown and returns (plain_otp, cooldown_remaining_seconds).
    
    Returns:
        tuple (otp_to_send, cooldown_remaining)
        If cooldown_remaining > 0, OTP is not regenerated and must wait.
    """
    clean_email = email.lower().strip()
    now = datetime.now()

    # Check the most recent verification request for resend cooldown
    recent = query_one(
        """
        SELECT created_at FROM email_verifications
        WHERE email = %s AND consumed_at IS NULL
        ORDER BY created_at DESC LIMIT 1;
        """,
        (clean_email,)
    )

    if recent and recent['created_at']:
        elapsed = (now - recent['created_at']).total_seconds()
        if elapsed < Config.RESEND_COOLDOWN_SECONDS:
            cooldown_left = int(Config.RESEND_COOLDOWN_SECONDS - elapsed)
            return None, cooldown_left

    # Generate new secure 6-digit OTP
    otp = generate_secure_otp(6)
    hashed = hash_otp(clean_email, otp)
    expires_at = now + timedelta(minutes=Config.OTP_EXPIRY_MINUTES)

    # Invalidate prior unconsumed requests for this email
    execute(
        """
        UPDATE email_verifications 
        SET consumed_at = NOW() 
        WHERE email = %s AND consumed_at IS NULL;
        """,
        (clean_email,)
    )

    # Insert fresh pending verification record
    execute(
        """
        INSERT INTO email_verifications (
            email, otp_hash, expires_at, attempt_count, is_verified, created_at
        ) VALUES (%s, %s, %s, 0, FALSE, NOW());
        """,
        (clean_email, hashed, expires_at)
    )

    return otp, 0

def check_and_verify_otp(email: str, submitted_otp: str) -> dict:
    """
    Validates a submitted OTP against the latest active verification record.
    
    Returns:
        dict: {"success": bool, "message": str, "token": str or None}
    """
    clean_email = email.lower().strip()
    submitted_otp = str(submitted_otp).strip()
    now = datetime.now()

    # Fetch active pending verification
    record = query_one(
        """
        SELECT id, otp_hash, expires_at, attempt_count, is_verified, consumed_at
        FROM email_verifications
        WHERE email = %s AND consumed_at IS NULL
        ORDER BY created_at DESC LIMIT 1;
        """,
        (clean_email,)
    )

    if not record:
        return {
            "success": False,
            "message": "No pending verification found. Please request a new verification code."
        }

    # Check if already consumed
    if record['consumed_at']:
        return {
            "success": False,
            "message": "This verification request has already been used. Please request a new code."
        }

    # Check if expired
    if now > record['expires_at']:
        return {
            "success": False,
            "message": "Verification code has expired. Please request a new code."
        }

    # Check maximum attempt threshold
    if record['attempt_count'] >= Config.MAX_OTP_ATTEMPTS:
        execute(
            "UPDATE email_verifications SET consumed_at = NOW() WHERE id = %s;",
            (record['id'],)
        )
        return {
            "success": False,
            "message": "Too many failed attempts. This code is invalidated. Please request a new code."
        }

    # Verify submitted OTP against hash
    is_valid = verify_otp_hash(clean_email, submitted_otp, record['otp_hash'])

    if not is_valid:
        new_attempts = record['attempt_count'] + 1
        execute(
            "UPDATE email_verifications SET attempt_count = %s WHERE id = %s;",
            (new_attempts, record['id'])
        )
        remaining = Config.MAX_OTP_ATTEMPTS - new_attempts
        if remaining <= 0:
            execute(
                "UPDATE email_verifications SET consumed_at = NOW() WHERE id = %s;",
                (record['id'],)
            )
            return {
                "success": False,
                "message": "Incorrect verification code. Maximum attempts reached. Please request a new code."
            }
        return {
            "success": False,
            "message": f"Incorrect verification code. {remaining} attempt(s) remaining."
        }

    # Generate single-use unguessable verification token
    verification_token = secrets.token_urlsafe(32)
    execute(
        """
        UPDATE email_verifications
        SET is_verified = TRUE,
            verified_at = NOW(),
            verification_token = %s
        WHERE id = %s;
        """,
        (verification_token, record['id'])
    )

    return {
        "success": True,
        "message": "Email address verified successfully.",
        "verification_token": verification_token
    }

def validate_registration_authorization(email: str, verification_token: str = None) -> tuple[bool, str, int]:
    """
    Validates whether an email has a verified, unused, and unexpired verification record.
    
    Returns:
        tuple (is_valid, error_message, record_id)
    """
    clean_email = email.lower().strip()
    now = datetime.now()

    if verification_token:
        record = query_one(
            """
            SELECT id, verified_at, consumed_at, is_verified
            FROM email_verifications
            WHERE email = %s AND verification_token = %s AND is_verified = TRUE
            ORDER BY created_at DESC LIMIT 1;
            """,
            (clean_email, verification_token.strip())
        )
    else:
        record = query_one(
            """
            SELECT id, verified_at, consumed_at, is_verified
            FROM email_verifications
            WHERE email = %s AND is_verified = TRUE AND consumed_at IS NULL
            ORDER BY created_at DESC LIMIT 1;
            """,
            (clean_email,)
        )

    if not record or not record['is_verified']:
        return False, "Email address has not been verified. Please complete email OTP verification.", None

    if record['consumed_at']:
        return False, "This verification authorization has already been used for registration.", None

    # Check 15-minute validity window since verification
    if record['verified_at']:
        elapsed = (now - record['verified_at']).total_seconds()
        if elapsed > (Config.VERIFICATION_TOKEN_EXPIRY_MINUTES * 60):
            return False, "Verification authorization has expired. Please verify your email again.", None

    return True, "", record['id']
