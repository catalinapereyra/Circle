from flask import Blueprint, request, jsonify
from app.models import db
from app.models.user import User

bp = Blueprint('user', __name__, url_prefix='/user')


@bp.route('/register', methods=['POST'])
def register_user():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    # Crea un nuevo usuario
    new_user = User(username=username, password=password)
    db.session.add(new_user)
    db.session.commit()

    return jsonify({"message": "User registered successfully!"}), 201