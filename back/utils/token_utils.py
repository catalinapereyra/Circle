# import jwt
# from datetime import datetime, timedelta
#
# from flask_jwt_extended import create_access_token
# from jinja2.runtime import identity
#
# SECRET_KEY = "tu_clave_secreta"  # Idealmente sacarla de un .env
#
# def generate_token(username, expiration_minutes=60):
#     payload = {
#         'username': username,
#         'exp': datetime.utcnow() + timedelta(minutes=expiration_minutes)
#     }
#     return create_access_token(identity=username)
