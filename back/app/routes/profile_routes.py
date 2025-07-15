import base64

from flask import Blueprint, request, jsonify
from app.models.models import CouplePreferences, CoupleMode, User, FriendshipMode, CouplePhoto, FriendshipPhoto, SwipeMode,Swipe,SwipeType
from geoalchemy2.functions import ST_DWithin
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.extensions import db


bp_profile = Blueprint('profile', __name__)

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


@bp_profile.route('/couple-profile', methods=['POST'])
@jwt_required()
def create_couple_profile():
    data = request.form
    print("📥 Form Data recibido:", data)

    username = get_jwt_identity()
    bio = data.get('bio', '')
    interest = data.get('interest', '')
    preferences_str = data.get('preferences', '')

    try:
        preference_enum = CouplePreferences(preferences_str.lower()).value
    except ValueError:
        return jsonify({'error': f'Invalid preference: {preferences_str}'}), 400

    profile_picture_base64 = None
    if 'profile_picture' in request.files:
        profile_picture_file = request.files['profile_picture']
        profile_picture_bytes = profile_picture_file.read()
        profile_picture_base64 = base64.b64encode(profile_picture_bytes).decode('utf-8')

    extra_photos = request.files.getlist('extra_photos')
    if len(extra_photos) < 3 or len(extra_photos) > 10:
        return jsonify({'error': 'You must upload between 3 and 10 extra photos.'}), 400

    new_profile = CoupleMode(
        username=username,
        profile_picture=profile_picture_base64,
        bio=bio,
        preferences=preference_enum,
        interest=interest
    )

    db.session.add(new_profile)
    db.session.commit()

#encodeo las fotos
    for file in extra_photos:
        if file and allowed_file(file.filename):
            photo_bytes = file.read()
            encoded_photo = base64.b64encode(photo_bytes).decode('utf-8')

            photo = CouplePhoto(couple_id=new_profile.id, photo_data=encoded_photo)
            db.session.add(photo)
        else:
            return jsonify({'error': 'Invalid file type'}), 400

    db.session.commit()
    return jsonify({'message': 'Couple profile created successfully'})


@bp_profile.route('/friendship-profile', methods=['POST'])
@jwt_required()
def create_friendship_profile():
    data = request.form
    print("📥 Form Data recibido:", data)

    username = get_jwt_identity()
    bio = data.get('bio', '')
    interest = data.get('interest', '')

    profile_picture_base64 = None
    if 'profile_picture' in request.files:
        profile_picture_file = request.files['profile_picture']
        profile_picture_bytes = profile_picture_file.read()
        profile_picture_base64 = base64.b64encode(profile_picture_bytes).decode('utf-8')

    extra_photos = request.files.getlist('extra_photos')
    if len(extra_photos) < 3 or len(extra_photos) > 10:
        return jsonify({'error': 'You must upload between 3 and 10 extra photos.'}), 400

    new_profile = FriendshipMode(
        username=username,
        profile_picture=profile_picture_base64,
        bio=bio,
        interest=interest
    )

    db.session.add(new_profile)
    db.session.commit()

#encodeo
    for file in extra_photos:
        if file and allowed_file(file.filename):
            photo_bytes = file.read()
            encoded_photo = base64.b64encode(photo_bytes).decode('utf-8')

            photo = FriendshipPhoto(friendship_id=new_profile.id, photo_data=encoded_photo)
            db.session.add(photo)
        else:
            return jsonify({'error': 'Invalid file type'}), 400

    db.session.commit()
    return jsonify({'message': 'Friendship profile created successfully'})


@bp_profile.route('/check-profiles', methods=['GET'])
@jwt_required()
def check_profiles():
    username = get_jwt_identity()

    # buscar perfiles del usuario
    couple_profile = CoupleMode.query.filter_by(username=username).first()
    friendship_profile = FriendshipMode.query.filter_by(username=username).first()

    return jsonify({
        'has_couple_profile': couple_profile is not None,
        'has_friendship_profile': friendship_profile is not None
    })


@bp_profile.route('/home/<mode>', methods=['GET'])
@jwt_required()
def get_profiles_by_mode(mode):
    current_user = get_jwt_identity()
    radius_km = request.args.get('radius', None, type=float)
    user = User.query.filter_by(username=current_user).first()

    if not user or not user.location:
        return jsonify({"error": "Tu ubicación no está configurada"}), 400

    if mode == 'couple':
        swiped_usernames = [s.swiped_id for s in Swipe.query.filter_by(swiper_id=current_user, mode=SwipeMode.COUPLE).all()]
        my_profile = CoupleMode.query.filter_by(username=current_user).first()

        if not my_profile:
            return jsonify({"error": "Profile not found"}), 404

        pref = my_profile.preferences.lower()

        if pref == 'men':
            gender_filter = ['MALE']
        elif pref == 'women':
            gender_filter = ['FEMALE']
        elif pref == 'both':
            gender_filter = ['MALE', 'FEMALE']
        elif pref == 'all':
            gender_filter = ['MALE', 'FEMALE', 'OTHER']
        else:
            gender_filter = []

        query = (
            CoupleMode.query
            .join(User, CoupleMode.username == User.username)
            .filter(
                CoupleMode.username != current_user,
                ~CoupleMode.username.in_(swiped_usernames),
                User.gender.in_(gender_filter)
            )
        )

        if radius_km:
            query = query.filter(ST_DWithin(User.location, user.location, radius_km * 1000))

        profiles = query.all()

        result = [
            {
                'username': p.username,
                'age': p.user.age,
                'bio': p.bio,
                'interest': p.interest,
                'profile_picture': p.profile_picture,
                'photos': [f"data:image/jpeg;base64,{photo.photo_data}" for photo in p.photos]
            }
            for p in profiles
        ]
        return jsonify(result)

    elif mode == 'friendship':
        swiped_usernames = [s.swiped_id for s in Swipe.query.filter_by(swiper_id=current_user, mode=SwipeMode.FRIEND).all()]

        query = (
            FriendshipMode.query
            .join(User, FriendshipMode.username == User.username)
            .filter(
                FriendshipMode.username != current_user,
                ~FriendshipMode.username.in_(swiped_usernames)
            )
        )

        if radius_km:
            query = query.filter(ST_DWithin(User.location, user.location, radius_km * 1000))

        profiles = query.all()

        result = [
            {
                'username': p.username,
                'age': p.user.age,
                'bio': p.bio,
                'interest': p.interest,
                'profile_picture': p.profile_picture,
                'photos': [f"data:image/jpeg;base64,{photo.photo_data}" for photo in p.photos]
            }
            for p in profiles
        ]
        return jsonify(result)

    return jsonify({'error': 'Modo inválido'}), 400



@bp_profile.route('/public/<username>', methods=['GET'])
def get_public_profile(username):
    profile = CoupleMode.query.filter_by(username=username).first()

    if not profile:
        profile = FriendshipMode.query.filter_by(username=username).first()

    if not profile:
        return jsonify({'error': 'Perfil no encontrado'}), 404

    return jsonify({
        'username': profile.username,
        'bio': profile.bio,
        'interest': profile.interest,
        'profile_picture': profile.profile_picture
    })

@bp_profile.route('/likes-received', methods=['GET'])
@jwt_required()
def likes_received():
    username = get_jwt_identity()

    user = User.query.filter_by(username=username).first()
    if not user:
        return jsonify({"error": "User not found"}), 404

    # Verificar suscripción premium
    if not user.premium_subscription:
        return jsonify({"error": "Premium subscription required"}), 403

    mode_param = request.args.get('mode')
    if not mode_param:
        return jsonify({"error": "Mode required"}), 400

    try:
        swipe_mode = SwipeMode[mode_param.upper()]  # Convertir el string a enum
    except KeyError:
        return jsonify({"error": "Invalid mode"}), 400

    # 🔵 Traer likes recibidos
    received_likes = Swipe.query.filter_by(
        swiped_id=username,
        type=SwipeType.LIKE,
        mode=swipe_mode
    ).all()
    liked_by_usernames = [like.swiper_id for like in received_likes]

    # 🟢 Buscar mis likes de vuelta (para saber si hay match)
    my_likes = Swipe.query.filter(
        Swipe.swiper_id == username,
        Swipe.swiped_id.in_(liked_by_usernames),
        Swipe.type == SwipeType.LIKE,
        Swipe.mode == swipe_mode
    ).all()
    matched_usernames = {like.swiped_id for like in my_likes}

    # 🔴 Likes pendientes: gente que me likearon pero yo no likée todavía
    pending_usernames = set(liked_by_usernames) - matched_usernames

    # 🔵 Buscar en base de datos los usuarios pendientes
    pending_users = User.query.filter(User.username.in_(pending_usernames)).all()

    # Formatear la respuesta
    result = [
        {
            "username": u.username,
            "age": u.age,
            "name": u.name,
            "email": u.email
            # Podés agregar más campos si querés
        }
        for u in pending_users
    ]

    return jsonify(result), 200


@bp_profile.route('/my-couple-profile', methods=['GET'])
@jwt_required()
def get_my_couple_profile():
    username = get_jwt_identity()
    profile = CoupleMode.query.filter_by(username=username).first()

    if not profile:
        return jsonify({'error': 'No tenés un perfil de pareja'}), 404

    return jsonify({
        'username': profile.username,
        'bio': profile.bio,
        'interest': profile.interest,
        'profile_picture': profile.profile_picture,
        'photos': [f"data:image/jpeg;base64,{photo.photo_data}" for photo in profile.photos]

    }), 200

@bp_profile.route('/my-friendship-profile', methods=['GET'])
@jwt_required()
def get_my_friendship_profile():
    username = get_jwt_identity()
    profile = FriendshipMode.query.filter_by(username=username).first()

    if not profile:
        return jsonify({'error': 'No tenés un perfil de amistad'}), 404

    return jsonify({
        'username': profile.username,
        'bio': profile.bio,
        'interest': profile.interest,
        'profile_picture': profile.profile_picture,
        'photos': [f"data:image/jpeg;base64,{photo.photo_data}" for photo in profile.photos]

    }), 200


from flask import request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
import base64

@bp_profile.route('/update-profile', methods=['PUT'])
@jwt_required()
def update_profile():
    username = get_jwt_identity()
    data = request.form
    print("🛠️ Actualizando perfil para:", username)
    print("📩 Form data:", data)

    mode = data.get("mode")
    bio = data.get("bio")
    interest = data.get("interest")

    if not mode or mode not in ["couple", "friendship"]:
        return jsonify({"error": "Invalid mode"}), 400

    # Buscar el perfil correspondiente
    profile_cls = CoupleMode if mode == "couple" else FriendshipMode
    profile = db.session.query(profile_cls).filter_by(username=username).first()

    if not profile:
        return jsonify({"error": "Profile not found"}), 404

    # Actualizar campos básicos
    profile.bio = bio
    profile.interest = interest

    # Si hay nueva imagen
    if 'profile_picture' in request.files:
        file = request.files['profile_picture']
        image_bytes = file.read()
        profile.profile_picture = base64.b64encode(image_bytes).decode('utf-8')

    db.session.commit()
    return jsonify({"message": "profile updated successfully"})


# @bp_profile.route('/update-profile', methods=['PUT'])
# @jwt_required()
# def update_profile():
#     data = request.get_json()
#
#     # Obtener el username desde el JWT
#     username = get_jwt_identity()
#     bio = data.get('bio', '')
#     interest = data.get('interest', '')
#     mode = data.get('mode', '')  # 'couple' o 'friendship'
#
#     if mode not in ['couple', 'friendship']:
#         return jsonify({'error': 'Invalid mode, must be "couple" or "friendship"'}), 400
#
#     profile = None
#
#     # Buscar el perfil dependiendo del modo seleccionado
#     if mode == 'couple':
#         profile = CoupleMode.query.filter_by(username=username).first()
#     elif mode == 'friendship':
#         profile = FriendshipMode.query.filter_by(username=username).first()
#
#     if not profile:
#         return jsonify({'error': f'{mode.capitalize()} profile not found for user {username}'}), 404
#
#     # Actualizar los datos del perfil (solo bio e interest)
#     if bio:
#         profile.bio = bio
#     if interest:
#         profile.interest = interest
#
#     try:
#         db.session.commit()
#     except Exception as e:
#         # Si hay un error al guardar en la base de datos, devolver un mensaje detallado
#         db.session.rollback()
#         return jsonify({'error': f'Error al guardar los cambios: {str(e)}'}), 500
#
#     # Devolver una respuesta exitosa
#     return jsonify({'message': 'profile updated successfully'}), 200