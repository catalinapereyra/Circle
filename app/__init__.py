# en este init se tiene que iniciar la app, es decir configurar e inicializar la aplicación Flask.
# importar y configurar los modelos, las rutas y la base de datos.

from flask import Flask
from .models import db
from .models.user import User
from .routes.user_routes import bp_user as user_routes_bp  # importar blue print, un Blueprint es una forma de organizar el código de la aplicación en módulos que encapsulan una funcionalidad relacionada


def create_app():
    app = Flask(__name__)
    app.config.from_object('config.Config')
    db.init_app(app) #inicializo database
    app.register_blueprint(user_routes_bp) # Registrar rutas
    app.run(debug=True)

    with app.app_context():
        db.create_all()
    # app.run()

    return app
#hola