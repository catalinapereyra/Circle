import jwt
from datetime import datetime, timedelta

SECRET_KEY = "tu_clave_secreta"  # Idealmente sacarla de un .env

def generate_token(username, expiration_minutes=60):
    payload = {
        'username': username,
        'exp': datetime.utcnow() + timedelta(minutes=expiration_minutes)
    }
    return jwt.encode(payload, SECRET_KEY, algorithm='HS256')
