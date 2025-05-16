import { useEffect, useState, useRef } from "react";
import { Navigate, useParams } from "react-router-dom";
import { io } from "socket.io-client";

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

    const socketRef = useRef(null);
    const prevEphemeralMode = useRef(false);
    // tengo que guardar el estado para que los mensajes efimeros se borren cuando
    // cambio de ephemeral true a false, no cuando entreo al chatr, sino cuando me voy

    if (!token) return <Navigate to="/login" />;

    const currentMode = isEphemeralMode ? "ephemeral" : "normal";

    // 🔁 Fetch de mensajes según el modo
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

                // Si es efímero y no visto, guardarlo en pendingEphemerals
                if (currentMode === "ephemeral") {
                    setPendingEphemerals(formatted);
                    setMessages([]); // mostrar solo cuando se active
                } else {
                    setMessages(formatted);
                }

                console.log("🟢 data:", data);

                setStreak(data.streak);

                if (data.chat_id) {
                    console.log("✅ chatId recibido:", data.chat_id);
                    setChatId(data.chat_id);
                }
            });
    }, [targetUser, currentMode]);


    // Cuando se entra a modo efímero, se muestran los efimeros
    useEffect(() => {
        if (isEphemeralMode && pendingEphemerals.length > 0) {
            // Mostrar los mensajes efímeros en la vista
            setMessages(pendingEphemerals);
        }
    }, [isEphemeralMode, pendingEphemerals]);

    // cuando salgo del modo efimero (epehemeral -> true a false) se marcan como vistos
    useEffect(() => {
        if (prevEphemeralMode.current === true && isEphemeralMode === false) {
            // sali del efimero → marcar como vistos
            pendingEphemerals.forEach((msg) => {
                socketRef.current?.emit("mark_seen", { id: msg.id });
            });
            setPendingEphemerals([]);
        }

        prevEphemeralMode.current = isEphemeralMode;
    }, [isEphemeralMode]);

    // 🔌 WebSocket setup
    useEffect(() => {
        const socket = io("http://localhost:5001", { auth: { token } });
        socketRef.current = socket;

        socket.on("connect", () => {
            socket.emit("join", { target_user: targetUser });
        });

        socket.on("new_message", (data) => {
            const isMine = data.sender === myUsername;
            const messageObj = {
                ...data,
                isMine,
                display: data.is_question
                    ? `❓ ${data.message}`
                    : isMine
                        ? `${data.message} ${data.seen ? "✅" : "⏳"}`
                        : `${data.sender}: ${data.message}`,
            };

            // Mostrar preguntas siempre, sin importar el modo
            if (data.is_question) {
                setMessages((prev) => [...prev, messageObj]);
                return;
            }

            console.log("📩 Recibido mensaje:", data);
            // Mostrar solo si el mensaje pertenece al modo actual
            if (data.ephemeral && currentMode !== "ephemeral") return;
            if (!data.ephemeral && currentMode !== "normal") return;

            // Si es efímero no visto y yo soy el receptor
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

    return (
        <div>
            <h2>Chat with {targetUser} {isOnline ? "🟢" : "⚪️"}</h2>
            <h3>🔥 Streak: {streak}</h3>

            <button onClick={() => setIsEphemeralMode((prev) => !prev)}>
                {isEphemeralMode ? "Modo normal" : "Modo efímero"}
            </button>

            <button
                onClick={() => {
                    if (!chatId) {
                        console.warn("⚠️ chatId aún no está listo");
                        return;
                    }
                    console.log("✅ Enviando pregunta con chat_id:", chatId);
                    socketRef.current.emit("random_question_game", {
                        chat_id: chatId,
                        recipient: targetUser,
                    });
                }}
            >
                ❓ Pregunta Aleatoria (socket)
            </button>

            <div>
                {messages.map((m, i) => (
                    <p key={i}>
                        [{m.ephemeral ? "⏱ efímero" : "💬 normal"}] {m.display}
                    </p>
                ))}
            </div>

            <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Escribí tu mensaje..."
            />
            <button onClick={sendMessage}>Enviar</button>
        </div>
    );
}