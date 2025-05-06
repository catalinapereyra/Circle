from datetime import timedelta

from app.extensions import db, migrate, socketio
from flask import Flask, request
from flask_cors import CORS
from flask_jwt_extended import JWTManager

from app.routes.chat_routes import chat_bp
from app.routes.match_routes import bp_match
from app.events import socket_handlers


def create_app():
    """Configura la aplicación Flask y registra los blueprints."""
    app = Flask(__name__)
    app.config.from_object('config.Config')  # Configuración de la app
    # Configurar JWT
    app.config["JWT_SECRET_KEY"] = "circle-cata-rochi"
    app.config['JWT_TOKEN_LOCATION'] = ['headers']
    app.config['JWT_HEADER_NAME'] = 'Authorization'
    app.config['JWT_HEADER_TYPE'] = 'Bearer'
    app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=1)
    JWTManager(app)

    CORS(app, supports_credentials=True, expose_headers=["Authorization"]) # para que React se conecte

    @app.before_request
    def handle_preflight():
        if request.method == 'OPTIONS':
            response = app.make_response('')
            response.headers['Access-Control-Allow-Origin'] = 'http://localhost:5173'
            response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
            response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS, PUT'  # Agregado PUT
            response.headers['Access-Control-Allow-Credentials'] = 'true'
            response.status_code = 204
            return response

    # Importaciones de modelos y rutas dentro del contexto de la app
    from app.routes.user_routes import bp_user
    from app.routes.profile_routes import bp_profile
    from app.models.models import User
    from app.models.models import CoupleMode, FriendshipMode, CouplePhoto

    db.init_app(app)
    migrate.init_app(app, db)
    socketio.init_app(app, cors_allowed_origins="*")


    # Registrar blueprints
    app.register_blueprint(bp_user)
    app.register_blueprint(bp_profile, url_prefix="/profile")
    app.register_blueprint(bp_match)
    app.register_blueprint(chat_bp)

    # Crear las tablas en la base de datos
    with app.app_context():
        db.create_all()

    return app