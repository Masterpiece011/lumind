"use client";

import React from "react";
import { MyButton } from "@/shared/uikit/MyButton";
import { ASSIGNMENTS_STATUSES } from "@/shared/constants/assignments";
import "./StatusSelector.scss";

const statusOptions = [
    { value: ASSIGNMENTS_STATUSES.SUBMITTED, label: "На проверку" },
    { value: ASSIGNMENTS_STATUSES.COMPLETED, label: "Принять" },
    { value: ASSIGNMENTS_STATUSES.FAILED, label: "Вернуть" },
];

const StatusSelector = ({ currentStatus, onStatusChange, isLoading }) => {
    return (
        <div className="status-selector">
            <p className="status-selector__label">Статус:</p>
            <div className="status-selector__buttons">
                {statusOptions.map((option) => (
                    <MyButton
                        key={option.value}
                        text={option.label}
                        onClick={() => onStatusChange(option.value)}
                        disabled={isLoading || currentStatus === option.value}
                        className={`status-selector__button ${
                            currentStatus === option.value
                                ? "status-selector__button--active"
                                : ""
                        }`}
                    />
                ))}
            </div>
        </div>
    );
};

export { StatusSelector };
