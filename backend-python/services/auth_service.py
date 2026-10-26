import re
import bcrypt
from datetime import datetime
from config import Config
from db import query_one, get_db_cursor
from services.otp_service import (
    create_pending_verification,
    check_and_verify_otp,
    validate_registration_authorization
)
from services.email_service import (
    send_otp_email,
    EmailConfigurationError,
    EmailConnectionError,
    EmailTLSHandshakeError,
    EmailAuthenticationError,
    EmailDeliveryError,
    EmailRecipientRejectedError
)
from services.email_validator import (
    validate_email_for_otp,
    validate_email_syntax
)

def is_valid_email(email: str) -> bool:
    is_valid, _, _, _ = validate_email_syntax(email)
    return is_valid

def request_registration_otp(email: str) -> dict:
    """
    Step A: Validate email format & DNS mail routing, check duplicates, generate secure OTP, and dispatch email.
    """
    if not email or not isinstance(email, str) or not email.strip():
        return {"success": False, "message": "Please provide a valid email address.", "status_code": 400}

    is_valid, val_err, clean_email = validate_email_for_otp(email)
    if not is_valid:
        return {"success": False, "message": val_err, "status_code": 400}

    # Check whether user is already registered in users table
    existing = query_one(
        "SELECT id, is_verified FROM users WHERE LOWER(email) = %s;",
        (clean_email,)
    )
    if existing and existing.get('is_verified', True) is not False:
        return {
            "success": False,
            "message": "An account with this email already exists. Please sign in instead.",
            "status_code": 409
        }

    # Generate OTP with cooldown check
    otp, cooldown_left = create_pending_verification(clean_email)
    if cooldown_left > 0:
        return {
            "success": False,
            "message": f"Please wait {cooldown_left} second(s) before requesting a new code.",
            "cooldown_remaining": cooldown_left,
            "status_code": 429
        }

    # Local Demo Mode: generate and hash OTP securely, print to terminal only (never call SMTP)
    if Config.OTP_MODE == 'local_demo':
        if Config.IS_PRODUCTION:
            return {
                "success": False,
                "message": "Security Error: Local demo OTP mode is not allowed in production environments.",
                "status_code": 403
            }

        print("\n" + "=" * 60, flush=True)
        print(" [AI WELFARE COPILOT - LOCAL DEMO OTP]", flush=True)
        print(f" Recipient:        {clean_email}", flush=True)
        print(f" Verification OTP: {otp}", flush=True)
        print(f" Expiry Window:    {Config.OTP_EXPIRY_MINUTES} minutes", flush=True)
        print(" Note: Local demo mode is active. Enter this OTP in your browser.", flush=True)
        print("=" * 60 + "\n", flush=True)

        return {
            "success": True,
            "message": "Demo mode: check the local backend terminal for your OTP.",
            "is_demo_mode": True,
            "expires_in_minutes": Config.OTP_EXPIRY_MINUTES,
            "cooldown_seconds": Config.RESEND_COOLDOWN_SECONDS,
            "status_code": 200
        }

    # Email Mode: Dispatch OTP via Gmail SMTP
    try:
        send_otp_email(clean_email, otp, Config.OTP_EXPIRY_MINUTES)
    except EmailConfigurationError as e:
        return {
            "success": False,
            "message": str(e),
            "status_code": 500
        }
    except EmailAuthenticationError as e:
        return {
            "success": False,
            "message": str(e),
            "status_code": 401
        }
    except EmailRecipientRejectedError as e:
        return {
            "success": False,
            "message": str(e),
            "status_code": 400
        }
    except EmailConnectionError as e:
        return {
            "success": False,
            "message": "Unable to connect to the email server. Please check internet access or try again shortly.",
            "status_code": 503
        }
    except EmailTLSHandshakeError as e:
        return {
            "success": False,
            "message": "Secure TLS connection could not be established with the mail server.",
            "status_code": 502
        }
    except EmailDeliveryError as e:
        return {
            "success": False,
            "message": str(e),
            "status_code": 502
        }
    except Exception as e:
        return {
            "success": False,
            "message": "Email delivery could not be confirmed at this time. Please check your email address or try again shortly.",
            "status_code": 500
        }

    return {
        "success": True,
        "message": f"A 6-digit verification code has been dispatched to {clean_email}.",
        "is_demo_mode": False,
        "expires_in_minutes": Config.OTP_EXPIRY_MINUTES,
        "cooldown_seconds": Config.RESEND_COOLDOWN_SECONDS,
        "status_code": 200
    }

def verify_registration_otp(email: str, otp: str) -> dict:
    """
    Step B: Validate submitted OTP code against pending verification hash.
    """
    if not email or not otp:
        return {
            "success": False,
            "message": "Email and verification code are required.",
            "status_code": 400
        }

    res = check_and_verify_otp(email, otp)
    res["status_code"] = 200 if res["success"] else 400
    return res

def complete_registration(
    email: str,
    password: str,
    full_name: str,
    state: str = "Maharashtra",
    district: str = "Pune",
    verification_token: str = None
) -> dict:
    """
    Step C: Complete registration inside a transactional boundary.
    Validates email verification state, creates user and initial citizen profile.
    """
    if not is_valid_email(email):
        return {"success": False, "message": "Invalid email address.", "status_code": 400}

    if not password or len(password) < 6:
        return {"success": False, "message": "Password must be at least 6 characters long.", "status_code": 400}

    if not full_name or not full_name.strip():
        return {"success": False, "message": "Full name is required.", "status_code": 400}

    clean_email = email.lower().strip()
    clean_name = full_name.strip()
    clean_state = (state or "Maharashtra").strip()
    clean_district = (district or "Pune").strip()

    # Validate verification authorization
    is_valid_auth, auth_err, record_id = validate_registration_authorization(
        clean_email, verification_token
    )
    if not is_valid_auth:
        return {
            "success": False,
            "message": auth_err,
            "status_code": 403
        }

    # Hash password using bcrypt (10 rounds)
    hashed_bytes = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt(10))
    password_hash = hashed_bytes.decode('utf-8')

    # Atomic PostgreSQL transaction for user and profile insertion
    with get_db_cursor(commit=True) as cur:
        # Prevent concurrent race conditions with pessimistic locking
        cur.execute(
            "SELECT id FROM users WHERE LOWER(email) = %s FOR UPDATE;",
            (clean_email,)
        )
        if cur.fetchone():
            return {
                "success": False,
                "message": "An account with this email address already exists.",
                "status_code": 409
            }

        # Insert user into users table
        cur.execute(
            """
            INSERT INTO users (
                full_name, email, password_hash, role, is_active, is_verified, created_at, updated_at
            ) VALUES (%s, %s, %s, 'citizen', TRUE, TRUE, NOW(), NOW())
            RETURNING id, full_name, email, role, is_active, is_verified, created_at, updated_at;
            """,
            (clean_name, clean_email, password_hash)
        )
        new_user = dict(cur.fetchone())

        # Insert matching citizen profile record
        cur.execute(
            """
            INSERT INTO user_profiles (
                user_id, age, gender, state, district, occupation,
                education, annual_income, category, disability_status,
                created_at, updated_at
            ) VALUES (
                %s, 30, 'Male', %s, %s, 'Farmer',
                'Secondary Education', 0.00, 'General', 'No',
                NOW(), NOW()
            );
            """,
            (new_user['id'], clean_state, clean_district)
        )

        # Consume verification authorization
        if record_id:
            cur.execute(
                "UPDATE email_verifications SET consumed_at = NOW() WHERE id = %s;",
                (record_id,)
            )

    return {
        "success": True,
        "message": "Registration completed successfully.",
        "user": new_user,
        "status_code": 201
    }

def login_user(email: str, password: str) -> dict:
    """
    Authenticates user, verifies password hash, confirms verification and active status.
    """
    if not email or not password:
        return {
            "success": False,
            "message": "Please provide email and password.",
            "status_code": 400
        }

    clean_email = email.lower().strip()

    user = query_one(
        "SELECT * FROM users WHERE LOWER(email) = %s;",
        (clean_email,)
    )

    if not user:
        return {
            "success": False,
            "message": "Invalid email or password.",
            "status_code": 401
        }

    # Verify active status
    if not user.get('is_active', True):
        return {
            "success": False,
            "message": "Your account has been deactivated or suspended. Please contact support.",
            "status_code": 403
        }

    # Verify bcrypt password hash
    stored_hash = user.get('password_hash')
    if not stored_hash or not bcrypt.checkpw(password.encode('utf-8'), stored_hash.encode('utf-8')):
        return {
            "success": False,
            "message": "Invalid email or password.",
            "status_code": 401
        }

    # Verify email confirmation status
    if user.get('is_verified') is False:
        return {
            "success": False,
            "message": "Your email address has not been verified. Please verify your email before logging in.",
            "status_code": 403,
            "is_unverified": True
        }

    # Update last login timestamp
    with get_db_cursor(commit=True) as cur:
        cur.execute("UPDATE users SET last_login = NOW() WHERE id = %s;", (user['id'],))

    # Strip password hash before returning
    user_dict = dict(user)
    user_dict.pop('password_hash', None)

    return {
        "success": True,
        "user": user_dict,
        "status_code": 200
    }
