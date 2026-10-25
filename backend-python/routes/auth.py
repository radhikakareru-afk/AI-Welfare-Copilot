from flask import Blueprint, request, jsonify
from services.auth_service import (
    request_registration_otp,
    verify_registration_otp,
    complete_registration,
    login_user
)

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/api/auth/request-otp', methods=['POST'])
def handle_request_otp():
    data = request.get_json(silent=True) or {}
    email = data.get('email', '').strip()

    result = request_registration_otp(email)
    status = result.pop('status_code', 200)
    return jsonify(result), status

@auth_bp.route('/api/auth/verify-otp', methods=['POST'])
def handle_verify_otp():
    data = request.get_json(silent=True) or {}
    email = data.get('email', '').strip()
    otp = str(data.get('otp', '')).strip()

    result = verify_registration_otp(email, otp)
    status = result.pop('status_code', 200)
    return jsonify(result), status

@auth_bp.route('/api/auth/register', methods=['POST'])
@auth_bp.route('/api/users', methods=['POST'])
def handle_register():
    data = request.get_json(silent=True) or {}
    email = data.get('email', '').strip()
    password = data.get('password', '')
    full_name = data.get('full_name', '')
    state = data.get('state', 'Maharashtra')
    district = data.get('district', 'Pune')
    verification_token = data.get('verification_token')

    result = complete_registration(
        email=email,
        password=password,
        full_name=full_name,
        state=state,
        district=district,
        verification_token=verification_token
    )
    status = result.pop('status_code', 201 if result.get('success') else 400)
    return jsonify(result), status

@auth_bp.route('/api/auth/login', methods=['POST'])
@auth_bp.route('/api/users/login', methods=['POST'])
def handle_login():
    data = request.get_json(silent=True) or {}
    email = data.get('email', '').strip()
    password = data.get('password', '')

    result = login_user(email=email, password=password)
    status = result.pop('status_code', 200 if result.get('success') else 401)
    return jsonify(result), status
