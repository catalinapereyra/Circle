from app.extensions import socketio
from flask import Blueprint, render_template, request, jsonify
from flask_socketio import join_room, leave_room, send, emit
from app.routes.match_routes import is_there_a_match
from flask_jwt_extended import get_jwt_identity, jwt_required
from app.models.models import Message, MatchMode, Chat, db, CoupleMode, FriendshipMode
from flask_jwt_extended import verify_jwt_in_request
from flask_socketio import disconnect
from flask_jwt_extended import decode_token
from datetime import datetime, timedelta
from sqlalchemy import or_, not_, and_

chat_bp = Blueprint('chat', __name__)
connected_users = {}

@chat_bp.route('/chat')
def chat():
    return render_template('chat.html')
# frontend JavaScript that connects to SocketIO and handles sending/receiving messages.
#devuelve un html de ejemplo si queres testear el chat por navegador

@socketio.on('join')
#se ejecuta cuando un usuario se une a un chat: agarra el nombre del usuario del token (request.environ), verifica que haya un match con el otro usuario (target_user)
def handle_join(data):
    # se corre esta funcion cuando se crea el chat
    try:
        username = request.environ.get('username') # lo agarra del token
        target_user = data['target_user']
        if not username:
            send("Unauthorized", to=request.sid)
            return

        if is_there_a_match(username, target_user):
            room = get_room_name(username, target_user)
            print('joining room', room)
            join_room(room) #agrego current user al room
            send(f"{username} joined the chat.", to=room) #si hay match, lo une a un room websocket que comparten ambos
        else:
            send("There is no match to open chat", to=request.sid) #si no hay match, le envia un mensaje de error al cliente actual (request.sid)
    except KeyError:
        send("Incomplete data to open a chat", to=request.sid)
    except Exception as e:
        print(f"Error in handle_join: {e}")
        send("An error occurred when joining chat", to=request.sid)
        # request.sid permite enviar mensajes sólo al cliente actual, por mas q no está en un room


#busca un match entre dos usuarios, sin importar el orden
def get_match_instance(user1, user2):
    from app.models.models import Match
    return Match.query.filter(
        ((Match.user1 == user1) & (Match.user2 == user2)) |
        ((Match.user1 == user2) & (Match.user2 == user1))
    ).first()
#devuelve el objeto match si existe


#busca el perfil (couple o friendship) segun el modo del match
def get_sender_profile(username, mode):
    from app.models.models import CoupleMode, FriendshipMode
    if mode == MatchMode.COUPLE:
        return CoupleMode.query.filter_by(username=username).first()
    elif mode == MatchMode.FRIENDSHIP:
        return FriendshipMode.query.filter_by(username=username).first()
    return None


#se ejecuta cuando se envia un mensaje privado, verifica el match, y si no existe no lo hace
@socketio.on("private_message")
def handle_private_message(data):
    try:
        sender = request.environ.get("username")
        recipient = data["recipient"]
        message_text = data["message"]
        ephemeral = data.get("ephemeral", False)

        # verificas que haya un match
        if not is_there_a_match(sender, recipient):
            send("No match, message not saved", to=request.sid)
            return

        # busca o crea el chat asociado al match
        match = get_match_instance(sender, recipient)
        chat = Chat.query.filter_by(match_id=match.id).first()
        if not chat:
            chat = Chat(match_id=match.id)
            db.session.add(chat)
            db.session.commit()

        # Detectss quien es el sender profile (Couple o Friendship)
        sender_profile = get_sender_profile(sender, match.mode)
        if not sender_profile:
            send("No profile found for sender", to=request.sid)
            return

        # crea y guarda un nuevo objeto Message en la base
        new_message = Message(
            chat_id=chat.id,
            sender_profile_id=sender_profile.id,
            sender_mode=match.mode,
            content=message_text,
            ephemeral = ephemeral,
            seen = False,
        )
        db.session.add(new_message)
        db.session.commit()
        streaks(chat.id)

        recipient_sid = get_sid_by_username(recipient)
        if recipient_sid:
            socketio.emit("new_message", {
                "sender": sender,
                "message": message_text,
                "ephemeral": False,
                "seen": False,  # receptor no lo vio
                "id": new_message.id
            }, to=recipient_sid)

        socketio.emit("new_message", {
            "sender": sender,
            "message": message_text,
            "ephemeral": False,
            "seen": True,
            "id": new_message.id
        }, to=request.sid)

        #emite el mensaje a todos los usuarios en el room
        # room = get_room_name(sender, recipient)
        #
        # socketio.emit("new_message", {
        #     "sender": sender,
        #     "message": message_text,
        #     "ephemeral": ephemeral,
        #     "seen": False,
        #     "id": new_message.id
        # }, to=room)

    except Exception as e:
        print("Error saving message:", e)
        send("Error processing message", to=request.sid)

def get_sid_by_username(username):
    return connected_users.get(username)

# genera un nombre de sala ordenando alfabeticamente los usernames
def get_room_name(user1, user2):
    return "_".join(sorted([user1, user2]))
    #uso esta funcion siempre para crear los rooms de los users para consistencia

#recibe el id del perfil y el modo (couple o friendship) y busca el username original desde la tabla correspondiente
def get_username_from_profile(profile_id, mode):
    if mode == MatchMode.COUPLE:
        profile = CoupleMode.query.get(profile_id)
    elif mode == MatchMode.FRIENDSHIP:
        profile = FriendshipMode.query.get(profile_id)
    else:
        return "Unknown"

    return profile.username if profile else "Deleted"


# se usa cuando el frontend entra a la vista de chat, busca el match entre el usuario actual y el que recibe, desp busca el chat
#trae todos los mensajes de ese chat, ordenados por fecha y los convierte a json con el sender, el content y timestamp
@chat_bp.route('/chat/<username>', methods=['GET'])
@jwt_required()
def get_chat_messages(username):
    current_user = get_jwt_identity()
    message_mode = request.args.get("mode", "normal")

    # busca el match
    match = get_match_instance(current_user, username)
    if not match:
        return jsonify([])

    # obtiene el chat relacionado a ese match
    chat = Chat.query.filter_by(match_id=match.id).first()
    if not chat:
        return jsonify([])

    # trae los mensajes de ese chat
    # messages = Message.query.filter_by(chat_id=chat.id).order_by(Message.timestamp.asc()).all()

    # filyto los mensajes dependiendo el modo para que solo me muestre los de ese modo
    if message_mode == "normal":
        messages = Message.query.filter(
            Message.chat_id == chat.id,
            Message.ephemeral == False
        ).order_by(Message.timestamp.asc()).all()
    elif message_mode == "ephemeral":
        messages = Message.query.filter(
            Message.chat_id == chat.id,
            Message.ephemeral == True,
            Message.seen == False  # solo mostrar efímeros NO vistos
        ).order_by(Message.timestamp.asc()).all()
    else:
        return jsonify([])  # modo inválido

    for msg in messages:
        sender_username = get_username_from_profile(msg.sender_profile_id, msg.sender_mode)
        if sender_username != current_user and not msg.seen:
            msg.seen = True  # solo los del modo actual

    db.session.commit()

    # Emitir evento a la otra persona notificando que sus mensajes fueron vistos
    room = get_room_name(current_user, username)
    socketio.emit("messages_seen", {
        "by": current_user
    }, to=room)

    current_streak = streaks(chat.id)

    return jsonify({
        "messages": [
            {
                "sender": get_username_from_profile(m.sender_profile_id, m.sender_mode),
                "message": m.content,
                "timestamp": m.timestamp.isoformat(),
                "seen": m.seen,
                "ephemeral": m.ephemeral,
                "id": m.id,
            } for m in messages
        ],
        "streak": current_streak
    })


@socketio.on("connect")
def handle_connect(auth):
    try:
        token = auth.get("token") if auth else None
        if not token:
            print("❌ Faltó token al conectar")
            disconnect()
            return

        decoded = decode_token(token)
        username = decoded["sub"]  # el username lo tenés como 'identity' al hacer create_access_token(identity=username)

        request.environ["username"] = username
        connected_users[username] = request.sid
        print(f"✅ Usuario {username} conectado por WebSocket")

    except Exception as e:
        print("❌ Error al conectar WebSocket:", e)
        disconnect()



def streaks(chat_id):
    chat = Chat.query.get(chat_id)

    if not chat:
        return 0  # o podrías crear uno nuevo

    now = datetime.utcnow()

    # Solo actualizamos si pasaron 10 minutos desde la última vez
    if chat.last_streak_time is None or now - chat.last_streak_time >= timedelta(minutes=1):
        ten_minutes_ago = now - timedelta(minutes=1)

        last_messages = Message.query.filter(
            Message.chat_id == chat_id,
            Message.timestamp >= ten_minutes_ago
        ).order_by(Message.timestamp.desc()).all()

        users = {message.sender_profile_id for message in last_messages}

        if len(users) == 2:
            chat.streaks += 1
        else:
            chat.streaks = 0

        chat.last_streak_time = now # seteo el nuevo last check
        db.session.commit()

        match = chat.match  # accede al match de este chat
        room = get_room_name(match.user1, match.user2)  # usa los usernames reales
        socketio.emit("streak_updated", {
            "chat_id": chat.id,
            "new_streak": chat.streaks
        }, to=room)

    return chat.streaks

@socketio.on("message_seen")
def handle_message_seen(data):
    message = Message.query.get(data["messageId"])
    if message and not message.seen:
        message.seen = True
        db.session.commit()

        emit("messages_seen", {
            "messageId": message.id,
            "by": get_jwt_identity()
        }, to=str(message.sender_profile_id))

@socketio.on("leave")
def handle_leave():
    sid = request.sid

    # Buscar el usuario desconectado y borrarlo del mapa
    disconnected_user = None
    for username, stored_sid in list(connected_users.items()):
        if stored_sid == sid:
            disconnected_user = username
            del connected_users[username]
            print(f"👋 Usuario {username} desconectado del WebSocket")
            break

    if not disconnected_user:
        return

    # Borrar mensajes efímeros ya vistos enviados por este usuario
    messages = Message.query.filter_by(
        sender=disconnected_user,
        ephemeral=True,
        seen=True
    ).all()

    for m in messages:
        db.session.delete(m)

    db.session.commit()

@socketio.on("mark_seen")
def handle_mark_seen(data):
    try:
        msg = Message.query.get(data["id"])
        if msg and msg.ephemeral and not msg.seen:
            msg.seen = True
            db.session.commit()
    except Exception as e:
        print("Error updating seen = true:", e)