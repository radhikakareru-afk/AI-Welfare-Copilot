from flask import Blueprint, jsonify
from db import query_one

health_bp = Blueprint('health', __name__)

@health_bp.route('/health', methods=['GET'])
@health_bp.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        "status": "healthy",
        "service": "AI Welfare Copilot Python Auth Backend",
        "version": "1.0.0"
    }), 200

@health_bp.route('/api/test-db', methods=['GET'])
@health_bp.route('/api/auth/test-db', methods=['GET'])
def test_db():
    try:
        row = query_one("SELECT NOW() as current_time, current_database() as db_name;")
        return jsonify({
            "success": True,
            "message": "PostgreSQL connected successfully",
            "database": row["db_name"],
            "server_time": str(row["current_time"])
        }), 200
    except Exception as e:
        return jsonify({
            "success": False,
            "message": "Database connection failed",
            "error": "Could not connect to PostgreSQL database"
        }), 500
