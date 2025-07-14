import { useEffect, useState, useRef } from "react";
import { Navigate, useParams } from "react-router-dom";
import { io } from "socket.io-client";
import CardGameModal from "../../components/CardGame/CardGameModal.jsx";
import CardGameResultModal from "../../components/CardGame/CardGameResultModal.jsx";
import { FaCamera, FaUpload, FaPaperPlane } from "react-icons/fa";
import "./ChatPage.css";
import CardGameInviteModal from "../../components/CardGame/CardGameInviteModal.jsx";
//

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

    const [cardGameResult, setCardGameResult] = useState([]);
    const [showResultModal, setShowResultModal] = useState(false);
    const [showCardGame, setShowCardGame] = useState(false);
    const [cardGameQuestions, setCardGameQuestions] = useState([]);
    const [interactionId, setInteractionId] = useState(null);

    const bottomRef = useRef(null);

    const socketRef = useRef(null);
    const prevEphemeralMode = useRef(false);
    // tengo que guardar el estado para que los mensajes efimeros se borren cuando
    // cambio de ephemeral true a false, no cuando entreo al chatr, sino cuando me voy

    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [isCameraOpen, setIsCameraOpen] = useState(false);

    const [showInviteModal, setShowInviteModal] = useState(false);
    const [inviteMessage, setInviteMessage] = useState("");



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
                    is_image: msg.is_image,
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
        if (!matchId) return;
        socketRef.current?.emit("check_card_game_turn", { match_id: matchId });
    }, [matchId]);

    useEffect(() => {
        const socket = io("http://localhost:5001", { auth: { token } });
        socketRef.current = socket;

        socket.on("connect", () => {
            socket.emit("join", { target_user: targetUser });
            if (matchId) {
                socket.emit("check_card_game_turn", { match_id: matchId });
            }
        });

        socket.on("card_game_result", (data) => {
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
            setInteractionId(null);
            setCardGameQuestions([]);
        });

        socket.on("new_message", (data) => {
            const isMine = data.sender === myUsername;

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

        socket.on("card_game_started", (data) => {
            setCardGameQuestions(data.questions);
            setInteractionId(data.interaction_id);
            setShowCardGame(true);
        });

        socket.on("card_game_your_turn", (data) => {
            // Agrega el mensaje al chat como mensaje del sistema
            const notificationMessage = {
                id: Date.now(),
                sender: "Sistema",
                message: data.message,
                isMine: false,
                display: `🎴 ${data.message}`,
                is_system: true
            };
            setMessages((prev) => [...prev, notificationMessage]);

            // Guarda las preguntas y el ID de la interacción
            setCardGameQuestions(data.questions);
            setInteractionId(data.interaction_id);

            // Guarda el mensaje para mostrarlo en el modal
            setInviteMessage(data.message);
            setShowInviteModal(true);
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
            if (matchId) {
                socket.emit("check_card_game_turn", { match_id: matchId });
            }
            setInteractionId(null);
            setCardGameQuestions([]);
        });

        socket.on("error", (data) => {
            setMessages(prev => [
                ...prev,
                {
                    id: Date.now(),
                    sender: "Sistema",
                    message: data.error,
                    isMine: false,
                    display: `⚠️ ${data.error}`,
                    is_system: true,
                }
            ]);
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

    const handleCardGameClick = () => {
        if (!matchId) {
            alert("No se pudo obtener el match.");
            return;
        }

        if (interactionId && cardGameQuestions.length > 0) {
            setShowCardGame(true);
        } else {
            socketRef.current.emit("check_card_game_turn", {
                match_id: matchId,
            });
            setTimeout(() => {
                if (!interactionId) {
                    socketRef.current.emit("start_card_game", {
                        match_id: matchId,
                        recipient: targetUser,
                    });
                }
            }, 1000);
        }
    };

    const handleCardGameSubmit = (answers) => {
        socketRef.current.emit("card_game_completed", {
            match_id: matchId,
            interaction_id: interactionId,
            recipient: targetUser,
            answers
        });
    };

    //CAMARA
    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
            const base64Image = reader.result;
            socketRef.current.emit("private_message", {
                recipient: targetUser,
                message: base64Image,
                ephemeral: isEphemeralMode,
                is_image: true, // flag para saber que es imagen
            });
        };
        reader.readAsDataURL(file); // convierte a base64 para mandar como string
    };

    useEffect(() => {
        if (bottomRef.current) {
            bottomRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    const openCamera = () => {
        setIsCameraOpen(true);
    };

    useEffect(() => {
        if (!isCameraOpen) return;

        const setupCamera = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    videoRef.current.play().catch(console.error);
                }
            } catch (err) {
                console.error("❌ Error accediendo a la cámara:", err);
            }
        };

        setupCamera();
    }, [isCameraOpen]);

    useEffect(() => {
        if (isCameraOpen && videoRef.current && videoRef.current.srcObject) {
            videoRef.current.play().catch((err) => {
                console.error("Error al reproducir el video:", err);
            });
        }
    }, [isCameraOpen]);

    const closeCamera = () => {
        const stream = videoRef.current?.srcObject;
        if (stream) {
            stream.getTracks().forEach((track) => track.stop());
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
        setIsCameraOpen(false);
    };

    const takePhoto = () => {
        const video = videoRef.current;
        const canvas = canvasRef.current;

        if (!video || !canvas) return;

        // Verificá si el video tiene dimensiones válidas
        if (video.videoWidth === 0 || video.videoHeight === 0) {
            console.warn("⚠️ El video aún no está listo para capturar.");
            return;
        }

        const ctx = canvas.getContext("2d");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        const base64Image = canvas.toDataURL("image/png");

        // Confirmá que no esté vacío
        if (base64Image === "data:,") {
            console.error("❌ Imagen vacía capturada.");
            return;
        }

        console.log("📸 Capturada:", base64Image.slice(0, 80) + "...");

        socketRef.current.emit("private_message", {
            recipient: targetUser,
            message: base64Image,
            ephemeral: isEphemeralMode,
            is_image: true,
        });

        closeCamera();
    };


    return (
        <div className="chat-container">
            <div className="chat-header">
                <h2>{targetUser} {isOnline ? "🟢" : "⚪️"}</h2>
                <h3>🔥 Streak: {streak}</h3>
            </div>

            <div className="chat-controls">
                <button onClick={() => setIsEphemeralMode(prev => !prev)}>
                    {isEphemeralMode ? "Normal Chat" : "Ephemeral Chat"}
                </button>
                <button
                    onClick={() => {
                        if (!chatId) return;
                        socketRef.current.emit("random_question_game", {
                            chat_id: chatId,
                            recipient: targetUser,
                        });
                    }}>
                    ❓ Random Question Game
                </button>
                <button onClick={handleCardGameClick}>🎴 Card Game</button>
            </div>

            <div className="messages-container">
                {messages.map((m, i) => {
                    let content = m.is_question ? `❓ ${m.message}` : m.is_image
                        ? <img src={m.message} alt="sent" className="chat-image" />
                        : m.isMine
                            ? `${m.message} ${m.seen ? "✅" : "⏳"}`
                            : `${m.sender}: ${m.message}`;

                    return (
                        <div key={i} className={`message ${m.isMine ? 'message-mine' : ''} ${m.ephemeral ? 'message-ephemeral' : ''} ${m.is_question ? 'random-question' : ''}`}>
                            {content}
                        </div>
                    );
                })}
                <div ref={bottomRef}></div>
            </div>

            <div className="input-container">
                <input
                    className="chat-input"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Write your message..."
                />
                <div className="icon-buttons">
                    <label className="icon-button upload">
                        <FaUpload />
                        <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: "none" }} />
                    </label>
                    {!isCameraOpen && (
                        <label className="icon-button upload">
                            <FaCamera />
                            <input type="button" onClick={openCamera} style={{ display: "none" }} />
                        </label>
                    )}
                    <button className="send-button" onClick={sendMessage}>
                        <FaPaperPlane />
                    </button>
                </div>
            </div>

            {isCameraOpen && (
                <div className="camera-modal">
                    <video ref={videoRef} autoPlay playsInline className="video-preview" />
                    <canvas ref={canvasRef} style={{ display: "none" }} />
                    <div className="camera-buttons">
                        <button onClick={takePhoto}>📷 Tomar foto</button>
                        <button onClick={closeCamera}>❌ Cerrar</button>
                    </div>
                </div>
            )}

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

            <CardGameInviteModal
                isOpen={showInviteModal}
                message={inviteMessage}
                onAccept={() => {
                    setShowInviteModal(false);
                    setShowCardGame(true);
                }}
                onCancel={() => {
                    setShowInviteModal(false);
                }}
            />
        </div>
    );
}
//bienn