from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.models import Swipe, SwipeType, SwipeMode, User, Match
from app.extensions import db

bp_match = Blueprint('match', __name__, url_prefix='/match')

from app.models.models import Swipe, SwipeType, SwipeMode, User, Match, MatchMode

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

        # Crear Swipe
        swipe = Swipe(
            swiper_id=swiper,
            swiped_id=swiped,
            type=SwipeType(action),
            mode=SwipeMode(mode if mode == "couple" else "friend")
        )
        db.session.add(swipe)

        # Guardamos swipe primero
        db.session.commit()

        # Si es un like, buscamos si hay like recíproco
        if action == 'like':
            reciprocal = Swipe.query.filter_by(
                swiper_id=swiped,
                swiped_id=swiper,
                type=SwipeType.LIKE,
                mode=SwipeMode(mode if mode == "couple" else "friend")
            ).first()

            if reciprocal:
                # Es match => crear Match en base
                new_match = Match(
                    user1=swiper,
                    user2=swiped,
                    mode=MatchMode(mode.upper())
                )
                db.session.add(new_match)
                db.session.commit()
                print(f"✨ Nuevo match entre {swiper} y {swiped} en modo {mode}")
                return jsonify({
                    'match': True,
                    'message': f"You matched with {swiped}!",
                    'username': swiped
                }), 200

        return jsonify({'match': False, 'message': 'Swipe saved'}), 200

    except Exception as e:
        print("ERROR en swipe_user:", str(e))
        return jsonify({'error': 'Internal server error'}), 500


@bp_match.route('/my-matches', methods=['GET'])
@jwt_required()
def get_my_matches():
    current_username = get_jwt_identity()

    # Buscar matches donde yo soy user1 o user2
    matches = Match.query.filter(
        ((Match.user1 == current_username) | (Match.user2 == current_username))
    ).all()

    # Listar el "otro" username en el match
    match_usernames = []
    for match in matches:
        if match.user1 == current_username:
            match_usernames.append(match.user2)
        else:
            match_usernames.append(match.user1)

    return jsonify({'matches': match_usernames})
