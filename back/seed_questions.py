from main import create_app
from app.models.models import  db, Question, Mode

# Preguntas para modo pareja
couple_questions = [
    "¿Cuál es tu cita ideal?",
    "¿Qué significa el amor para vos?",
    "¿Qué es más importante: confianza o química?",
    "¿Te ves formando una familia en el futuro?",
    "¿Qué es lo que más valorás en una relación?"
]

# Preguntas para modo amistad
friendship_questions = [
    "¿Qué tipo de amistad valorás más?",
    "¿Preferís un plan tranqui o salir de fiesta?",
    "¿Cuál es tu forma favorita de pasar el tiempo con amigxs?",
    "¿Qué buscás en una amistad duradera?",
    "¿Cuál fue el mejor momento que viviste con un/a amigx?"
]

# Crear y ejecutar app context
app = create_app()

with app.app_context():
    for text in couple_questions:
        question = Question(question=text, mode=Mode.COUPLE)
        db.session.add(question)

    for text in friendship_questions:
        question = Question(question=text, mode=Mode.FRIENDSHIP)
        db.session.add(question)

    db.session.commit()
    print("✅ Preguntas cargadas exitosamente.")