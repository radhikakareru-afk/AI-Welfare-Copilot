import os
import logging
from flask import Flask, jsonify
from flask_cors import CORS
from config import Config
from routes.health import health_bp
from routes.auth import auth_bp

# Configure logging for application and services
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

def create_app():
    app = Flask(__name__)
    app.config['SECRET_KEY'] = Config.SECRET_KEY

    # Configure CORS for frontend access
    allowed_origins = [
        Config.FRONTEND_URL,
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    ]
    CORS(
        app,
        origins=list(set(allowed_origins)),
        supports_credentials=True,
        methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allow_headers=["Content-Type", "Authorization", "x-user-id"]
    )

    # Register blueprints
    app.register_blueprint(health_bp)
    app.register_blueprint(auth_bp)

    # Global Error Handlers
    @app.errorhandler(404)
    def handle_not_found(e):
        return jsonify({"success": False, "message": "Endpoint not found"}), 404

    @app.errorhandler(405)
    def handle_method_not_allowed(e):
        return jsonify({"success": False, "message": "Method not allowed"}), 405

    @app.errorhandler(500)
    def handle_server_error(e):
        return jsonify({"success": False, "message": "An internal server error occurred"}), 500

    return app

app = create_app()

if __name__ == '__main__':
    print(f"Starting AI Welfare Copilot Flask Auth Backend on port {Config.PORT}...")
    print(f"CORS allowed origins: {Config.FRONTEND_URL}")
    print(f"PostgreSQL Database: {Config.DB_NAME}@{Config.DB_HOST}:{Config.DB_PORT}")
    app.run(host='0.0.0.0', port=Config.PORT, debug=Config.DEBUG)
