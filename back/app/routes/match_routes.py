from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.models import Swipe, SwipeType, SwipeMode, User
from app.extensions import db

bp_match = Blueprint('match', __name__, url_prefix='/match')

@bp_match.route('', methods=['POST'])
@jwt_required()
def swipe_user():
    try:
        data = request.get_json()
        print("Datos recibidos en swipe:", data)

        swiper = get_jwt_identity()
        swiped = data.get('swiped_username')
        mode = data.get('mode')  # "couple" o "friendship"
        action = data.get('type')  # "like" o "dislike"

        if mode not in ['couple', 'friendship'] or action not in ['like', 'dislike']:
            print("Datos inválidos:", data)
            return jsonify({'error': 'Invalid swipe data'}), 400

        mode_enum_value = "friend" if mode == "friendship" else mode

        swipe = Swipe(
            swiper_id=swiper,
            swiped_id=swiped,
            type=SwipeType(action),
            mode=SwipeMode(mode_enum_value)
        )

        db.session.add(swipe)
        db.session.commit()

        reciprocal = Swipe.query.filter_by(
            swiper_id=swiped,
            swiped_id=swiper,
            type=SwipeType.LIKE,
            mode=SwipeMode(mode_enum_value)
        ).first()

        if reciprocal and action == 'like':
            return jsonify({'match': True, 'message': 'It\'s a match! 💘'}), 200

        return jsonify({'match': False, 'message': 'Swipe saved'}), 200

    except Exception as e:
        print("💥 ERROR en swipe_user:", str(e))
        return jsonify({'error': 'Internal server error'}), 500


@bp_match.route('/my-matches', methods=['GET'])
@jwt_required()
def get_my_matches():
    current_user = get_jwt_identity()

    my_likes = Swipe.query.filter_by(
        swiper_id=current_user,
        type=SwipeType.LIKE
    ).all()

    matches = []
    for swipe in my_likes:
        # Buscar si el otro también likéo de vuelta
        reciprocal = Swipe.query.filter_by(
            swiper_id=swipe.swiped_id,
            swiped_id=current_user,
            type=SwipeType.LIKE,
            mode=swipe.mode
        ).first()

        if reciprocal:
            matches.append(swipe.swiped_id)

    return jsonify({'matches': matches})