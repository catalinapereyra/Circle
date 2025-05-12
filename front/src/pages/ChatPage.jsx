import { useEffect, useState, useRef } from "react";
import { Navigate, useParams } from "react-router-dom";
import { io } from "socket.io-client";


export default function ChatPage() {
    const { username: targetUser } = useParams();
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const myUsername = localStorage.getItem("username");
    const [isOnline, setIsOnline] = useState(false);
    const socketRef = useRef(null);
    const token = localStorage.getItem("token");
    const [streak, setStreak] = useState(0);
    const [isEphemeralMode, setIsEphemeralMode] = useState(false);
    const [ephemeralMessages, setEphemeralMessages] = useState([]);

    if (!token) {
        return <Navigate to="/login" />;
    }

    const allMessages = isEphemeralMode
        ? [...messages, ...ephemeralMessages]
        : messages;


    // 🔁 FUNCION GLOBAL (la movimos acá arriba)
    const fetchMessages = async () => {
        try {
            const res = await fetch(`http://localhost:5001/chat/${targetUser}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = await res.json();

            const normalMessages = [];
            const ephemeralMsgs = [];

            data.messages.forEach((msg) => {
                const isMine = msg.sender === myUsername;
                const text = isMine
                    ? msg.seen
                        ? `${msg.message} ✅`
                        : `${msg.message} ⏳`
                    : `${msg.sender}: ${msg.message}`;

                if (msg.ephemeral && msg.seen) {
                    console.log("msg recibido:", msg);
                    return;
                }

                if (msg.ephemeral) {
                    ephemeralMsgs.push({ ...msg, display: text });
                } else {
                    normalMessages.push({ ...msg, display: text });
                }
            });

            setMessages(normalMessages);
            setEphemeralMessages(ephemeralMsgs);
            setStreak(data.streak);

        } catch (err) {
            console.error("Error fetching chat history", err);
        }
    };

    // para avisarle al back que el mensaje fue visto
    useEffect(() => {
        allMessages.forEach((msg) => {
            if (!msg.seen && msg.sender !== myUsername) {
                socketRef.current?.emit("message_seen", { messageId: msg.id });
            }
        });
    }, [allMessages]);


    // 🔌 WebSocket setup
    useEffect(() => {
        const socketInstance = io("http://localhost:5001", {
            auth: {
                token,
            },
        });

        socketRef.current = socketInstance;

        socketInstance.on("connect", () => {
            console.log("🔌 Connecting to WebSocket");
            socketInstance.emit("join", { target_user: targetUser });
        });

        socketInstance.on("new_message", (data) => {
            const isMine = data.sender === myUsername;
            const text = isMine
                ? `${data.message} ⏳`
                : `${data.sender}: ${data.message}`;

            const messageObj = {
                id: data.id,
                sender: data.sender,
                message: data.message,
                seen: data.seen,
                ephemeral: data.ephemeral,
                display: text
            };

            if (data.ephemeral) {
                setEphemeralMessages((prev) => [...prev, messageObj]);
            } else {
                setMessages((prev) => [...prev, messageObj]);
            }
        });

        socketInstance.on("user_connected", (data) => {
            if (data.username === targetUser) {
                setIsOnline(true);
            }
        });

        socketInstance.on("user_disconnected", (data) => {
            if (data.username === targetUser) {
                setIsOnline(false);
            }
        });

        socketInstance.on("messages_seen", (data) => {
            fetchMessages(); // ✅ usamos la función global
        });

        socketInstance.on("streak_updated", (data) => {
            setStreak(data.new_streak);
        });

        return () => {
            socketInstance.disconnect();
        };
    }, [targetUser, token]);

    // 🔄 Chequear estado online
    useEffect(() => {
        if (socketRef.current) {
            socketRef.current.emit("is_user_online", { username: targetUser });

            socketRef.current.on("user_status", (data) => {
                setIsOnline(data.online);
            });
        }
    }, [targetUser]);

    // 📥 Al montar el componente, traer mensajes
    useEffect(() => {
        fetchMessages();
    }, [targetUser, token]);

    // 📤 Enviar mensaje
    const sendMessage = () => {
        if (socketRef.current) {
            socketRef.current.emit("private_message", {
                recipient: targetUser,
                message: input,
                ephemeral: isEphemeralMode,
            });
            setInput("");
        }
    };

    useEffect(() => {
        return () => {
            console.log("🧹 Limpiando efímeros al desmontar...");
            setEphemeralMessages([]);
        };
    }, []);

    return (
        <div>
            <h2>
                Chat with {targetUser} {isOnline ? "🟢 online" : "⚪️ offline"}
            </h2>
            <h3>🔥 Streak: {streak}</h3>
            <button onClick={() => setIsEphemeralMode(prev => !prev)}>
                {isEphemeralMode ? "Ir a modo Normal" : "Ir a modo Efímero"}
            </button>
            <div>
                {allMessages.map((m, i) => (
                    <p key={i}>{m.display}</p>
                ))}
            </div>
            <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Write your message"
            />
            <button onClick={sendMessage}>Send</button>
        </div>
    );
}
