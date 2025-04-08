from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS

db = SQLAlchemy()

def create_app():
    """Configura la aplicación Flask y registra los blueprints."""
    app = Flask(__name__)
    app.config.from_object('config.Config')  # Configuración de la app
    CORS(app)  # para que React se conecte

    # Importaciones de modelos y rutas dentro del contexto de la app
    from app.routes.user_routes import bp_user
    from app.routes.profile_routes import bp_profile  # <-- IMPORTANTE
    from app.models.models import User
    from app.models.models import CoupleMode, FriendshipMode

    db.init_app(app)

    # Registrar blueprints
    app.register_blueprint(bp_user)
    app.register_blueprint(bp_profile, url_prefix="/profile")  # <-- NUEVO

    # Crear las tablas en la base de datos
    with app.app_context():
        db.create_all()

    return app