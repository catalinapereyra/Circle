import { useEffect, useState, useRef } from "react";
import {Navigate, useParams} from "react-router-dom";
import { io } from "socket.io-client";

let socket;

export default function ChatPage() {
    const { username: targetUser } = useParams();
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const myUsername = localStorage.getItem("username");
    const [isOnline, setIsOnline] = useState(false);
    const socketRef = useRef(null);


    const token = localStorage.getItem("token");

    if (!token) {
        return <Navigate to="/login" />;
    }

    // Conexión inicial con token
    useEffect(() => {
        const socketInstance = io("http://localhost:5001", {
            auth: {
                token: localStorage.getItem("token")
            }
        });

        // Guardamos el socket en el ref
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


        return () => {
            socketInstance.disconnect();
        };
    }, [targetUser, token]);

    useEffect(() => {
        if (socketRef.current) {
            socketRef.current.emit("is_user_online", { username: targetUser });

            socketRef.current.on("user_status", (data) => {
                setIsOnline(data.online);
            });
        }
    }, [targetUser]);

    const sendMessage = () => {
        debugger
        if (socketRef.current) {
            socketRef.current.emit("private_message", {
                recipient: targetUser,
                message: input
            });
            setInput("");
        }
    };

    return (
        <div>
            <h2>
                Chat with {targetUser} {isOnline ? "🟢 online" : "⚪️ offline"}
            </h2>
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