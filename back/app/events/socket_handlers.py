from flask_jwt_extended import decode_token
from flask_socketio import disconnect, emit
from flask import request
from app.extensions import socketio
online_users = set()

#verificar token
@socketio.on("connect")
def handle_socket_connect(auth):
    # print("auth recibido en connect:", auth)
    token = auth.get("token") if auth else None #recibe el token desde react

    if not token:
        print("No token provided, disconnecting.")
        return False

    try:
        # si el token es valido, guarda mi username en environ, por eso depsues lo puedo acceder desde ahi
        # si no era valido, directamente ni lo guarda y cuando hago el join para crear el room me tira unothorised
        decoded = decode_token(token)
        username = decoded["sub"]
        request.environ['username'] = username # si es valido lo guarda
        online_users.add(username) # agrego username a online set
        socketio.emit("user_disconnected",
                      {"username": username})  # para no tener que refrescar y cambie el estado del user
        print(f"Usuario {username} conectado por WebSocket")
    except Exception as e:
        print("Token inválido:", e)
        return False

#user online?
@socketio.on("is_user_online")
def handle_is_user_online(data):
    target = data.get("username")
    if target in online_users:
        emit("user_status", {"username": target, "online": True}, to=request.sid)
    else:
        emit("user_status", {"username": target, "online": False}, to=request.sid)

@socketio.on("disconnect")
def handle_disconnect():
    username = request.environ.get("username")
    if username:
        online_users.discard(username) #eliminar usuario del set
        socketio.emit("user_disconnected", {"username": username}) # para no tener que refrescar y cambie el estado del user
        print(f"{username} se desconectó (OFFLINE)")