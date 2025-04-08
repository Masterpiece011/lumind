"use client";

import React, {
    createContext,
    useState,
    useContext,
    useCallback,
    useEffect,
} from "react";
import { UiModal } from "./UiModal";

const ModalContext = createContext();

export const ModalProvider = ({ children }) => {
    const [modalContent, setModalContent] = useState(null);
    const [isOpen, setIsOpen] = useState(false);

    const openModal = useCallback((content) => {
        setModalContent(content);
        setIsOpen(true);
        document.body.style.overflow = "hidden";
    }, []);

    const closeModal = useCallback(() => {
        setIsOpen(false);
        setModalContent(null);
        document.body.style.overflow = "auto";
    }, []);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "Escape") {
                closeModal();
            }
        };

        if (isOpen) {
            document.addEventListener("keydown", handleKeyDown);
        }

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [isOpen, closeModal]);

    return (
        <ModalContext.Provider
            value={{ openModal, closeModal, isModalOpen: isOpen }}
        >
            {children}
            <UiModal isOpen={isOpen} onClose={closeModal}>
                {modalContent}
            </UiModal>
        </ModalContext.Provider>
    );
};

export const useModal = () => {
    const context = useContext(ModalContext);
    if (!context) {
        throw new Error("useModal must be used within a ModalProvider");
    }
    return context;
};
