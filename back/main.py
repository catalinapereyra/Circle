from datetime import timedelta

from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager


db = SQLAlchemy()
migrate = Migrate()



def create_app():
    """Configura la aplicación Flask y registra los blueprints."""
    app = Flask(__name__)
    app.config.from_object('config.Config')  # Configuración de la app
    # Configurar JWT
    app.config["JWT_SECRET_KEY"] = "deligo-mili-pili"
    app.config['JWT_TOKEN_LOCATION'] = ['headers']
    app.config['JWT_HEADER_NAME'] = 'Authorization'
    app.config['JWT_HEADER_TYPE'] = 'Bearer'
    app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=1)
    JWTManager(app)
    CORS(app, expose_headers=["Authorization"])  # para que React se conecte


    # Importaciones de modelos y rutas dentro del contexto de la app
    from app.routes.user_routes import bp_user
    from app.routes.profile_routes import bp_profile
    from app.models.models import User
    from app.models.models import CoupleMode, FriendshipMode, CouplePhoto

    db.init_app(app)
    migrate.init_app(app, db)


    # Registrar blueprints
    app.register_blueprint(bp_user)
    app.register_blueprint(bp_profile, url_prefix="/profile")

    # Crear las tablas en la base de datos
    with app.app_context():
        db.create_all()

    return app