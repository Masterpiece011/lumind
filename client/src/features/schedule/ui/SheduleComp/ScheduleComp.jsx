"use client";

import React, { useState } from "react";
import { MyButton } from "@/shared/uikit/MyButton";
import "./ScheduleComp.scss";

const SchedulePage = () => {
    const [activeWeek, setActiveWeek] = useState("Неделя 1");
    const [weekFilter, setWeekFilter] = useState("");
    const [dateFilter, setDateFilter] = useState("");

    const scheduleData = [
        {
            day: "Понедельник",
            date: "27.02.2025",
            entries: [
                {
                    time: "15:40 - ..4ч",
                    title: "Цифровая экономика и сквозные технологии",
                    teachers: "Доц. С.В. Шкиотов",
                    type: "пр. з. 4 часа",
                    location: "B-222",
                },
            ],
        },
        {
            day: "Вторник",
            date: "27.02.2025",
            entries: [
                {
                    time: "15:40 - ..4ч",
                    title: "Цифровая экономика и сквозные технологии",
                    teachers: "Доц. С.В. Шкиотов",
                    type: "пр. з. 4 часа",
                    location: "B-222",
                },
            ],
        },
        {
            day: "Среда",
            date: "27.02.2025",
            entries: [],
        },
        {
            day: "Четверг",
            date: "27.02.2025",
            entries: [],
        },
        {
            day: "Пятница",
            date: "27.02.2025",
            entries: [],
        },
    ];

    return (
        <div className="schedule">
            <div className="schedule__header">
                <div className="schedule__week-selector">
                    <MyButton
                        className={`schedule__week-button ${activeWeek === "Неделя 1" ? "schedule__week-button--active" : ""}`}
                        onClick={() => setActiveWeek("Неделя 1")}
                    >
                        Неделя 1
                    </MyButton>
                    <MyButton
                        className={`schedule__week-button ${activeWeek === "Неделя 2" ? "schedule__week-button--active" : ""}`}
                        onClick={() => setActiveWeek("Неделя 2")}
                    >
                        Неделя 2
                    </MyButton>
                </div>

                <div className="schedule__filters">
                    <div className="schedule__filter">
                        <label className="schedule__filter-label">Неделя</label>
                        <input
                            type="text"
                            className="schedule__filter-input"
                            value={weekFilter}
                            onChange={(e) => setWeekFilter(e.target.value)}
                        />
                    </div>

                    <div className="schedule__filter">
                        <label className="schedule__filter-label">Дата</label>
                        <input
                            type="text"
                            className="schedule__filter-input"
                            value={dateFilter}
                            onChange={(e) => setDateFilter(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="schedule__table">
                <div className="schedule__table-header">
                    <div className="schedule__table-cell">День/Время</div>
                    <div className="schedule__table-cell schedule__divider">
                        Наименование дисциплины
                    </div>
                    <div className="schedule__table-cell schedule__divider">
                        Преподаватель
                    </div>
                    <div className="schedule__table-cell schedule__divider">
                        Тип/Часы
                    </div>
                    <div className="schedule__table-cell schedule__divider">
                        Аудитория
                    </div>
                </div>

                {scheduleData.map((dayData, index) => (
                    <div key={index} className="schedule__day-container">
                        <div className="schedule__day-header">
                            <div className="schedule__day-name">
                                {dayData.day}
                            </div>
                            <div className="schedule__day-date">
                                {dayData.date}
                            </div>
                        </div>

                        {dayData.entries.length > 0 ? (
                            dayData.entries.map((entry, entryIndex) => (
                                <div
                                    key={entryIndex}
                                    className="schedule__table-row"
                                >
                                    <div className="schedule__table-cell schedule__time">
                                        {entry.time}
                                    </div>
                                    <div className="schedule__table-cell schedule__divider schedule__title">
                                        {entry.title}
                                    </div>
                                    <div className="schedule__table-cell schedule__divider schedule__teachers">
                                        {entry.teachers}
                                    </div>
                                    <div className="schedule__table-cell schedule__divider schedule__type">
                                        {entry.type}
                                    </div>
                                    <div className="schedule__table-cell schedule__divider schedule__location">
                                        {entry.location}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="schedule__table-row schedule__no-entries">
                                <div className="schedule__table-cell">
                                    Нет занятий
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export { SchedulePage };
