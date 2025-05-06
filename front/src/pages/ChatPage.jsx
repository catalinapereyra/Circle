import { useEffect, useState, useRef } from "react";
import {Navigate, useParams} from "react-router-dom";
import { io } from "socket.io-client";

let socket;

export default function ChatPage() {
    const { username: targetUser } = useParams();
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
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
            setMessages((prev) => [...prev, `${data.sender}: ${data.message}`]);
        });

        return () => {
            socketInstance.disconnect();
        };
    }, [targetUser, token]);

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
            <h2>Chat with {targetUser}</h2>
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