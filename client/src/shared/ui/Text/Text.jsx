import React from "react";
import classNames from "classnames";
import "./Text.scss";

const Text = ({
    tag: Tag = "p",
    accent = "high",
    children,
    className: parentClassName,
}) => {
    const className = classNames(
        parentClassName, // Классы от родителя
        {
            "text-high": accent === "high",
            "text-medium": accent === "medium",
            "text-disabled": accent === "disabled",
        },
    );

    return <Tag className={className}>{children}</Tag>;
};

export default Text;
