import React from "react";
import "./MyButton.module.scss";

function MyButton({ text, className }) {
    return <button className={className}>{text}</button>;
}

export { MyButton };
