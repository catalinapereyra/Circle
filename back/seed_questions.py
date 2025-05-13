from app.extensions import db
from app.models.models import RandomQuestionGame

questions = [
    "¿Cuál es tu recuerdo favorito de la infancia?",
    "Si pudieras tener cualquier superpoder, ¿cuál sería?",
    "¿Qué harías si te ganaras la lotería hoy?",
    "¿Cuál es tu película favorita de todos los tiempos?",
    "¿A qué lugar del mundo te gustaría viajar?",
]

for q in questions:
    question = RandomQuestionGame(question=q)
    db.session.add(question)

db.session.commit()
print("✅ Preguntas cargadas exitosamente")