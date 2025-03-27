from flask import Blueprint

# Importar los Blueprints de las rutas de usuario
from .user_routes import bp_user as user_bp #renombro a user_bp para usarlo mas facil

# Crear una lista con los Blueprints
blueprints = [user_bp] #blueprints es una variable que contiene todos los blueprints


def init_app(app): # Función para registrar todos los Blueprints en la aplicación
    for blueprint in blueprints:
        app.register_blueprint(blueprint)

