import socketio
from flask import Blueprint, render_template, request
from flask_socketio import join_room, leave_room, send
from match_routes import is_there_a_match


chat_bp = Blueprint('chat', __name__)

@chat_bp.route('/chat')
def chat():
    return render_template('chat.html')
# frontend JavaScript that connects to SocketIO and handles sending/receiving messages.

@socketio.on('join')
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
            join_room(room) #agrego current user al room
            send(f"{username} joined the chat.", to=room)
        else:
            send("There is no match to open chat", to=request.sid)
    except KeyError:
        send("Incomplete data to open a chat", to=request.sid)
    except Exception as e:
        print(f"Error in handle_join: {e}")
        send("An error occurred when joining chat", to=request.sid)
        # request.sid permite enviar mensajes sólo al cliente actual, por mas q no está en un room

@socketio.on('private_message')
def handle_private_message(data):
    sender = data['sender']
    recipient = data['recipient']
    message = data['message']
    room = get_room_name(sender, recipient)
    send(f"{sender}: {message}", to=room)

def get_room_name(user1, user2):
    return "_".join(sorted([user1, user2]))
    #uso esta funcion siempre para crear los rooms de los users para consistencia