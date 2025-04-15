import React from "react";
import * as styles from "./UiModal.module.scss";

const UiModal = ({ isOpen, onClose, children }) => {
    if (!isOpen) return null;

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div
            className={styles.modalOverlay}
            onClick={handleOverlayClick}
            style={{ pointerEvents: isOpen ? "auto" : "none" }}
        >
            <div
                className={styles.modalContent}
                onClick={(e) => e.stopPropagation()}
            >
                {children}
            </div>
        </div>
    );
};

UiModal.Header = function UiModalHeader({ children, className = "" }) {
    return (
        <div className={`${styles.modalHeader} ${className}`}>{children}</div>
    );
};

UiModal.Body = function UiModalBody({ children, className = "" }) {
    return <div className={`${styles.modalBody} ${className}`}>{children}</div>;
};

UiModal.Footer = function UiModalFooter({ children, className = "" }) {
    return (
        <div className={`${styles.modalFooter} ${className}`}>{children}</div>
    );
};

export { UiModal };
