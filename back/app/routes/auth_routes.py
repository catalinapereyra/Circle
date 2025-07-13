from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token
from google.oauth2 import id_token
from google.auth.transport import requests as grequests

from app.extensions import db
from app.models.models import User, Genders

auth_bp = Blueprint("auth_bp", __name__, url_prefix="/api/auth")

@auth_bp.route("/google", methods=["POST"])
def login_with_google():
    data = request.get_json()
    token = data.get("credential")

    if not token:
        return jsonify({"error": "No token provided"}), 400

    try:
        CLIENT_ID = "415980449260-lkvk54is529a27k17t35kd9h57lerpqi.apps.googleusercontent.com"
        idinfo = id_token.verify_oauth2_token(token, grequests.Request(), audience=CLIENT_ID)

        email = idinfo["email"]
        name = idinfo.get("name", "google_user")

        # Buscar si el usuario ya existe
        user = User.query.filter_by(email=email).first()

        if not user:
            # Crear uno nuevo con valores por defecto
            base_username = email.split("@")[0][:25]
            username = base_username
            counter = 1
            while User.query.filter_by(username=username).first():
                username = f"{base_username}{counter}"
                counter += 1

            user = User(
                username=username,
                password="GOOGLE",  # No se usa
                name=name[:15],
                age=18,  # por defecto
                email=email,
                gender=Genders.OTHER,  # por defecto
                location=None  # o algo válido
            )
            db.session.add(user)
            db.session.commit()

        access_token = create_access_token(identity=user.username)
        return jsonify({"access_token": access_token}), 200

    except ValueError as e:
        return jsonify({"error": "Token verification failed", "details": str(e)}), 401

    except Exception as e:
        return jsonify({"error": str(e)}), 500