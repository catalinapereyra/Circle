from enum import Enum

import sqlalchemy

from datetime import datetime
from app.extensions import db

metadata = sqlalchemy.MetaData()


class Genders(Enum): #clase para generar las opciones de gender
    MALE = 1
    FEMALE = 2
    OTHER = 3

class User(db.Model):
    __tablename__ = 'user'

    username = db.Column(db.String(25), unique=True, nullable=False, primary_key=True)
    password = db.Column(db.String(30), nullable=False)
    name = db.Column(db.String(15), nullable=False)
    age = db.Column(db.Integer, nullable=False)
    email = db.Column(db.String(100), nullable=False, unique=True)
    gender = db.Column(db.Enum(Genders), nullable=False)
    location = db.Column(db.String(255), nullable=False)

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
    filename = db.Column(db.String(255), nullable=False)

    couple = db.relationship('CoupleMode', backref='photos') # para poder acceder de una foto al perfil y del perfil a la foto

class CoupleMode(db.Model):
    __tablename__ = 'couple_mode'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(25), db.ForeignKey('user.username'), nullable=False)

    profile_picture = db.Column(db.String(255))
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
    filename = db.Column(db.String(255), nullable=False)

    friendship = db.relationship('FriendshipMode', backref='photos') # para poder acceder de una foto al perfil y del perfil a la foto


class FriendshipMode(db.Model):
    __tablename__ = 'friendship_mode'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(25), db.ForeignKey('user.username'), nullable=False)

    profile_picture = db.Column(db.String(255))
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



