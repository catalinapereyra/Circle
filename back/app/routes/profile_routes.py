from flask import Blueprint, request, jsonify
from werkzeug.utils import secure_filename
from app.models.user import User
from app.models.profile import CoupleMode, FriendshipMode, CouplePreferences
from main import db
import os

bp_profile = Blueprint('profile', __name__)

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


@bp_profile.route('/couple-profile', methods=['POST'])
def create_couple_profile():
    data = request.form
    print("📥 Form Data recibido:", data)

    username = data['username']
    display_name = data.get('display_name', '')
    bio = data.get('bio', '')
    interest = data.get('interest', '')
    preferences_str = data.get('preferences', '')

    # ✅ Validar y convertir el string a Enum
    try:
        preference_enum = CouplePreferences(preferences_str.lower())
    except ValueError:
        return jsonify({'error': f'Invalid preference: {preferences_str}'}), 400

    profile_picture = None
    if 'profilePicture' in request.files:
        image_file = request.files['profilePicture']
        profile_picture = image_file.filename
        # opcional: image_file.save('ruta/' + profile_picture)

    new_profile = CoupleMode(
        username=username,
        display_name=display_name,
        profile_picture=profile_picture,
        bio=bio,
        preferences=preference_enum,
        interest=interest
    )

    db.session.add(new_profile)
    db.session.commit()

    return jsonify({'message': 'Couple profile created successfully'})



@bp_profile.route('/friendship-profile', methods=['POST'])
def create_friendship_profile():
    username = request.form.get('username')
    bio = request.form.get('bio')
    picture = request.files.get('profile_picture')
    interest = request.form.get('interest')

    user = User.query.filter_by(username=username).first()
    if not user:
        return jsonify({"message": "User not found"}), 404

    picture_path = None
    if picture and allowed_file(picture.filename):
        filename = secure_filename(picture.filename)
        picture_path = os.path.join('uploads', filename)
        picture.save(picture_path)
    elif picture:
        return jsonify({"message": "Tipo de archivo no permitido"}), 400

    new_profile = FriendshipMode(
        username=username,
        display_name=username,
        bio=bio,
        profile_picture=picture_path,
        interest=interest,
    )

    db.session.add(new_profile)
    db.session.commit()

    return jsonify({"message": "Perfil de amistad creado exitosamente"}), 201