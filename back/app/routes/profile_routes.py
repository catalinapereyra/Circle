from flask import Blueprint, request, jsonify
from werkzeug.utils import secure_filename

from app.models.models import CouplePreferences, CoupleMode, User, FriendshipMode
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
        preference_enum = CouplePreferences(preferences_str.lower()).value
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
    display_name = request.form.get('display_name', username)
    bio = request.form.get('bio')
    interest = request.form.get('interest')

    user = User.query.filter_by(username=username).first()
    if not user:
        return jsonify({"message": "User not found"}), 404

    profile_picture = None
    if 'profile_picture' in request.files:
        image_file = request.files['profile_picture']
        if allowed_file(image_file.filename):
            filename = secure_filename(image_file.filename)

            # ✅ asegurarse que el directorio existe
            upload_folder = 'uploads'
            os.makedirs(upload_folder, exist_ok=True)

            # ✅ guardar imagen en disco (opcional)
            image_path = os.path.join(upload_folder, filename)
            image_file.save(image_path)

            # ✅ guardar solo el nombre del archivo en DB
            profile_picture = filename
        else:
            return jsonify({"message": "Tipo de archivo no permitido"}), 400

    new_profile = FriendshipMode(
        username=username,
        display_name=display_name,
        bio=bio,
        profile_picture=profile_picture,
        interest=interest,
    )

    db.session.add(new_profile)
    db.session.commit()

    return jsonify({"message": "Perfil de amistad creado exitosamente"}), 201