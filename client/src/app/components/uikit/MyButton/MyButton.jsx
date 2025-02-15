import React from "react";
import "./MyButton.module.scss";

function MyButton({ text, children, className, onClick }) {
    const content = children || text;
    return (
        <button className={className} onClick={onClick}>
            {content}
        </button>
    );
}

export { MyButton };
