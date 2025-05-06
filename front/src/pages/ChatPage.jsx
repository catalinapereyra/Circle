import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";

let socket;

export default function ChatPage() {
    const { username: targetUser } = useParams();
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");

    // Conexión inicial con token
    useEffect(() => {
        const token = localStorage.getItem("token");

        socket = io("http://localhost:5001", {
            auth: { token }
        });

        socket.on("connect", () => {
            console.log("Connecting to WebSocket");
            socket.emit("join", { target_user: targetUser });
        });

        socket.on("message", (msg) => {
            setMessages((prev) => [...prev, msg]);
        });

        return () => {
            socket.disconnect();
        };
    }, [targetUser]);

    const sendMessage = () => {
        socket.emit("private_message", {
            recipient: targetUser,
            message: input
        });
        setMessages((prev) => [...prev, `Tú: ${input}`]);
        setInput("");
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