import React from "react";
import "./MyButton.module.scss";

function MyButton({ text, className, onClick }) {
    return (
        <button className={className} onClick={onClick}>
            {text}
        </button>
    );
}

export { MyButton };
