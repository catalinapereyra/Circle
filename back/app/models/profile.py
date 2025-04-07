from main import db
from sqlalchemy import Enum
import enum
from app.models.user import User


# Enum para las preferencias del modo pareja
class CouplePreferences(enum.Enum):
    WOMEN = 'women'
    MEN = 'men'
    BOTH = 'both'
    OTHER = 'other'

class CoupleMode(db.Model):
    __tablename__ = 'couple_mode'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(25), db.ForeignKey('user.username'), nullable=False)

    display_name = db.Column(db.String(50), nullable=False)
    profile_picture = db.Column(db.String(255))
    bio = db.Column(db.Text)
    preferences = db.Column(db.Enum(CouplePreferences), nullable=False)
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
