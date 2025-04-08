from enum import Enum

import sqlalchemy

from main import db

metadata = sqlalchemy.MetaData()


class Genders(Enum): #clase para generar las opciones de gender
    MALE = 1
    FEMALE = 2
    OTHER = 3

class User(db.Model):
    __tablename__ = 'user' #nombro a la tabla

    #defino todas las columnas de la tabla
    username = db.Column(db.String(25), unique=True, nullable=False, primary_key=True) #username de tipo string de lomg 255 caracteres
    password = db.Column(db.String(30), nullable=False) # en SQLAlchemy no hace flata usar varchar, xq string = varchar
    name = db.Column(db.String(15), nullable=False)
    age = db.Column(db.Integer, nullable=False)
    email = db.Column(db.String(100), nullable=False, unique=True)
    gender = db.Column(db.Enum(Genders), nullable=False)
    location = db.Column(db.String(255), nullable=False)

class CouplePreferences(Enum):
    WOMEN = 'women'
    MEN = 'men'
    BOTH = 'both'
    ALL = 'all'
    BINARY = 'binary'

class CoupleMode(db.Model):
    __tablename__ = 'couple_mode'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(25), db.ForeignKey('user.username'), nullable=False)

    display_name = db.Column(db.String(50), nullable=False)
    profile_picture = db.Column(db.String(255))
    bio = db.Column(db.Text)
    preferences = db.Column(db.String(50), nullable=False)
    active = db.Column(db.Boolean, default=True)
    interest = db.Column(db.String(255))

    user = db.relationship('User', backref=db.backref('couple_mode', uselist=False))


class FriendshipMode(db.Model):
    __tablename__ = 'friendship_mode'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(25), db.ForeignKey('user.username'), nullable=False)

    display_name = db.Column(db.String(50), nullable=False)
    profile_picture = db.Column(db.String(255))
    bio = db.Column(db.Text)
    preferences = db.Column(db.Text)
    active = db.Column(db.Boolean, default=True)
    interest = db.Column(db.String(255))

    user = db.relationship('User', backref=db.backref('friendship_mode', uselist=False))
