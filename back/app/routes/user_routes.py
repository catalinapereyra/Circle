# usamos blueprint para evitar que este init se vuelva muy largo
# en este file estan todas las rutas que TIENEN QUE VER CON EL USER

# Una ruta /endpoint es una URL que la web usa paa recibir y mandar solicitudes / respuestas.
# cada ruta esta asociada a una funcion. POST GET
# POST -> Enviar datos al servidor para crear recursos.
# GET -> Obtener datos del servidor.
# PUT ->  reemplazar un recurso existente con nuevos datos.
# PATCH -> s similar a PUT, pero PATCH solo modifica los campos que se pasan en la solicitud, en lugar de reemplazar el recurso completo.
# DELETE -> eliminar un recurso


from flask import Blueprint, request, jsonify

from app.models.models import User
from main import db
from utils.token_utils import generate_token  # asegurate de importar esto
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, timedelta
from app.models.models import User, PremiumSubscription





bp_user = Blueprint('user', __name__, url_prefix='/user') #creo un blueprint 'user'que tiene el prefijo '/user' en la URL

@bp_user.route('/register', methods=['GET'])
def register():
    return "Register endpoint"


# SIGN UP
@bp_user.route('/register', methods=['POST']) #la routa del blueprint tiene url register y los metodos que acepta son 'POST'
def register_user():
    data = request.get_json() #con esto acceso al input que dio el usuario desde la pagina y guardo eso en una varianle
    username = data.get('username')
    password = data.get('password')
    name = data.get('name')
    age = data.get('age')
    email = data.get('email')
    gender = data.get('gender')
    location = data.get('location')
    #id_subscription = data.get('id_subscription')
    existing_user = User.query.filter_by(username=username).first()
    if existing_user:
        return jsonify({"error": "Username already taken"}), 409  # 409 Conflict

    # Crear un nuevo usuario con los datos
    new_user = User(
        username=username, #seteo los datos en mi tabla user con lo que consegui arriba
        password=password,
        name=name,
        age=age,
        email=email,
        gender=gender,
        location=location,
        #id_subscription=id_subscription
    )

    # Guardar el usuario en la base de datos
    db.session.add(new_user)
    db.session.commit()

    token = generate_token(username)

    # 🔥 Devolver también el token
    return jsonify({
        "message": "User registered successfully!",
        "token": token
    }), 201

# LOG IN
@bp_user.route('/login', methods=['POST'])
def login_user():
    data = request.get_json() #obtengo el imput de la web
    username = data.get('username') #lo guardo en variables
    password = data.get('password')

    # Buscar el usuario en la base de datos
    user = User.query.filter_by(username=username).first()


    if user and user.password == password:
        token = generate_token(user.username)
        return jsonify({
            "message": "Login successful!",
            "token": token
        }), 200

        #creo que hay que haer una session para que pueda 'entrar' a la web y no sea solo el print.... check
    return jsonify({"message": "Invalid credentials!"}), 401


# GET all users
@bp_user.route('/all', methods=['GET'])
def get_all_users():
    users = User.query.all()  # trae todos los usuarios
    result = []
    for user in users:
        result.append({
            "username": user.username,
            "name": user.name,
            "email": user.email,
            "age": user.age,
            "gender": user.gender.name,
            "location": user.location
            # aca desp va subscription tmb
        })
    return jsonify(result), 200


# PUT - Actualizar un usuario
@bp_user.route('/<username>', methods=['PUT'])
def update_user(username):
    user = User.query.filter_by(username=username) #busco en la base de datos la user con ese username
    # user.query accede a la tabla user, depsues con filter by filtra segun el username = username
    if not user:
        return jsonify({"message": "User not found"}), 404 # si no encuentra al user, tira error

    data = request.get_json() #busca la data que se pone en la pagina web

    # Actualizamos solo si mandan ese dato
    if 'username' in data:
        user.email = data['username']
    if 'password' in data:
        user.email = data['password']
    if 'email' in data:
        user.email = data['email']
    if 'location' in data:
        user.location = data['location']
    # hay que fijarse tema subscription

    db.session.commit() # SQLAlchemy, nada se guarda de verdad hasta que hacés db.session.commit()
    return jsonify({"message": "User updated successfully!"})


# DELETE - Eliminar un usuario
@bp_user.route('/<username>', methods=['DELETE'])
def delete_user(username):
    user = User.query.filter_by(username=username).first()
    # busco en la base de datos la user con ese username
    # user.query accede a la tabla user, depsues con filter by filtra segun el username = username
    if not user:
        return jsonify({"message": "User not found"}), 404

    db.session.delete(user)
    db.session.commit()
    return jsonify({"message": "User deleted successfully!"})


@bp_user.route('/user/<username>', methods=['GET'])
def get_user(username):
    user = User.query.filter_by(username=username).first()
    if user:
        return jsonify({"name": user.name})
    return jsonify({"error": "Not found"}), 404

@bp_user.route('/me', methods=['GET'])
@jwt_required()
def get_me():
    username = get_jwt_identity()
    user = User.query.filter_by(username=username).first()

    if user:
        return jsonify({
            "username": user.username,
            "name": user.name,
            "email": user.email,
            "age": user.age,
            "gender": user.gender.name,
            "location": user.location
        }), 200

    return jsonify({"error": "User not found"}), 404


@bp_user.route('/subscribe', methods=['POST'])
@jwt_required()
def subscribe_user():
    username = get_jwt_identity()

    user = User.query.filter_by(username=username).first()
    if not user:
        return jsonify({"error": "User not found"}), 404

    # Crear suscripción válida por 30 días (simulación)
    start_date = datetime.utcnow()
    end_date = start_date + timedelta(days=30)

    subscription = PremiumSubscription(
        user_username=username,  #este es el nombre correcto de la columna
        start_date=start_date,
        end_date=end_date
    )

    db.session.add(subscription)
    db.session.flush()  # Para obtener el id antes del commit

    # Asignar la FK en el modelo User
    user.id_subscription = subscription.id

    db.session.commit()

    return jsonify({
        "message": "¡Suscripción premium activada!",
        "start_date": str(start_date),
        "end_date": str(end_date)
    }), 200


@bp_user.route('/me/subscription', methods=['GET'])
@jwt_required()
def get_my_subscription():
    username = get_jwt_identity()
    user = User.query.filter_by(username=username).first()

    if not user or not user.premium_subscription:
        return jsonify({
            "premium": False,
            "message": "No active subscription"
        }), 200

    subscription = user.premium_subscription
    now = datetime.utcnow()

    if subscription.end_date and subscription.end_date > now:
        return jsonify({
            "premium": True,
            "start_date": str(subscription.start_date),
            "end_date": str(subscription.end_date)
        }), 200
    else:
        return jsonify({
            "premium": False,
            "message": "Subscription expired"
        }), 200

@bp_user.route('/delete', methods=['DELETE'])
@jwt_required()
def delete_my_account():
    username = get_jwt_identity()
    user = User.query.filter_by(username=username).first()

    if not user:
        return jsonify({"message": "User not found"}), 404

    # Primero eliminamos las fotos, si existen
    if user.friendship_mode:
        for photo in user.friendship_mode.photos:
            db.session.delete(photo)
        db.session.delete(user.friendship_mode)

    if user.couple_mode:
        for photo in user.couple_mode.photos:
            db.session.delete(photo)
        db.session.delete(user.couple_mode)

    # Eliminamos la suscripción si existe
    if user.premium_subscription:
        db.session.delete(user.premium_subscription)

    # Eliminamos el usuario
    db.session.delete(user)
    db.session.commit()

    return jsonify({"message": "User and related data deleted"}), 200
