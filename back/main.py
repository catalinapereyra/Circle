from datetime import timedelta

from app.extensions import db, migrate, socketio
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager

from app.routes.chat_routes import chat_bp
from app.routes.match_routes import bp_match
import mercadopago
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


    # CORS(app, supports_credentials=True, origins=["http://localhost:5173"], expose_headers=["Authorization"])

    CORS(app,
         supports_credentials=True,
         origins=["http://localhost:5173"],
         expose_headers=["Authorization"],
         allow_headers=["Content-Type", "Authorization"],
         methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"]
         )

    sdk = mercadopago.SDK("TEST-4448250949116850-071315-308b9b75d0b0af062d1120459069e3a5-302805625")

    # @app.route("/make_payment", methods=["POST"])
    # def make_payment():
    #     preference_data = {
    #         "items": [
    #             {
    #                 "title": "Circle Premium subs",
    #                 "quantity": 1,
    #                 "unit_price": 999,
    #                 "currency_id": "ARS"
    #             }
    #         ]
    #     }
    #
    #     preference_response = sdk.preference().create(preference_data)
    #     print(preference_response)
    #     preference = preference_response.get("response", {})
    #     print("✅ URL del pago:", preference["init_point"])
    #     return jsonify({
    #         "preference_id": preference["id"],
    #         "sandbox_init_point": preference["sandbox_init_point"]
    #     })

    @app.route("/crear_suscripcion", methods=["POST"])
    def crear_suscripcion():
        preapproval_data = {
            "reason": "Circle Premium Subscription",
            "auto_recurring": {
                "frequency": 1,
                "frequency_type": "months",
                "transaction_amount": 999,
                "currency_id": "ARS",
                "start_date": "2025-07-13T00:00:00.000-03:00",
                "end_date": "2026-07-13T00:00:00.000-03:00"
            },
            "back_url": "http://localhost:5173/choose-profile",
            "payer_email": "mail@de.prueba.com",  
        }

        result = sdk.preapproval().create(preapproval_data)
        return jsonify({
            "init_point": result["response"]["init_point"]
        })

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

if __name__ == '__main__':
    app = create_app()
    from app.extensions import socketio
    socketio.run(app, port=5001, debug=True)