import enum
from enum import Enum

import sqlalchemy

from datetime import datetime
from app.extensions import db
from geoalchemy2 import Geometry, Geography

metadata = sqlalchemy.MetaData()


class Genders(Enum): #clase para generar las opciones de gender
    MALE = 1
    FEMALE = 2
    OTHER = 3

class Mode(enum.Enum):
    FRIENDSHIP = "friendship"
    COUPLE = "couple"


class User(db.Model):
    __tablename__ = 'user'

    username = db.Column(db.String(25), unique=True, nullable=False, primary_key=True)
    password = db.Column(db.String(30), nullable=False)
    name = db.Column(db.String(15), nullable=False)
    age = db.Column(db.Integer, nullable=False)
    email = db.Column(db.String(100), nullable=False, unique=True)
    gender = db.Column(db.Enum(Genders), nullable=False)
    # location = db.Column(db.String(255), nullable=False)
    # location = db.Column(Geometry(geometry_type='POINT', srid=4326))
    location = db.Column(Geography(geometry_type='POINT', srid=4326))

    premium_subscription = db.relationship(
        'PremiumSubscription',
        backref='user',
        uselist=False,
        cascade='all, delete-orphan'
    )


class CouplePreferences(Enum):
    WOMEN = 'women'
    MEN = 'men'
    BOTH = 'both'
    ALL = 'all'
    BINARY = 'binary'

class CouplePhoto(db.Model):
    # creamos una tabla para guardar las fotos del perfil porque si las guardaramos en la tabla couple:
        # si hay pocas fotos -> hay muchos nulls
        # haces un query y tenes todas las fotos -> + simple
        # Agregar/eliminar fotos sin modificar la estructura de la tabla CoupleMode
    __tablename__ = 'couple_photos'

    id = db.Column(db.Integer, primary_key=True)
    couple_id = db.Column(db.Integer, db.ForeignKey('couple_mode.id'), nullable=False)
    photo_data = db.Column(db.Text, nullable=False)

    couple = db.relationship('CoupleMode', backref='photos') # para poder acceder de una foto al perfil y del perfil a la foto

class CoupleMode(db.Model):
    __tablename__ = 'couple_mode'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(25), db.ForeignKey('user.username'), nullable=False)

    profile_picture = db.Column(db.Text, nullable=False)
    bio = db.Column(db.Text)
    preferences = db.Column(db.String(50), nullable=False)
    active = db.Column(db.Boolean, default=True)
    interest = db.Column(db.String(255))

    user = db.relationship('User', backref=db.backref('couple_mode', uselist=False))

class FriendshipPhoto(db.Model):
    # creamos una tabla para guardar las fotos del perfil porque si las guardaramos en la tabla couple:
        # si hay pocas fotos -> hay muchos nulls
        # haces un query y tenes todas las fotos -> + simple
        # Agregar/eliminar fotos sin modificar la estructura de la tabla CoupleMode
    __tablename__ = 'friendship_photos'

    id = db.Column(db.Integer, primary_key=True)
    friendship_id = db.Column(db.Integer, db.ForeignKey('friendship_mode.id'), nullable=False)
    photo_data = db.Column(db.Text, nullable=False)

    friendship = db.relationship('FriendshipMode', backref='photos') # para poder acceder de una foto al perfil y del perfil a la foto


class FriendshipMode(db.Model):
    __tablename__ = 'friendship_mode'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(25), db.ForeignKey('user.username'), nullable=False)

    profile_picture = db.Column(db.Text, nullable=False)
    bio = db.Column(db.Text)
    active = db.Column(db.Boolean, default=True)
    interest = db.Column(db.String(255))

    user = db.relationship('User', backref=db.backref('friendship_mode', uselist=False))

class SwipeType(Enum):
    LIKE = "like"
    DISLIKE = "dislike"


class SwipeMode(Enum):
    COUPLE = "couple"
    FRIEND = "friend"


class PremiumSubscription(db.Model):
    __tablename__ = 'premium_subscription'

    id = db.Column(db.Integer, primary_key=True)
    user_username = db.Column(db.String(25), db.ForeignKey('user.username'), nullable=False, unique=True)
    start_date = db.Column(db.DateTime)
    end_date = db.Column(db.DateTime)



class Swipe(db.Model): # creo la tabla swipes para almacenar quienes ya me aparecieron en mi home para que no me vuelvan a aparecer
    id = db.Column(db.Integer, primary_key=True)

    swiper_id = db.Column(db.String(25), db.ForeignKey('user.username'), nullable=False)
    swiped_id = db.Column(db.String(25), db.ForeignKey('user.username'), nullable=False)

    type = db.Column(db.Enum(SwipeType), nullable=False)  # LIKE o DISLIKE
    mode = db.Column(db.Enum(SwipeMode), nullable=False)  # COUPLE o FRIEND
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

    # estoes para SUBSCRIPTION, para poder hacer rollback (osea te va a mostrar todos los usuarios y que vos veas a cuales le diste dislike y que lo puedas recuperar, con esta liena se ven los dilikes)
    # swiper = db.relationship("User", foreign_keys=[swiper_id], backref="swipes_given")
    # swiped = db.relationship("User", foreign_keys=[swiped_id], backref="swipes_received")

    __table_args__ = (
        db.UniqueConstraint('swiper_id', 'swiped_id', 'mode', name='unique_swipe_per_mode'),
        # esta linea dice que no vuelva a aparecer en el mismo modo un user que ya aparece en la tabla swipe de ese user
    )



class Match(db.Model):
    __tablename__ = 'match'

    id = db.Column(db.Integer, primary_key=True)
    user1 = db.Column(db.String(25), db.ForeignKey('user.username'), nullable=False)
    user2 = db.Column(db.String(25), db.ForeignKey('user.username'), nullable=False)
    mode = db.Column(db.Enum(Mode), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    __table_args__ = (
        db.UniqueConstraint('user1', 'user2', 'mode', name='unique_match'),
    )


class Chat(db.Model):
    __tablename__ = 'chat'

    id = db.Column(db.Integer, primary_key=True)
    match_id = db.Column(db.Integer, db.ForeignKey('match.id'), nullable=False, unique=True)
    started_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relaciones
    match = db.relationship('Match', backref=db.backref('chat', uselist=False))
    messages = db.relationship('Message', backref='chat', cascade='all, delete-orphan')

    streaks = db.Column(db.Integer, default = 0)
    last_streak_time = db.Column(db.DateTime)


class Message(db.Model):
    __tablename__ = 'message'

    id = db.Column(db.Integer, primary_key=True)

    chat_id = db.Column(db.Integer, db.ForeignKey('chat.id'), nullable=False)

    sender_profile_id = db.Column(db.Integer, nullable=False)
    sender_mode = db.Column(db.Enum(Mode), nullable=False)  # "couple" o "friendship"

    content = db.Column(db.Text, nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

    ephemeral = db.Column(db.Boolean, default=False)
    seen = db.Column(db.Boolean, default=False)
    is_question = db.Column(db.Boolean, default=False)
    is_image = db.Column(db.Boolean, default=False)


    # No se define ForeignKey directa a CoupleMode o FriendshipMode por ser dinámica

class Question(db.Model):
    __tablename__ = 'question'
    id = db.Column(db.Integer, primary_key=True)
    question = db.Column(db.Text, nullable=False)
    mode = db.Column(db.Enum(Mode), nullable=False)

class UsedQuestion(db.Model):
    __tablename__ = 'used_question'
    id = db.Column(db.Integer, primary_key=True)
    question_id = db.Column(db.Integer, db.ForeignKey('question.id'), nullable=False)
    chat_id = db.Column(db.Integer, db.ForeignKey('chat.id'), nullable=False)




#Banco de preguntas
class CardGameQuestion(db.Model):
    __tablename__ = 'card_game_question'
    id = db.Column(db.Integer, primary_key=True)
    question = db.Column(db.String(255), nullable=False)
    option1 = db.Column(db.String(100), nullable=False)
    option2 = db.Column(db.String(100), nullable=False)


#Representa una partida (una selección de preguntas para un match)
class CardGameInteraction(db.Model):
    __tablename__ = 'card_game_interaction'
    id = db.Column(db.Integer, primary_key=True)
    match_id = db.Column(db.Integer, db.ForeignKey('match.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Guarda las preguntas usadas (lista fija de 5)
    question_ids = db.Column(db.ARRAY(db.Integer), nullable=False)  # o Text y lo serializás
    completed = db.Column(db.Boolean, default=False)



#Respuestas de cada usuario a esa interacción
class CardGameAnswer(db.Model):
    __tablename__ = 'card_game_answer'

    id = db.Column(db.Integer, primary_key=True)
    interaction_id = db.Column(db.Integer, db.ForeignKey('card_game_interaction.id'), nullable=False)
    user_username = db.Column(db.String(25), db.ForeignKey('user.username'), nullable=False)
    question_id = db.Column(db.Integer, db.ForeignKey('card_game_question.id'), nullable=False)
    answer = db.Column(db.String(100), nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

    interaction = db.relationship("CardGameInteraction", backref="answers")
    user = db.relationship("User")
    question = db.relationship("CardGameQuestion")



#question (pregunta aleatoria)	card_game_question (juego de cartas)
#Solo tiene question + mode	Tiene question, option1, option2