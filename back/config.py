class Config:
    SQLALCHEMY_DATABASE_URI = 'postgresql://postgres:postgres@localhost/circle'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = "circle-cata-rochi"