"use client";

import React, { useState, useRef, useEffect } from "react";

import * as buttonStyles from "../../../../shared/uikit/MyButton/MyButton.module.scss";
import "./style.scss";
import { MyButton } from "@/shared/uikit/MyButton";
import SearchIcon from "@/shared/assets/icons/search-icon.svg";
import PaperClipIcon from "@/shared/assets/icons/paperclip-icon.svg";
import SendIcon from "@/shared/assets/icons/send-icon.svg";
import { Icon } from "@/shared/uikit/icons";
import { FileItem } from "@/shared/ui/FileComp";

const ChatPage = ({ userId }) => {
    const [activeChat, setActiveChat] = useState(1);
    const [message, setMessage] = useState("");
    const [conversations, setConversations] = useState([
        {
            id: 1,
            name: "Общий чат",
            lastMessage: "Редакли СА, Объемы наличия привладел:",
            time: "12:30",
            unread: 3,
            messages: [
                {
                    id: 1,
                    text: "Исправлять бланк пересчитания автоматически?",
                    time: "02.04 10:30",
                    outgoing: false,
                    sender: "Александрова Екатерина Викторовна",
                },
                {
                    id: 2,
                    text: "Поверенное сертификаты о происхождении...",
                    time: "02.04 11:45",
                    outgoing: true,
                },
                {
                    id: 3,
                    file: "Рисветкана_praktika.ppt",
                    time: "00.08 00:38",
                    outgoing: false,
                    sender: "Коробкова Мадина Нукрепевна",
                },
            ],
        },
    ]);

    const messagesEndRef = useRef(null);

    //const scrollToBottom = () => {
    //messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    //};

    //useEffect(() => {
    //  scrollToBottom();
    // }, [activeChat]);

    const handleSendMessage = () => {
        if (!message.trim()) return;

        const updatedConversations = conversations.map((conv) => {
            if (conv.id === activeChat) {
                return {
                    ...conv,
                    messages: [
                        ...conv.messages,
                        {
                            id: conv.messages.length + 1,
                            text: message,
                            time: new Date().toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                            }),
                            outgoing: true,
                        },
                    ],
                    lastMessage: message,
                    time: new Date().toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                    }),
                };
            }
            return conv;
        });

        setConversations(updatedConversations);
        setMessage("");
        setTimeout(scrollToBottom, 100);
    };

    const activeConversation = conversations.find(
        (conv) => conv.id === activeChat,
    );

    return (
        <div className="chat">
            <div className="chat__container">
                <div className="chat__sidebar">
                    <div className="chat__header">Чаты</div>
                    <div className="chat__search">
                        <Icon
                            className="chat__search-icon"
                            src={SearchIcon}
                            alt="search-icon"
                        />
                        <input
                            type="text"
                            placeholder="Поиск в сообщениях"
                            className="chat__search-input"
                        />
                    </div>
                    <div className="chat__conversations">
                        {conversations.map((conv) => (
                            <div
                                key={conv.id}
                                className={`conversation ${activeChat === conv.id ? "conversation--active" : ""}`}
                                onClick={() => setActiveChat(conv.id)}
                            >
                                <div className="conversation__header">
                                    <div className="conversation__name">
                                        {conv.name}
                                    </div>
                                    <div className="conversation__time">
                                        {conv.time}
                                    </div>
                                </div>
                                <div
                                    className={`conversation__preview ${conv.unread ? "conversation__preview--unread" : ""}`}
                                >
                                    {conv.lastMessage}
                                    {conv.unread > 0 && (
                                        <div className="conversation__badge">
                                            {conv.unread}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="chat__main">
                    <div className="chat__messages">
                        {activeConversation?.messages?.map((msg) => (
                            <div
                                key={msg.id}
                                className={`chat__message ${msg.outgoing ? "chat__message--outgoing" : ""}`}
                            >
                                {!msg.outgoing && msg.sender && (
                                    <div className="chat__message__sender">
                                        {msg.sender}
                                    </div>
                                )}
                                <div
                                    className={`chat__message__content ${msg.outgoing ? "chat__message__content--outgoing" : ""}`}
                                >
                                    {msg.text}
                                    {msg.file && (
                                        <div className="chat__message__file">
                                            {msg.file}
                                        </div>
                                    )}
                                </div>
                                <div className="chat__message__meta">
                                    {msg.time}
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>
                    <div className="chat__input">
                        <div className="chat__input-wrapper">
                            <textarea
                                className="chat__input-field"
                                placeholder="Написать сообщение..."
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                onKeyPress={(e) =>
                                    e.key === "Enter" &&
                                    !e.shiftKey &&
                                    handleSendMessage()
                                }
                            />
                            <div className="chat__input-actions">
                                <MyButton className="chat__input-action">
                                    <Icon
                                        className="chat__input-action-icon"
                                        src={PaperClipIcon}
                                        alt="paperclip-icon"
                                    />
                                </MyButton>
                                <MyButton
                                    className="chat__input-action"
                                    onClick={handleSendMessage}
                                >
                                    <Icon
                                        className="chat__input-action-icon"
                                        src={SendIcon}
                                        alt="send-icon"
                                    />
                                </MyButton>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export { ChatPage };
