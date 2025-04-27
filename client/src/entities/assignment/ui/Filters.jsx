import React, { memo } from "react";
import { MyButton } from "@/shared/uikit/MyButton";

export const FilterButton = memo(({ type, isActive, onClick }) => {
    const labels = {
        all: "Все задания",
        assigned: "Назначенные",
        completed: "Выполненные",
        failed: "Проваленные",
    };

    return (
        <MyButton
            className={`assignments__filter-button ${
                isActive ? "assignments__filter-button--active" : ""
            }`}
            onClick={onClick}
        >
            {labels[type]}
        </MyButton>
    );
});

export const Filters = memo(({ currentFilter, onFilterChange }) => (
    <div className="assignments__filters">
        {["all", "assigned", "completed", "failed"].map((filterType) => (
            <FilterButton
                key={filterType}
                type={filterType}
                isActive={currentFilter === filterType}
                onClick={() => onFilterChange(filterType)}
            />
        ))}
    </div>
));
