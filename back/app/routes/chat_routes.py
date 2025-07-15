import random

from app.extensions import socketio
from flask import Blueprint, render_template, request, jsonify
from flask_socketio import join_room, leave_room, send, emit
from app.routes.match_routes import is_there_a_match
from flask_jwt_extended import get_jwt_identity, jwt_required
from app.models.models import Message, Mode, Chat, db, CoupleMode, FriendshipMode, UsedQuestion, Question, \
    CardGameInteraction, CardGameQuestion, CardGameAnswer
from flask_jwt_extended import verify_jwt_in_request
from flask_socketio import disconnect
from flask_jwt_extended import decode_token
from datetime import datetime, timedelta
from sqlalchemy import or_, not_, and_
from app.models.models import Match

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
    if mode == Mode.COUPLE:
        return CoupleMode.query.filter_by(username=username).first()
    elif mode == Mode.FRIENDSHIP:
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
            is_question = False,
        )
        db.session.add(new_message)
        db.session.commit()
        streaks(chat.id)

        recipient_sid = get_sid_by_username(recipient)
        if recipient_sid:
            socketio.emit("new_message", {
                "sender": sender,
                "message": message_text,
                "ephemeral": ephemeral,
                "seen": False,  # receptor no lo vio
                "id": new_message.id,
                "is_question": new_message.is_question,
            }, to=recipient_sid)

        socketio.emit("new_message", {
            "sender": sender,
            "message": message_text,
            "ephemeral": ephemeral,
            "seen": True,
            "id": new_message.id,
            "is_question": new_message.is_question,
        }, to=request.sid)


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
    if mode == Mode.COUPLE:
        profile = CoupleMode.query.get(profile_id)
    elif mode == Mode.FRIENDSHIP:
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
    # if not match:
    #     return jsonify([])

    # obtiene el chat relacionado a ese match
    chat = Chat.query.filter_by(match_id=match.id).first()
    # if not chat:
    #     return jsonify([])

    if not match or not chat:
        return jsonify({
            "chat_id": None,
            "messages": [],
            "streak": 0
        })

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
        "chat_id": chat.id,
        "match_id": match.id,
        "mode": match.mode.value,  # <-- ESTA ES LA CLAVE
        "messages": [
            {
                "sender": get_username_from_profile(m.sender_profile_id, m.sender_mode),
                "message": m.content,
                "timestamp": m.timestamp.isoformat(),
                "seen": m.seen,
                "ephemeral": m.ephemeral,
                "id": m.id,
                "is_question": m.is_question,
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
        return jsonify({
            "chat_id": None,
            "messages": [],
            "streak": 0
        })

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


@socketio.on("random_question_game")
def question_game(data):
    print("📥 Socket recibió 'random_question_game':", data)
    try:
        chat_id = data.get("chat_id")
        recipient = data.get("recipient")
        sender = request.environ.get("username")

        chat = Chat.query.get(chat_id)
        if not chat:
            print("❌ Chat no encontrado con id:", chat_id)
            emit("error", {"error": "Chat no encontrado"}, to=request.sid)
            return

        match = Match.query.get(chat.match_id)
        if not match:
            print("❌ Match no encontrado para chat:", chat.id)
            emit("error", {"error": "Match no encontrado"}, to=request.sid)
            return

        if not match or not chat:
            return jsonify({
                "chat_id": None,
                "messages": [],
                "streak": 0
            })

        used_question_ids = [uq.question_id for uq in UsedQuestion.query.filter_by(chat_id=chat_id).all()]

        available_questions = Question.query.filter(
            ~Question.id.in_(used_question_ids),
            Question.mode == match.mode
        ).all()

        if not available_questions:
            print("no more available questions")
            return

        import random
        question = random.choice(available_questions)
        print(question)


        # Guardar que fue usada
        used = UsedQuestion(chat_id=chat_id, question_id=question.id)
        db.session.add(used)
        db.session.commit()

        sender_profile = get_sender_profile(sender, match.mode)
        if not sender_profile:
            print("❌ No se encontró el perfil del sender")
            return

        new_message = Message(
            chat_id=chat_id,
            sender_profile_id = sender_profile.id,
            sender_mode= match.mode,
            content=question.question,
            ephemeral=False,
            seen=False,
            is_question = True
        )
        db.session.add(new_message)
        db.session.commit()

        # Emitir al receptor
        emit("new_message", {
            "sender": sender,
            "message": question.question,
            "ephemeral": False,
            "seen": False,
            "id": new_message.id,
            "is_question": True
        }, to=get_sid_by_username(recipient))

        # Emitir al emisor (ya marcado como visto)
        # emit("new_message", {
        #     "sender": sender,
        #     "message": question.question,
        #     "ephemeral": False,
        #     "seen": True,
        #     "id": new_message.id,
        #     "is_question": True
        # }, to=request.sid)

        print("🎲 Pregunta seleccionada:", question.question)
        emit("question_sent", {"status": "ok", "question": question.question}, to=request.sid)
    except Exception as e:
        print("❌ Error en random_question_game:", e)

#usuario inicia el juego
@socketio.on("start_card_game")
def handle_start_card_game(data):
    print("📥 Inicio de juego de cartas recibido con data:", data)
    try:
        match_id = data.get("match_id")
        sender = request.environ.get("username")
        print("👤 Usuario iniciador:", sender)
        print("🎮 Match ID:", match_id)

        match = Match.query.get(match_id)
        if not match:
            print("❌ Match no encontrado")
            emit("new_message", {
                "sender": "Sistema",
                "message": "Match inválido",
                "ephemeral": False,
                "seen": True,
                "id": -1,
                "is_question": False
            }, to=request.sid)
            return
        if match.mode != Mode.COUPLE:
            print("❌ El match no es modo couple:", match.mode)
            emit("new_message", {
                "sender": "Sistema",
                "message": "Modo incorrecto para este match",
                "ephemeral": False,
                "seen": True,
                "id": -1,
                "is_question": False
            }, to=request.sid)
            return
        if sender not in [match.user1, match.user2]:
            print("❌ Usuario no forma parte del match:", sender)
            emit("new_message", {
                "sender": "Sistema",
                "message": "No estás autorizado para este match",
                "ephemeral": False,
                "seen": True,
                "id": -1,
                "is_question": False
            }, to=request.sid)
            return

        # Verifica si hay una interacción previa no completada
        existing = (
            CardGameInteraction.query
            .filter_by(match_id=match_id, completed=False)
            .order_by(CardGameInteraction.created_at.desc())
            .first()
        )

        if existing:
            print("📦 Ya hay una interacción activa con ID:", existing.id)
            respuestas = CardGameAnswer.query.filter_by(interaction_id=existing.id).all()
            usernames = set(r.user_username for r in respuestas)
            print("👥 Usuarios que ya respondieron:", usernames)

            if match.user1 in usernames and match.user2 not in usernames:
                print("⛔ Solo uno respondió. No se puede iniciar nuevo juego.")
                emit("new_message", {
                    "sender": "Sistema",
                    "message": "Ya hay una partida activa. Esperá que el otro jugador termine.",
                    "ephemeral": False,
                    "seen": True,
                    "id": -1,
                    "is_question": False
                }, to=request.sid)
                return

        # Selección de preguntas
        all_questions = CardGameQuestion.query.all()
        print(f"📊 Total de preguntas disponibles: {len(all_questions)}")
        if len(all_questions) < 5:
            emit("new_message", {
                "sender": "Sistema",
                "message": "No hay suficientes preguntas para iniciar el juego",
                "ephemeral": False,
                "seen": True,
                "id": -1,
                "is_question": False
            }, to=request.sid)
            return

        selected_ids = random.sample([q.id for q in all_questions], 5)
        print("🎯 Preguntas seleccionadas:", selected_ids)
        selected = [q for q in all_questions if q.id in selected_ids]
        question_ids = [q.id for q in selected]

        # Crear interacción
        interaction = CardGameInteraction(match_id=match_id, question_ids=question_ids)
        db.session.add(interaction)
        db.session.commit()
        print(f"🆕 Interacción creada con ID: {interaction.id}")

        # Armar datos para el frontend
        questions_data = [{
            "id": q.id,
            "question": q.question,
            "option1": q.option1,
            "option2": q.option2
        } for q in selected]

        # Emitir evento a ambos jugadores
        for username in [match.user1, match.user2]:
            sid = get_sid_by_username(username)
            print(f"📤 Enviando preguntas a {username} (SID: {sid})")
            emit("card_game_started", {
                "interaction_id": interaction.id,
                "questions": questions_data
            }, to=sid)

        # print(f"✅ Juego iniciado por {sender}, preguntas enviadas a ambos")


    except Exception as e:
        print("❌ Error en start_card_game:", e)
        emit("new_message", {
            "sender": "Sistema",
            "message": "Error inesperado al iniciar el juego",
            "ephemeral": False,
            "seen": True,
            "id": -1,
            "is_question": False
        }, to=request.sid)


#usuario temrina de responder
@socketio.on("card_game_completed")
def handle_card_game_completed(data):
    try:
        print("📩 Datos recibidos en card_game_completed:", data)

        sender = request.environ.get("username")
        match_id = data.get("match_id")
        interaction_id = data.get("interaction_id")
        recipient = data.get("recipient")
        answers = data.get("answers")

        print(f"👤 Usuario: {sender}, Match: {match_id}, Interacción: {interaction_id}, Destinatario: {recipient}")
        print(f"📚 Respuestas recibidas: {answers}")

        match = Match.query.get(match_id)
        if not match:
            emit("new_message", {
                "sender": "Sistema",
                "message": "Match inválido",
                "ephemeral": False,
                "seen": True,
                "id": -1,
                "is_question": False
            }, to=request.sid)
            return
        if sender not in [match.user1, match.user2]:
            print("❌ El usuario no pertenece al match")
            emit("error", {"error": "No autorizado"}, to=request.sid)
            return

        interaction = CardGameInteraction.query.get(interaction_id)
        if not interaction or interaction.match_id != match_id:
            print("❌ Interacción inválida o no pertenece al match")
            emit("error", {"error": "Interacción inválida"}, to=request.sid)
            return

        already_answered = CardGameAnswer.query.filter_by(
            interaction_id=interaction.id,
            user_username=sender
        ).first()

        if already_answered:
            print("⚠️ Usuario ya había respondido esta interacción")
            emit("error", {"error": "Ya enviaste tus respuestas"}, to=request.sid)
            return

        print("📝 Guardando respuestas en la base de datos...")
        for a in answers:
            print(" - Respuesta:", a)
            ans = CardGameAnswer(
                interaction_id=interaction.id,
                user_username=sender,
                question_id=a["question_id"],
                answer=a["answer"]
            )
            db.session.add(ans)
        db.session.commit()
        print("✅ Respuestas guardadas")

        print(f"📤 Enviando preguntas al destinatario: {recipient}")
        question_ids = interaction.question_ids
        questions = CardGameQuestion.query.filter(CardGameQuestion.id.in_(question_ids)).all()
        questions_dict = {q.id: q for q in questions}
        ordered_questions = [questions_dict[qid] for qid in question_ids if qid in questions_dict]

        questions_data = [{
            "id": q.id,
            "question": q.question,
            "option1": q.option1,
            "option2": q.option2
        } for q in ordered_questions]

        recipient_sid = get_sid_by_username(recipient)
        print("🔄 SID del destinatario:", recipient_sid)
        emit("card_game_started", {
            "interaction_id": interaction.id,
            "questions": questions_data
        }, to=recipient_sid)

        emit("card_game_saved", {"status": "ok"}, to=request.sid)
        print("💾 Confirmación enviada al iniciador")

        # Verificar si ambos respondieron
        answers_user1 = CardGameAnswer.query.filter_by(interaction_id=interaction.id, user_username=match.user1).all()
        answers_user2 = CardGameAnswer.query.filter_by(interaction_id=interaction.id, user_username=match.user2).all()
        print(f"👥 Respuestas de {match.user1}: {len(answers_user1)}")
        print(f"👥 Respuestas de {match.user2}: {len(answers_user2)}")

        if answers_user1 and answers_user2:
            print("🔍 Comparando respuestas...")
            map1 = {a.question_id: a.answer for a in answers_user1}
            map2 = {a.question_id: a.answer for a in answers_user2}
            coincidences = []

            for qid in map1:
                if qid in map2 and map1[qid] == map2[qid]:
                    q = CardGameQuestion.query.get(qid)
                    coincidences.append({
                        "question": q.question,
                        "answer": map1[qid]
                    })

            interaction.completed = True
            db.session.commit()
            print("✅ Interacción marcada como completada")
            print("🎯 Coincidencias encontradas:", coincidences)

            resumen = (
                "No tuvieron coincidencias 🥲"
                if len(coincidences) == 0
                else f"Tuvieron {len(coincidences)} coincidencia{'s' if len(coincidences) > 1 else ''} 🎉"
            )

            system_message = {
                "sender": "Sistema",
                "message": resumen,
                "ephemeral": False,
                "seen": True,
                "id": -1,
                "is_question": False,
                "card_game_summary": True,
                "coincidences": coincidences
            }

            for username in [match.user1, match.user2]:
                sid = get_sid_by_username(username)
                print(f"📢 Enviando resultado y mensaje a {username} (SID: {sid})")
                emit("card_game_result", {
                    "coincidences": coincidences
                }, to=sid)
                emit("new_message", system_message, to=sid)

    except Exception as e:
        print("❌ Error en card_game_completed:", e)
        emit("error", {"error": "Error al guardar respuestas"}, to=request.sid)



@socketio.on("check_card_game_turn")
def handle_check_card_game_turn(data):
    # se activa cuando el segundo jugador entra al chat y el frontend quiere verificar si le toca jugar
    try:
        print("🔍 check_card_game_turn invocado")
        print("📩 Data recibida:", data)

        # Autenticación y validación del match
        sender = request.environ.get("username")
        match_id = data.get("match_id")
        print(f"👤 Usuario autenticado: {sender}")
        print(f"🔗 Match ID recibido: {match_id}")

        # Si el match no existe o el usuario no pertenece a ese match, se corta todo.
        match = Match.query.get(match_id)
        if not match:
            print("❌ No se encontró el match en la base de datos")
            emit("error", {"error": "Match inválido"}, to=request.sid)
            return
        if sender not in [match.user1, match.user2]:
            print(f"❌ Usuario {sender} no pertenece al match entre {match.user1} y {match.user2}")
            emit("error", {"error": "Match no autorizado"}, to=request.sid)
            return

        print(f"✅ Usuario autorizado para el match")

        # Se busca si ya existe una partida de cartas creada para ese match.
        # interaction = CardGameInteraction.query.filter_by(match_id=match_id).first()
        interaction = (
            CardGameInteraction.query
            .filter_by(match_id=match_id, completed=False)
            .order_by(CardGameInteraction.created_at.desc())
            .first()
        )
        if not interaction:
            print(f"⚠️ No hay interacción activa para el match {match_id}")
            emit("error", {"error": "No hay juego de cartas activo para este match"}, to=request.sid)
            return
        else:
            print(f"🃏 Interacción activa encontrada: ID {interaction.id}")
            print(f"📅 Preguntas asociadas: {interaction.question_ids}")

        print(f"🧩 Interacción encontrada con ID: {interaction.id}")

        # Consulta si el usuario ya respondió el juego.
        already_answered = CardGameAnswer.query.filter_by(
            interaction_id=interaction.id,
            user_username=sender
        ).first()

        # Si ya completó el juego, no se le vuelve a enviar nadaaa
        if already_answered:
            print(f"⛔ El usuario {sender} ya completó esta interacción")
            emit("new_message", {
                "sender": "Sistema",
                "message": "Ya completaste este juego de cartas",
                "ephemeral": False,
                "seen": True,
                "id": -1,
                "is_question": False
            }, to=request.sid)
            return

        # Enviar las preguntas en orden original
        question_ids = interaction.question_ids
        print("📑 IDs de preguntas en esta interacción:", question_ids)
        questions = CardGameQuestion.query.filter(CardGameQuestion.id.in_(question_ids)).all()
        questions_dict = {q.id: q for q in questions}
        ordered_questions = [questions_dict[qid] for qid in question_ids if qid in questions_dict]
        print(f"📤 {len(ordered_questions)} preguntas encontradas y ordenadas")

        # Se arma el formato que el frontend espera.
        questions_data = [{
            "id": q.id,
            "question": q.question,
            "option1": q.option1,
            "option2": q.option2
        } for q in ordered_questions]

        # Emitir evento al jugador
        emit("card_game_your_turn", {
            "interaction_id": interaction.id,
            "questions": questions_data,
            "message": f"{match.user1 if match.user2 == sender else match.user2} comenzó un juego de cartas. ¿Querés responder?"
        }, to=request.sid)

        # Se le envía al jugador las preguntas para que comience su turno
        print(f"✅ Preguntas enviadas correctamente a {sender}")


    except Exception as e:
        print("❌ Error en check_card_game_turn:", e)
        emit("new_message", {
            "sender": "Sistema",
            "message": "Error al verificar si te toca responder",
            "ephemeral": False,
            "seen": True,
            "id": -1,
            "is_question": False
        }, to=request.sid)