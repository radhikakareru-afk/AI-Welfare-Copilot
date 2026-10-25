import smtplib
import ssl
import socket
import logging
from email.message import EmailMessage
from config import Config

logger = logging.getLogger("email_service")

class EmailError(Exception):
    """Base exception for all email-related errors."""
    pass

class EmailConfigurationError(EmailError):
    """Raised when SMTP credentials or settings are missing/invalid."""
    pass

class EmailConnectionError(EmailError):
    """Raised when connecting to the SMTP host/port fails or times out."""
    pass

class EmailTLSHandshakeError(EmailError):
    """Raised when STARTTLS or TLS security negotiation fails."""
    pass

class EmailAuthenticationError(EmailError):
    """Raised when SMTP authentication is rejected by the mail server."""
    pass

class EmailDeliveryError(EmailError):
    """Raised when message dispatch or recipient delivery fails."""
    pass

class EmailRecipientRejectedError(EmailDeliveryError):
    """Raised when the mail server explicitly rejects the recipient address as invalid/unreachable."""
    pass

def mask_email(email_str: str) -> str:
    """Safely mask an email address for diagnostic logs (e.g. j***@example.com)."""
    if not email_str or "@" not in email_str:
        return "[invalid-email]"
    user_part, domain_part = email_str.split("@", 1)
    if len(user_part) <= 2:
        masked_user = user_part[:1] + "*"
    else:
        masked_user = user_part[:2] + "*" * (len(user_part) - 2)
    return f"{masked_user}@{domain_part}"

def send_otp_email(to_email: str, otp_code: str, expiry_minutes: int = 5) -> bool:
    """
    Sends an email verification OTP via Gmail SMTP using TLS.
    
    Steps:
      1. Connect with smtplib.SMTP("smtp.gmail.com", 587, timeout=20)
      2. Initial ehlo()
      3. starttls(context=ssl.create_default_context())
      4. Post-TLS ehlo()
      5. login(sender_email, app_password)
      6. send_message(msg)
      7. quit()
    """
    if not Config.SMTP_EMAIL or not Config.SMTP_APP_PASSWORD:
        logger.error("Email dispatch aborted: SMTP credentials are not configured in backend-python/.env")
        raise EmailConfigurationError(
            "Gmail SMTP credentials are not configured in backend-python/.env. "
            "Please configure SMTP_EMAIL and SMTP_APP_PASSWORD (16-character Google App Password)."
        )

    sender_email = Config.SMTP_EMAIL
    app_password = Config.SMTP_APP_PASSWORD
    sender_name = "AI Welfare Copilot"
    subject = f"{otp_code} is your AI Welfare Copilot Verification Code"
    masked_recipient = mask_email(to_email)
    masked_sender = mask_email(sender_email)

    # Plain-text fallback
    text_content = (
        f"Hello,\n\n"
        f"Your verification code for AI Welfare Copilot is: {otp_code}\n\n"
        f"This code will expire in {expiry_minutes} minutes. Please do not share this code with anyone.\n\n"
        f"If you did not request this verification code, please ignore this email.\n\n"
        f"— AI Welfare Copilot Team"
    )

    # Branded HTML email template
    html_content = f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verification Code - AI Welfare Copilot</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 24px; color: #1e293b;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0">
    <tr>
      <td align="center">
        <table width="100%" max-width="540" style="max-width: 540px; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #1e3a8a 0%, #0d9488 100%); padding: 32px 24px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">
                AI Welfare <span style="color: #fdba74;">Copilot</span>
              </h1>
              <p style="color: #e2e8f0; margin: 6px 0 0 0; font-size: 13px; font-weight: 500;">
                Personalized Government Scheme Eligibility & Assistance
              </p>
            </td>
          </tr>
          
          <!-- Content Body -->
          <tr>
            <td style="padding: 32px 28px;">
              <h2 style="margin: 0 0 12px 0; font-size: 18px; font-weight: 700; color: #0f172a;">
                Verify Your Email Address
              </h2>
              <p style="margin: 0 0 24px 0; font-size: 14px; line-height: 1.6; color: #475569;">
                Thank you for registering on <strong>AI Welfare Copilot</strong>. Please use the verification code below to confirm your email address and activate your citizen account.
              </p>
              
              <!-- OTP Box -->
              <div style="background-color: #f8fafc; border: 2px dashed #0d9488; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 24px;">
                <span style="font-family: 'Courier New', Courier, monospace; font-size: 34px; font-weight: 800; letter-spacing: 8px; color: #0f172a;">
                  {otp_code}
                </span>
                <p style="margin: 8px 0 0 0; font-size: 12px; color: #64748b; font-weight: 600;">
                  Valid for {expiry_minutes} minutes
                </p>
              </div>
              
              <!-- Warning/Security Note -->
              <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px 16px; border-radius: 6px; margin-bottom: 24px;">
                <p style="margin: 0; font-size: 12px; line-height: 1.5; color: #92400e;">
                  <strong>Security Reminder:</strong> Never share this code with anyone. Official AI Welfare Copilot representatives will never ask for your verification code.
                </p>
              </div>
              
              <p style="margin: 0; font-size: 13px; line-height: 1.5; color: #64748b;">
                If you did not initiate this request, you can safely ignore this email.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 20px 24px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0; font-size: 11px; color: #94a3b8;">
                AI Welfare Copilot Platform &copy; 2026. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
"""

    # Build EmailMessage
    msg = EmailMessage()
    msg["Subject"] = subject
    msg["From"] = f"{sender_name} <{sender_email}>"
    msg["To"] = to_email
    msg.set_content(text_content)
    msg.add_alternative(html_content, subtype="html")

    server = None
    try:
        # Step 1: TCP Connection
        logger.info("Connecting to SMTP server at %s:%s (timeout=20s) for recipient %s...", Config.SMTP_HOST, Config.SMTP_PORT, masked_recipient)
        try:
            server = smtplib.SMTP(Config.SMTP_HOST, Config.SMTP_PORT, timeout=20)
            logger.info("TCP connection established successfully with %s:%s", Config.SMTP_HOST, Config.SMTP_PORT)
        except (socket.timeout, TimeoutError) as e:
            logger.error("Connection to %s:%s timed out after 20 seconds", Config.SMTP_HOST, Config.SMTP_PORT)
            raise EmailConnectionError(
                f"Connection to Gmail SMTP server at {Config.SMTP_HOST}:{Config.SMTP_PORT} timed out. "
                "Please verify network access and ensure outbound traffic on port 587 is permitted by your firewall."
            ) from e
        except (socket.gaierror, ConnectionRefusedError, OSError) as e:
            logger.error("Failed to reach %s:%s: %s", Config.SMTP_HOST, Config.SMTP_PORT, type(e).__name__)
            raise EmailConnectionError(
                f"Failed to connect to Gmail SMTP server at {Config.SMTP_HOST}:{Config.SMTP_PORT} ({type(e).__name__}). "
                "Please check DNS resolution, internet connectivity, and firewall configuration."
            ) from e

        # Step 2: Initial EHLO
        logger.debug("Sending initial EHLO greeting...")
        try:
            server.ehlo()
        except smtplib.SMTPException as e:
            logger.error("Initial EHLO handshake rejected: %s", type(e).__name__)
            raise EmailTLSHandshakeError(f"Initial SMTP handshake (EHLO) failed: {e}") from e

        # Step 3: STARTTLS with default SSL context
        logger.info("Upgrading connection with STARTTLS using default SSL context...")
        try:
            context = ssl.create_default_context()
            server.starttls(context=context)
            logger.info("TLS security negotiation completed successfully")
        except (ssl.SSLError, smtplib.SMTPException) as e:
            logger.error("TLS negotiation failed with %s:%s: %s", Config.SMTP_HOST, Config.SMTP_PORT, type(e).__name__)
            raise EmailTLSHandshakeError(f"TLS security negotiation failed with {Config.SMTP_HOST}:{Config.SMTP_PORT}: {e}") from e

        # Step 4: Post-TLS EHLO
        logger.debug("Sending post-TLS EHLO greeting...")
        try:
            server.ehlo()
        except smtplib.SMTPException as e:
            logger.error("Post-TLS EHLO handshake rejected: %s", type(e).__name__)
            raise EmailTLSHandshakeError(f"Post-TLS SMTP handshake (EHLO) failed: {e}") from e

        # Step 5: Authentication
        logger.info("Authenticating with Gmail SMTP as %s...", masked_sender)
        try:
            server.login(sender_email, app_password)
            logger.info("Gmail SMTP authentication successful for %s", masked_sender)
        except smtplib.SMTPAuthenticationError as e:
            logger.error("Gmail SMTP authentication rejected for %s (code: %s)", masked_sender, e.smtp_code)
            raise EmailAuthenticationError(
                "Gmail SMTP authentication failed. Google rejected the username or App Password. "
                "Please verify that 2-Step Verification is enabled in your Google Account and generate a 16-character App Password at "
                "https://myaccount.google.com/apppasswords."
            ) from e
        except smtplib.SMTPServerDisconnected as e:
            # Gmail closes the socket when invalid credentials (535 Bad Credentials) are passed during AUTH PLAIN
            logger.error("SMTP server disconnected during authentication for %s. Google drops the socket when credentials are invalid (535 Bad Credentials).", masked_sender)
            raise EmailAuthenticationError(
                "Gmail SMTP authentication failed (server disconnected during login). "
                "Google typically closes the connection when the App Password is invalid, revoked, or typed incorrectly. "
                "Please verify your SMTP_EMAIL and generate a fresh 16-character App Password at https://myaccount.google.com/apppasswords."
            ) from e
        except smtplib.SMTPException as e:
            logger.error("SMTP authentication error for %s: %s", masked_sender, type(e).__name__)
            raise EmailAuthenticationError(f"SMTP authentication error: {e}") from e

        # Step 6: Dispatch Message
        logger.info("Sending message to recipient %s...", masked_recipient)
        try:
            server.send_message(msg, from_addr=sender_email, to_addrs=[to_email])
            logger.info("Verification email successfully accepted by Gmail SMTP for delivery to %s", masked_recipient)
        except smtplib.SMTPRecipientsRefused as e:
            refusal_info = e.recipients.get(to_email) if isinstance(getattr(e, 'recipients', None), dict) else ()
            code = refusal_info[0] if (refusal_info and len(refusal_info) > 0) else 550
            msg_bytes = refusal_info[1] if (refusal_info and len(refusal_info) > 1) else b"Address rejected"
            msg_str = msg_bytes.decode('utf-8', errors='replace') if isinstance(msg_bytes, bytes) else str(msg_bytes)
            logger.error("Recipient address rejected by mail server with code %s: %s", code, msg_str)
            raise EmailRecipientRejectedError(
                f"The recipient email address was rejected by the mail server as invalid or unreachable ({code}). "
                "Please check that the address is spelled correctly."
            ) from e
        except smtplib.SMTPSenderRefused as e:
            logger.error("Sender address rejected: %s", e)
            raise EmailDeliveryError("Mail delivery configuration issue: sender address rejected.") from e
        except smtplib.SMTPDataError as e:
            logger.error("SMTP data transmission error: %s", e)
            if getattr(e, 'smtp_code', None) in (550, 551, 552, 553, 554):
                raise EmailRecipientRejectedError(
                    "The recipient email address could not be delivered to by the mail server. "
                    "Please verify the email address."
                ) from e
            raise EmailDeliveryError(
                "Email delivery could not be confirmed at this time. Please check your email address or try again shortly."
            ) from e
        except (smtplib.SMTPException, socket.error) as e:
            logger.error("Message delivery failed or uncertain: %s", type(e).__name__)
            raise EmailDeliveryError(
                "Email delivery could not be confirmed at this time due to a network communication issue. "
                "Please check your email address or try again shortly."
            ) from e

        # Step 7: Clean Session Termination
        try:
            server.quit()
        except Exception:
            pass

        return True

    finally:
        if server:
            try:
                server.close()
            except Exception:
                pass
