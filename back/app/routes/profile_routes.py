from flask import Blueprint, request, jsonify
from werkzeug.utils import secure_filename

from app.models.models import CouplePreferences, CoupleMode, User, FriendshipMode, CouplePhoto, FriendshipPhoto
from main import db
import os
from flask_jwt_extended import jwt_required, get_jwt_identity


bp_profile = Blueprint('profile', __name__)

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


@bp_profile.route('/couple-profile', methods=['POST'])
@jwt_required()
def create_couple_profile():
    print("fjfyjfjfjy")
    data = request.form
    print("📥 Form Data recibido:", data)

    username = get_jwt_identity()  # Usamos el username del token
    print(username)

    bio = data.get('bio', '')
    interest = data.get('interest', '')
    preferences_str = data.get('preferences', '')

    try:
        preference_enum = CouplePreferences(preferences_str.lower()).value
    except ValueError:
        return jsonify({'error': f'Invalid preference: {preferences_str}'}), 400

    profile_picture = None
    if 'profile_picture' in request.files:
        image_file = request.files['profile_picture']
        profile_picture = image_file.filename

    extra_photos = request.files.getlist('extra_photos')
    if len(extra_photos) < 3 or len(extra_photos) > 10:
        return jsonify({'error': 'You must upload between 3 and 10 extra photos.'}), 400

    new_profile = CoupleMode(
        username=username,
        profile_picture=profile_picture,
        bio=bio,
        preferences=preference_enum,
        interest=interest
    )

    db.session.add(new_profile)
    db.session.commit()

    upload_folder = 'uploads/couple_photos'
    os.makedirs(upload_folder, exist_ok=True)

    for file in extra_photos:
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            filepath = os.path.join(upload_folder, filename)
            file.save(filepath)

            photo = CouplePhoto(couple_id=new_profile.id, filename=filename)
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

    username = get_jwt_identity()  # ✅ Usamos el username del token

    bio = data.get('bio', '')
    interest = data.get('interest', '')

    profile_picture = None
    if 'profile_picture' in request.files:
        image_file = request.files['profile_picture']
        profile_picture = image_file.filename

    extra_photos = request.files.getlist('extra_photos')
    if len(extra_photos) < 3 or len(extra_photos) > 10:
        return jsonify({'error': 'You must upload between 3 and 10 extra photos.'}), 400

    new_profile = FriendshipMode(
        username=username,
        profile_picture=profile_picture,
        bio=bio,
        interest=interest
    )

    db.session.add(new_profile)
    db.session.commit()

    upload_folder = 'uploads/friendship_photos'
    os.makedirs(upload_folder, exist_ok=True)

    for file in extra_photos:
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            filepath = os.path.join(upload_folder, filename)
            file.save(filepath)

            photo = FriendshipPhoto(friendship_id=new_profile.id, filename=filename)
            db.session.add(photo)
        else:
            return jsonify({'error': 'Invalid file type'}), 400

    db.session.commit()

    return jsonify({'message': 'Friendship profile created successfully'})


@bp_profile.route('/check-profiles/<username>', methods=['GET'])
def check_profiles(username):
    # Buscar perfiles del usuario
    couple_profile = CoupleMode.query.filter_by(username=username).first()
    friendship_profile = FriendshipMode.query.filter_by(username=username).first()

    return jsonify({
        'has_couple_profile': couple_profile is not None,
        'has_friendship_profile': friendship_profile is not None
    })

@bp_profile.route('/home/<mode>', methods=['GET'])
def get_profiles_by_mode(mode):
    if mode == 'couple':
        profiles = CoupleMode.query.all()
        result = [
            {
                'username': p.username,
                'bio': p.bio,
                'interest': p.interest,
                'profile_picture': p.profile_picture
            }
            for p in profiles
        ]
        return jsonify(result)

    elif mode == 'friendship':
        profiles = FriendshipMode.query.all()
        result = [
            {
                'username': p.username,
                'bio': p.bio,
                'interest': p.interest,
                'profile_picture': p.profile_picture
            }
            for p in profiles
        ]
        return jsonify(result)

    else:
        return jsonify({'error': 'Modo inválido'}), 400
