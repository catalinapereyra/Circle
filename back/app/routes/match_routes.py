from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.models import Swipe, SwipeType, SwipeMode, User, Match
from app.extensions import db

bp_match = Blueprint('match', __name__, url_prefix='/match')

from app.models.models import Swipe, SwipeType, SwipeMode, User, Match, MatchMode

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.models import Swipe, SwipeType, SwipeMode, User, Match, MatchMode
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

        swipe_mode = SwipeMode.COUPLE if mode == "couple" else SwipeMode.FRIEND

        # Verificar si ya existe el swipe
        existing_swipe = Swipe.query.filter_by(
            swiper_id=swiper,
            swiped_id=swiped,
            mode=swipe_mode
        ).first()

        if existing_swipe:
            print(f"⚠️ Swipe ya existente de {swiper} a {swiped} en modo {mode}. No se crea otro.")
        else:
            # Crear nuevo Swipe
            swipe = Swipe(
                swiper_id=swiper,
                swiped_id=swiped,
                type=SwipeType(action),
                mode=swipe_mode
            )
            db.session.add(swipe)
            db.session.commit()

        # Si es un like, chequeamos match
        if action == 'like':
            reciprocal = Swipe.query.filter_by(
                swiper_id=swiped,
                swiped_id=swiper,
                type=SwipeType.LIKE,
                mode=swipe_mode
            ).first()

            if reciprocal:
                new_match = Match(
                    user1=swiper,
                    user2=swiped,
                    mode=MatchMode.COUPLE if mode == "couple" else MatchMode.FRIENDSHIP
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
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


@bp_match.route('/mine', methods=['GET'])
@jwt_required()
def get_my_matches():
    try:
        username = get_jwt_identity()

        # Buscamos los matches donde el usuario sea user1 o user2
        matches = Match.query.filter(
            (Match.user1 == username) | (Match.user2 == username)
        ).all()

        matches_list = []
        for match in matches:
            # Determinar cuál es el "otro" usuario
            other_user = match.user2 if match.user1 == username else match.user1

            matches_list.append({
                'username': other_user,
                'mode': match.mode.value,  # devuelve "friendship" o "couple"
                'created_at': match.created_at.strftime('%Y-%m-%d %H:%M:%S')
            })

        return jsonify(matches_list), 200

    except Exception as e:
        print("ERROR en get_my_matches:", str(e))
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500
