from flask_jwt_extended import decode_token
from flask_socketio import disconnect
from flask import request
from app.extensions import socketio

@socketio.on("connect")
def handle_socket_connect(auth):
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
        print(f"Usuario {username} conectado por WebSocket")
    except Exception as e:
        print("Token inválido:", e)
        return False