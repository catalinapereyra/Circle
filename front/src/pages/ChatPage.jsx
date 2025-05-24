import { useEffect, useState, useRef } from "react";
import { Navigate, useParams } from "react-router-dom";
import { io } from "socket.io-client";
import CardGameModal from "../components/CardGame/CardGameModal.jsx";
import CardGameResultModal from "../components/CardGame/CardGameResultModal.jsx";


export default function ChatPage() {
    const { username: targetUser } = useParams();
    const myUsername = localStorage.getItem("username");
    const token = localStorage.getItem("token");

    const [messages, setMessages] = useState([]);
    const [pendingEphemerals, setPendingEphemerals] = useState([]);
    const [input, setInput] = useState("");
    const [isEphemeralMode, setIsEphemeralMode] = useState(false);
    const [isOnline, setIsOnline] = useState(false);
    const [streak, setStreak] = useState(0);
    const [chatId, setChatId] = useState(null);
    const [matchId, setMatchId] = useState(null);
    const [userMode, setUserMode] = useState(null);
    //para el match en el juego de cartas
    const [cardGameResult, setCardGameResult] = useState([]);
    const [showResultModal, setShowResultModal] = useState(false);


    // Estado para el juego de cartas
    const [showCardGame, setShowCardGame] = useState(false);
    const [cardGameQuestions, setCardGameQuestions] = useState([]);
    const [interactionId, setInteractionId] = useState(null);

    const socketRef = useRef(null);
    const prevEphemeralMode = useRef(false);

    if (!token) return <Navigate to="/login" />;
    const currentMode = isEphemeralMode ? "ephemeral" : "normal";

    useEffect(() => {
        fetch(`http://localhost:5001/chat/${targetUser}?mode=${currentMode}`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((res) => res.json())
            .then((data) => {
                const formatted = data.messages.map((msg) => ({
                    ...msg,
                    isMine: msg.sender === myUsername,
                    display: msg.sender === myUsername
                        ? `${msg.message} ${msg.seen ? "✅" : "⏳"}`
                        : `${msg.sender}: ${msg.message}`,
                }));

                if (currentMode === "ephemeral") {
                    setPendingEphemerals(formatted);
                    setMessages([]);
                } else {
                    setMessages(formatted);
                }

                setStreak(data.streak);
                setChatId(data.chat_id || null);
                setMatchId(data.match_id || null);
                setUserMode(data.mode || null);
            });
    }, [targetUser, currentMode]);

    useEffect(() => {
        if (isEphemeralMode && pendingEphemerals.length > 0) {
            setMessages(pendingEphemerals);
        }
    }, [isEphemeralMode, pendingEphemerals]);

    useEffect(() => {
        if (prevEphemeralMode.current === true && isEphemeralMode === false) {
            pendingEphemerals.forEach((msg) => {
                socketRef.current?.emit("mark_seen", { id: msg.id });
            });
            setPendingEphemerals([]);
        }
        prevEphemeralMode.current = isEphemeralMode;
    }, [isEphemeralMode]);

    useEffect(() => {
        if (matchId && !interactionId) {
            console.log("👀 Verificando si es mi turno de jugar...");
            socketRef.current?.emit("check_card_game_turn", {
                match_id: matchId
            });
        }
    }, [matchId, interactionId]);


    useEffect(() => {
        const socket = io("http://localhost:5001", { auth: { token } });
        socketRef.current = socket;

        socket.on("connect", () => {
            socket.emit("join", { target_user: targetUser });
            // 👇 Verificar si hay un juego pendiente para este match
            if (matchId && !interactionId) {
                socket.emit("check_card_game_turn", { match_id: matchId });
            }

        });

        socket.on("card_game_result", (data) => {
            console.log("🎯 Coincidencias recibidas:", data.coincidences);
            setCardGameResult(data.coincidences);
            setShowResultModal(true);

            const resumen = data.coincidences.length === 0
                ? "No tuvieron coincidencias 🥲"
                : `Tuvieron ${data.coincidences.length} coincidencia${data.coincidences.length > 1 ? "s" : ""} 🎉`;

            const resultMsg = {
                id: Date.now(),
                sender: "Sistema",
                message: resumen,
                isMine: false,
                display: `💘 ${resumen}`,
                is_system: true
            };

            setMessages(prev => [...prev, resultMsg]);
        });



        socket.on("new_message", (data) => {
            const isMine = data.sender === myUsername;

            // Si es un resumen del juego de cartas
            if (data.card_game_summary) {
                setCardGameResult(data.coincidences || []);
                setShowResultModal(true);
            }

            const messageObj = {
                ...data,
                isMine,
                display: data.is_question
                    ? `❓ ${data.message}`
                    : isMine
                        ? `${data.message} ${data.seen ? "✅" : "⏳"}`
                        : `${data.sender}: ${data.message}`,
            };

            if (data.is_question) {
                setMessages((prev) => [...prev, messageObj]);
                return;
            }

            if (data.ephemeral && currentMode !== "ephemeral") return;
            if (!data.ephemeral && currentMode !== "normal") return;

            if (data.ephemeral && !data.seen && !isMine) {
                setPendingEphemerals((prev) => [...prev, messageObj]);
                return;
            }

            setMessages((prev) => [...prev, messageObj]);
        });


        socket.on("user_connected", (data) => {
            if (data.username === targetUser) setIsOnline(true);
        });

        socket.on("user_disconnected", (data) => {
            if (data.username === targetUser) setIsOnline(false);
        });

        socket.on("messages_seen", () => {
            fetchMessages();
        });

        socket.on("streak_updated", (data) => {
            setStreak(data.new_streak);
        });

        // 🎴 Eventos del juego de cartas
        socket.on("card_game_started", (data) => {
            setCardGameQuestions(data.questions);
            setInteractionId(data.interaction_id);
            setShowCardGame(true);
        });

        socket.on("card_game_your_turn", (data) => {
            const notificationMessage = {
                id: Date.now(),
                sender: "Sistema",
                message: data.message,
                isMine: false,
                display: `🎴 ${data.message}`,
                is_system: true
            };
            setMessages((prev) => [...prev, notificationMessage]);
        });

        socket.on("card_game_saved", () => {
            setShowCardGame(false);
            const confirmMessage = {
                id: Date.now(),
                sender: "Sistema",
                message: "¡Tus respuestas han sido guardadas!",
                isMine: false,
                display: "✅ ¡Tus respuestas han sido guardadas!",
                is_system: true
            };
            setMessages((prev) => [...prev, confirmMessage]);
        });

        socket.on("error", (data) => {
            alert(data.error);
        });

        return () => {
            socket.disconnect();
        };
    }, [targetUser, token, currentMode]);

    const sendMessage = () => {
        if (!input.trim()) return;
        socketRef.current.emit("private_message", {
            recipient: targetUser,
            message: input,
            ephemeral: isEphemeralMode,
        });
        setInput("");
    };

    const fetchMessages = () => {
        fetch(`http://localhost:5001/chat/${targetUser}?mode=${currentMode}`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((res) => res.json())
            .then((data) => {
                const formatted = data.messages.map((msg) => ({
                    ...msg,
                    isMine: msg.sender === myUsername,
                    display: msg.sender === myUsername
                        ? `${msg.message} ${msg.seen ? "✅" : "⏳"}`
                        : `${msg.sender}: ${msg.message}`,
                }));
                setMessages(formatted);
                setStreak(data.streak);
            });
    };

    // 🎴 Click en botón "Juego de cartas"
    const handleCardGameClick = () => {
        if (!matchId) {
            alert("No se pudo obtener el match.");
            return;
        }

        // Si ya hubo un juego creado (pista: interactionId fue seteado)
        if (interactionId) {
            socketRef.current.emit("check_card_game_turn", { match_id: matchId });
        } else {
            socketRef.current.emit("start_card_game", {
                match_id: matchId,
                recipient: targetUser
            });
        }
    };


    // 🎴 Enviar respuestas del juego
    const handleCardGameSubmit = (answers) => {
        socketRef.current.emit("card_game_completed", {
            match_id: matchId,
            interaction_id: interactionId,
            recipient: targetUser,
            answers: answers
        });
    };

    return (
        <div style={{ padding: "20px", maxWidth: "600px", margin: "0 auto" }}>
            <h2>Chat with {targetUser} {isOnline ? "🟢" : "⚪️"}</h2>
            <h3>🔥 Streak: {streak}</h3>

            <div style={{ marginBottom: "20px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
                <button
                    onClick={() => setIsEphemeralMode((prev) => !prev)}
                    style={{
                        padding: "8px 16px",
                        backgroundColor: isEphemeralMode ? "#ff6b6b" : "#4ecdc4",
                        color: "white",
                        border: "none",
                        borderRadius: "5px",
                        cursor: "pointer"
                    }}
                >
                    {isEphemeralMode ? "Modo normal" : "Modo efímero"}
                </button>

                <button
                    onClick={() => {
                        if (!chatId) return;
                        socketRef.current.emit("random_question_game", {
                            chat_id: chatId,
                            recipient: targetUser,
                        });
                    }}
                    style={{
                        padding: "8px 16px",
                        backgroundColor: "#845ec2",
                        color: "white",
                        border: "none",
                        borderRadius: "5px",
                        cursor: "pointer"
                    }}
                >
                    ❓ Pregunta Aleatoria
                </button>

                {userMode === "couple" && (
                    <button
                        onClick={handleCardGameClick}
                        style={{
                            padding: "8px 16px",
                            backgroundColor: "#ff416c",
                            color: "white",
                            border: "none",
                            borderRadius: "5px",
                            cursor: "pointer",
                            fontWeight: "bold"
                        }}
                    >
                        🎴 Juego de Cartas
                    </button>

                )}
            </div>

            <div style={{
                height: "400px",
                overflowY: "auto",
                border: "1px solid #ddd",
                padding: "10px",
                marginBottom: "20px",
                backgroundColor: "#f9f9f9",
                borderRadius: "5px"
            }}>
                {messages.map((m, i) => (
                    <div key={i} style={{
                        marginBottom: "8px",
                        padding: "5px",
                        backgroundColor: m.is_system ? "#e8f5e8" : m.isMine ? "#dcf8c6" : "white",
                        borderRadius: "5px",
                        border: m.is_system ? "1px solid #4caf50" : "1px solid #eee"
                    }}>
                        <span style={{ fontSize: "12px", color: "#666" }}>
                            [{m.ephemeral ? "⏱ efímero" : "💬 normal"}]
                        </span>{" "}
                        {m.display}
                    </div>
                ))}
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
                <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Escribí tu mensaje..."
                    onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                    style={{
                        flex: 1,
                        padding: "10px",
                        border: "1px solid #ddd",
                        borderRadius: "5px"
                    }}
                />
                <button
                    onClick={sendMessage}
                    style={{
                        padding: "10px 20px",
                        backgroundColor: "#007bff",
                        color: "white",
                        border: "none",
                        borderRadius: "5px",
                        cursor: "pointer"
                    }}
                >
                    Enviar
                </button>
            </div>

            {showCardGame && (
                <CardGameModal
                    questions={cardGameQuestions}
                    interactionId={interactionId}
                    matchId={matchId}
                    onSubmit={handleCardGameSubmit}
                    onClose={() => setShowCardGame(false)}
                />
            )}

            {showResultModal && (
                <CardGameResultModal
                    coincidences={cardGameResult}
                    onClose={() => setShowResultModal(false)}
                />
            )}

        </div>
    );
}
