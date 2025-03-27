from . import db  # importar 'db' desde __init__.py en models
from enum import Enum

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
    location = db.Column(db.String(255), nullable=False) # ver si hay que hacerlo con coordenadas o que!!!!!!
    id_subscription = db.Column(db.Integer, db.ForeignKey('subscription.id'), nullable=False) # columna de clave foránea en la tabla actual que hace referencia a la columna id de la tabla subscription

