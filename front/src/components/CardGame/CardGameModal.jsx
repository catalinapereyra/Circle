import React, { useState } from "react";
import "./CardGameModal.css";

//OnSubmit: función que se ejecuta al completar todas las respuestas
// onClose: cierra el modal

//Muestra una pregunta por vez, con dos opciones. Cuando el usuario responde todas, llama a onSubmit(answers).
function CardGameModal({ questions, interactionId, matchId, onSubmit, onClose }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState([]);
    const currentQuestion = questions[currentIndex]; // pregunta actual

    //Al hacer clic en una opción: Se guarda la respuesta con question_id y answer ; Si quedan más preguntas, avanza
    // Si es la última, llama a onSubmit
    const handleAnswer = (option) => {
        const newAnswers = [...answers, {
            question_id: currentQuestion.id,
            answer: option
        }];
        setAnswers(newAnswers);

        if (currentIndex < questions.length - 1) {
            setCurrentIndex(currentIndex + 1);
        } else {
            // Juego completado
            onSubmit(newAnswers);
        }
    };

    return (
        <div className="card-game-modal">
            <div className="card-game-container">
                <div className="header">
                    <h3>Pregunta {currentIndex + 1}/{questions.length}</h3>
                    <button onClick={onClose} className="close-button">×</button>
                </div>

                <div className="question-section">
                    <p className="question">{currentQuestion.question}</p>
                    <div className="options">
                        <button onClick={() => handleAnswer(currentQuestion.option1)}>{currentQuestion.option1}</button>
                        <button onClick={() => handleAnswer(currentQuestion.option2)}>{currentQuestion.option2}</button>
                    </div>
                </div>

                <div className="progress">
                    {questions.map((_, idx) => (
                        <span
                            key={idx}
                            className={`dot ${idx === currentIndex ? "active" : ""} ${idx < currentIndex ? "done" : ""}`}
                        ></span>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default CardGameModal;
