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

    if (!token) {
        return <Navigate to="/login" />;
    }

    // 🔁 FUNCION GLOBAL (la movimos acá arriba)
    const fetchMessages = async () => {
        try {
            const res = await fetch(`http://localhost:5001/chat/${targetUser}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = await res.json();

            const formatted = data.messages.map((msg) => {
                const isMine = msg.sender === myUsername;
                return isMine
                    ? msg.seen
                        ? `${msg.message} ✅`
                        : msg.message
                    : `${msg.sender}: ${msg.message}`;
            });

            setMessages(formatted);
            setStreak(data.streak);
        } catch (err) {
            console.error("Error fetching chat history", err);
        }
    };

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
            const displayMessage = isMine
                ? data.message
                : `${data.sender}: ${data.message}`;
            setMessages((prev) => [...prev, displayMessage]);
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

        // 👁️ Evento de mensajes vistos
        socketInstance.on("messages_seen", (data) => {
            console.log("👁️ Mensajes vistos por", data.by);
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
            });
            setInput("");
        }
    };

    return (
        <div>
            <h2>
                Chat with {targetUser} {isOnline ? "🟢 online" : "⚪️ offline"}
            </h2>
            <h3>🔥 Streak: {streak}</h3>
            <div>
                {messages.map((m, i) => (
                    <p key={i}>{m}</p>
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
