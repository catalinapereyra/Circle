from main import create_app
from app.models.models import db, CardGameQuestion

# Preguntas para el juego de cartas (solo modo pareja)
card_game_questions = [
    {
        "question": "¿Coca o Pepsi?",
        "option1": "Coca Cola",
        "option2": "Pepsi"
    },
    {
        "question": "¿Pizza o Hamburguesa?",
        "option1": "Pizza",
        "option2": "Hamburguesa"
    },
    {
        "question": "¿Playa o Montaña?",
        "option1": "Playa",
        "option2": "Montaña"
    },
    {
        "question": "¿Netflix o Disney+?",
        "option1": "Netflix",
        "option2": "Disney+"
    },
    {
        "question": "¿Café o Té?",
        "option1": "Café",
        "option2": "Té"
    },
    {
        "question": "¿Perros o Gatos?",
        "option1": "Perros",
        "option2": "Gatos"
    },
    {
        "question": "¿Verano o Invierno?",
        "option1": "Verano",
        "option2": "Invierno"
    },
    {
        "question": "¿Películas o Series?",
        "option1": "Películas",
        "option2": "Series"
    },
    {
        "question": "¿Salado o Dulce?",
        "option1": "Salado",
        "option2": "Dulce"
    },
    {
        "question": "¿Noche o Día?",
        "option1": "Noche",
        "option2": "Día"
    },
    {
        "question": "¿Spotify o YouTube Music?",
        "option1": "Spotify",
        "option2": "YouTube Music"
    },
    {
        "question": "¿Quedarse en casa o Salir?",
        "option1": "Quedarse en casa",
        "option2": "Salir"
    },
    {
        "question": "¿iPhone o Android?",
        "option1": "iPhone",
        "option2": "Android"
    },
    {
        "question": "¿Libro físico o E-book?",
        "option1": "Libro físico",
        "option2": "E-book"
    },
    {
        "question": "¿Dulce de leche o Nutella?",
        "option1": "Dulce de leche",
        "option2": "Nutella"
    },
    {
        "question": "¿Instagram o TikTok?",
        "option1": "Instagram",
        "option2": "TikTok"
    },
    {
        "question": "¿Empanadas o Milanesas?",
        "option1": "Empanadas",
        "option2": "Milanesas"
    },
    {
        "question": "¿Messi o Ronaldo?",
        "option1": "Messi",
        "option2": "Ronaldo"
    },
    {
        "question": "¿Carnes o Verduras?",
        "option1": "Carnes",
        "option2": "Verduras"
    },
    {
        "question": "¿Gym o Deportes al aire libre?",
        "option1": "Gym",
        "option2": "Deportes al aire libre"
    }
]

# Crear y ejecutar app context
app = create_app()

with app.app_context():
    # Eliminar preguntas existentes (opcional, para evitar duplicados)
    # CardGameQuestion.query.delete()

    for q_data in card_game_questions:
        question = CardGameQuestion(
            question=q_data["question"],
            option1=q_data["option1"],
            option2=q_data["option2"]
        )
        db.session.add(question)

    db.session.commit()
    print("✅ Preguntas del juego de cartas cargadas exitosamente.")
    print(f"📊 Total de preguntas cargadas: {len(card_game_questions)}")