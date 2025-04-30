"use client";

import { useEffect, useRef, useState } from "react";

export const useWebSocket = (url, userId) => {
    const [messages, setMessages] = useState([]);
    const [isConnected, setIsConnected] = useState(false);
    const ws = useRef(null);

    useEffect(() => {
        if (!userId) return;

        // Создаем подключение
        ws.current = new WebSocket(url);

        ws.current.onopen = () => {
            console.log("WebSocket connected");
            setIsConnected(true);
            // Отправляем идентификацию пользователя
            ws.current.send(
                JSON.stringify({
                    type: "connection",
                    userId,
                }),
            );
        };

        ws.current.onmessage = (event) => {
            const message = JSON.parse(event.data);
            setMessages((prev) => [...prev, message]);
        };

        ws.current.onclose = () => {
            console.log("WebSocket disconnected");
            setIsConnected(false);
        };

        ws.current.onerror = (error) => {
            console.error("WebSocket error:", error);
        };

        return () => {
            if (ws.current) {
                ws.current.close();
            }
        };
    }, [url, userId]);

    const sendMessage = (message) => {
        if (ws.current && isConnected) {
            ws.current.send(
                JSON.stringify({
                    ...message,
                    userId,
                }),
            );
        }
    };

    return { messages, sendMessage, isConnected };
};
