from flask import Flask
from flask_sqlalchemy import SQLAlchemy

# Definir db globalmente sin importarlo en el inicio
db = SQLAlchemy()

from flask_cors import CORS


def create_app():
    """Configura la aplicación Flask y registra los blueprints."""
    app = Flask(__name__)
    app.config.from_object('config.Config')  # Configuración de la app
    CORS(app) # para que react se conecte

    # Aquí importa el blueprint después de la configuración de la app
    from app.routes.user_routes import bp_user  # Importación dentro de la función para evitar el import circular
    from app.models.user import User  # Asegúrate de que los modelos estén importados después
    from app.models.profile import CoupleMode, FriendshipMode
    db.init_app(app)  # Inicializa la base de datos con la app

    # Registrar blueprintduadhgiowahs
    app.register_blueprint(bp_user)  # Registra el blueprint del usuario

    # Crear las tablas en la base de datos si es necesario
    with app.app_context():
        db.create_all()

    return app


