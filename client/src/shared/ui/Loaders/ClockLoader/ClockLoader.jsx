"use client";

import React, { useEffect, useState } from "react";
import "./style.scss";

const ClockLoader = ({ loading }) => {
    const [hourDeg, setHourDeg] = useState(0);
    const [minuteDeg, setMinuteDeg] = useState(0);

    useEffect(() => {
        if (!loading) return;

        const interval = setInterval(() => {
            setMinuteDeg((prev) => (prev + 15) % 360);
            setHourDeg((prev) => (prev + 5) % 360);
        }, 50);

        return () => clearInterval(interval);
    }, [loading]);

    if (!loading) return null;

    return (
        <div className="clock-loader">
            <div className="clock-loader__face">
                <div
                    className="clock-loader__hour-hand"
                    style={{ transform: `rotate(${hourDeg}deg)` }}
                />
                <div
                    className="clock-loader__minute-hand"
                    style={{ transform: `rotate(${minuteDeg}deg)` }}
                />
                <div className="clock-loader__center-dot" />
            </div>
            <div className="clock-loader__text">Загрузка...</div>
        </div>
    );
};

export { ClockLoader };
