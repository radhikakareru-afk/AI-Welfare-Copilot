import re
import socket
import logging
from config import Config

logger = logging.getLogger("email_validator")

# RFC 5322 / RFC 5321 compliant email patterns
EMAIL_LOCAL_REGEX = re.compile(r"^[a-zA-Z0-9!#$%&'*+/=?^_`{|}~.-]+$")
DNS_LABEL_REGEX = re.compile(r"^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?$")
TLD_REGEX = re.compile(r"^[a-zA-Z]{2,}$")

def validate_email_syntax(email: str) -> tuple[bool, str, str, str]:
    """
    Validates email syntax according to RFC 5321 / RFC 5322.
    
    Returns:
        tuple (is_valid, error_message, local_part, domain_part)
    """
    if not email or not isinstance(email, str):
        return False, "Please provide a valid email address.", "", ""

    clean_email = email.strip()
    if len(clean_email) < 5 or len(clean_email) > 254:
        return False, "Invalid email address or email domain.", "", ""

    if clean_email.count("@") != 1:
        return False, "Invalid email address or email domain.", "", ""

    local_part, domain_part = clean_email.split("@", 1)
    local_part = local_part.strip()
    domain_part = domain_part.strip().lower()

    # Local-part validation (RFC 5321)
    if not local_part or len(local_part) > 64:
        return False, "Invalid email address or email domain.", "", ""

    if local_part.startswith(".") or local_part.endswith(".") or ".." in local_part:
        return False, "Invalid email address or email domain.", "", ""

    if not EMAIL_LOCAL_REGEX.match(local_part):
        return False, "Invalid email address or email domain.", "", ""

    # Domain-part validation (RFC 1035 / RFC 5321)
    if not domain_part or len(domain_part) > 253:
        return False, "Invalid email address or email domain.", "", ""

    if domain_part.startswith(".") or domain_part.endswith(".") or ".." in domain_part:
        return False, "Invalid email address or email domain.", "", ""

    labels = domain_part.split(".")
    if len(labels) < 2:
        return False, "Invalid email address or email domain.", "", ""

    for label in labels:
        if not label or len(label) > 63:
            return False, "Invalid email address or email domain.", "", ""
        if not DNS_LABEL_REGEX.match(label):
            return False, "Invalid email address or email domain.", "", ""

    tld = labels[-1]
    if not TLD_REGEX.match(tld):
        return False, "Invalid email address or email domain.", "", ""

    return True, "", local_part, domain_part

def validate_domain_dns(domain: str) -> tuple[bool, str]:
    """
    Checks whether the email domain has valid mail-routing DNS records.
    
    Checks:
      1. MX records (RFC 5321 Section 5.1).
      2. Rejects RFC 7505 Null MX records (e.g. target '.' indicating no mail accepted).
      3. Fallback to A / AAAA address records if no MX records are present.
      4. Rejects NXDOMAIN (domain does not exist) and domains without mail routing.
    
    Returns:
        tuple (is_valid, error_message)
    """
    clean_domain = domain.strip().lower()

    try:
        import dns.resolver
        resolver = dns.resolver.Resolver()
        # Use public DNS servers first with local system fallback to avoid dead router timeouts
        system_ns = [ns for ns in resolver.nameservers if ns not in ('127.0.0.1', '::1', '8.8.8.8', '1.1.1.1')]
        resolver.nameservers = ['8.8.8.8', '1.1.1.1'] + system_ns
        resolver.timeout = 3.0
        resolver.lifetime = 4.0

        # Step 1: Query MX records
        try:
            answers = resolver.resolve(clean_domain, 'MX')
            exchanges = [str(r.exchange).rstrip('.') for r in answers]
            
            # RFC 7505 Null MX check: single MX with exchange '.'
            if any(ex in ('', '.') for ex in exchanges):
                logger.warning("Domain %s publishes Null MX (RFC 7505) rejecting email.", clean_domain)
                return False, "Invalid email address or email domain."

            return True, ""
        except dns.resolver.NXDOMAIN:
            logger.info("Domain %s does not exist in DNS (NXDOMAIN).", clean_domain)
            return False, "Invalid email address or email domain."
        except dns.resolver.NoAnswer:
            # Step 2: RFC 5321 Section 5.1 fallback: check A or AAAA address records
            logger.info("Domain %s has no MX records; checking A/AAAA fallback...", clean_domain)
            try:
                resolver.resolve(clean_domain, 'A')
                return True, ""
            except (dns.resolver.NoAnswer, dns.resolver.NXDOMAIN):
                try:
                    resolver.resolve(clean_domain, 'AAAA')
                    return True, ""
                except (dns.resolver.NoAnswer, dns.resolver.NXDOMAIN):
                    logger.info("Domain %s has no MX, A, or AAAA records.", clean_domain)
                    return False, "Invalid email address or email domain."
                except Exception:
                    pass
            except Exception:
                pass
        except (dns.resolver.Timeout, dns.resolver.LifetimeTimeout, dns.exception.DNSException) as e:
            logger.warning("DNS query timed out for domain %s: %s", clean_domain, type(e).__name__)
            # Fallback to socket getaddrinfo
            try:
                socket.getaddrinfo(clean_domain, None)
                return True, ""
            except socket.gaierror as s_err:
                # Errno 11001: getaddrinfo failed (Host not found)
                if getattr(s_err, 'errno', None) in (11001, -2):
                    return False, "Invalid email address or email domain."
                logger.warning("Socket resolution failed for domain %s: %s", clean_domain, s_err)
    except ImportError:
        # dnspython not installed, fallback to socket
        try:
            socket.getaddrinfo(clean_domain, None)
            return True, ""
        except socket.gaierror:
            return False, "Invalid email address or email domain."

    # If in local demo mode and DNS is offline, allow local test domains
    if getattr(Config, 'OTP_MODE', 'email') == 'local_demo':
        logger.info("Local demo mode active: permitting domain %s without verified DNS", clean_domain)
        return True, ""

    return True, ""

def validate_email_for_otp(email: str) -> tuple[bool, str, str]:
    """
    Performs full preliminary validation for an email address prior to OTP dispatch.
    
    Steps:
      1. Syntax validation (RFC 5321 / RFC 5322).
      2. Mail routing DNS validation (MX with A/AAAA fallback, RFC 7505 Null MX rejection).
    
    Returns:
        tuple (is_valid, error_message, clean_normalized_email)
    """
    is_valid_syntax, err_syntax, local_part, domain_part = validate_email_syntax(email)
    if not is_valid_syntax:
        return False, err_syntax, ""

    is_valid_dns, err_dns = validate_domain_dns(domain_part)
    if not is_valid_dns:
        return False, err_dns, ""

    normalized_email = f"{local_part}@{domain_part}"
    return True, "", normalized_email
