import { useState, useCallback } from "react";

export const useAccordion = (initialState = false) => {
    const [isExpanded, setIsExpanded] = useState(initialState);

    const toggleAccordion = useCallback(() => {
        setIsExpanded((prev) => !prev);
    }, []);

    return {
        isExpanded,
        toggleAccordion,
    };
};
