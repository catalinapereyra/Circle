from flask import Blueprint, request, jsonify
from werkzeug.utils import secure_filename

from app.models.models import CouplePreferences, CoupleMode, User, FriendshipMode, CouplePhoto
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
    bio = data.get('bio', '')
    interest = data.get('interest', '')
    preferences_str = data.get('preferences', '')

    # ✅ Validar y convertir el string a Enum
    try:
        preference_enum = CouplePreferences(preferences_str.lower()).value
    except ValueError:
        return jsonify({'error': f'Invalid preference: {preferences_str}'}), 400


    profile_picture = None
    if 'profile_picture' in request.files:
        image_file = request.files['profile_picture']
        profile_picture = image_file.filename
        # opcional: image_file.save('ruta/' + profile_picture)

    extra_photos = request.files.getlist('extra_photos')  # busca el nombre de las fotos
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
    db.session.commit() # aca guardo el perfil

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
    db.session.commit() # aca guardo el upload de foto

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


# Añadir esto a profile_routes.py

@bp_profile.route('/check-profiles/<username>', methods=['GET'])
def check_profiles(username):
    # Buscar perfiles del usuario
    couple_profile = CoupleMode.query.filter_by(username=username).first()
    friendship_profile = FriendshipMode.query.filter_by(username=username).first()

    return jsonify({
        'has_couple_profile': couple_profile is not None,
        'has_friendship_profile': friendship_profile is not None
    })