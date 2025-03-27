from app import db  # Importa la instancia de db desde la aplicación (desde el init de la app)
from enum import Enum

class Genders(Enum):
    MALE = 1
    FEMALE = 2
    OTHER = 3

class User(db.Model):
    __tablename__ = 'user' #nombro a la tabla

    #defino todas las columnas de la tabla
    username = db.Column(db.String(255), unique=True, nullable=False, primary_key=True) #username de tipo string de lomg 255 caracteres
    password = db.Column(db.String(255), nullable=False) # en SQLAlchemy no hace flata usar varchar, xq string = varchar
    name = db.Column(db.String(255), nullable=False)
    age = db.Column(db.Integer, nullable=False)
    email = db.Column(db.String(255), nullable=False, unique=True)
    gender = db.Column(db.Enum(Genders), nullable=False)
    location = db.Column(db.String(255), nullable=False) # ver si hay que hacerlo con coordenadas o que!!!!!!
    id_subscription = db.Column(db.Integer, db.ForeignKey('subscription.id'), nullable=False)

