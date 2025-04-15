"use client";

import React from "react";
import "./style.scss";
import { useAccordion } from "@/shared/lib/hooks/useAccordion";
import * as buttonStyles from "@/shared/uikit/MyButton/MyButton.module.scss";
import { MyButton } from "@/shared/uikit/MyButton";
import { Icon } from "../../shared/uikit/icons";
import Arrow from "@/app/assets/icons/arrow-icon.svg";
import SheduleImg from "@/app/assets/img/shedule-img.png";
import ChatImg from "@/app/assets/img/chat-img.png";

function HomeComp() {
    const schedule = useAccordion();
    const chat = useAccordion();
    const teams = useAccordion();
    const calls = useAccordion();

    return (
        <div className="home">
            <div className="home__item">
                <div className="home__item-header">
                    <MyButton
                        className={`${buttonStyles.accordionButton} ${schedule.isExpanded ? "teams__button--active" : ""}`}
                        onClick={schedule.toggleAccordion}
                    >
                        <div className={buttonStyles.accordionInfo}>
                            <p className={buttonStyles.accordionTittle}>
                                Расписание
                            </p>
                            <Icon
                                src={Arrow}
                                alt="arrow"
                                className={`accordion__arrow ${schedule.isExpanded ? "teams__arrow--expanded" : ""}`}
                            />
                        </div>
                    </MyButton>
                </div>
                <div className="home__divider"></div>
                <div
                    className={`accordion__content ${schedule.isExpanded ? "accordion__content--expanded" : "accordion__content--collapsed"}`}
                >
                    <div className="accordion__content-text">
                        Следи за своим расписанием в Lumind!
                        <br />
                        Будь в курсе любых изменений в расписании твоей группы.
                        <div className="accordion__content-link">Подробнее</div>
                    </div>
                    <Icon
                        src={SheduleImg}
                        alt="shedule"
                        className="accordion__content-image"
                    />
                </div>
            </div>

            <div className="home__item">
                <div className="home__item-header">
                    <MyButton
                        className={`${buttonStyles.accordionButton} ${chat.isExpanded ? "accordion__button--active" : ""}`}
                        onClick={chat.toggleAccordion}
                    >
                        <div className={buttonStyles.accordionInfo}>
                            <p className={buttonStyles.accordionTittle}>Чат</p>
                            <Icon
                                src={Arrow}
                                alt="arrow"
                                className={`accordion__arrow ${chat.isExpanded ? "accordion__arrow--expanded" : ""}`}
                            />
                        </div>
                    </MyButton>
                    <div className="home__divider"></div>
                    <div
                        className={`accordion__content ${chat.isExpanded ? "accordion__content--expanded" : "accordion__content--collapsed"}`}
                    >
                        <div className="accordion__content-text">
                            Будь на связи со своими преподавателями и
                            <br />
                            Одногруппниками
                            <div className="accordion__content-link">
                                Подробнее
                            </div>
                        </div>
                        <Icon
                            src={ChatImg}
                            alt="chat"
                            className="accordion__content-image"
                        />
                    </div>
                </div>
            </div>

            <div className="home__item">
                <div className="home__item-header">
                    <MyButton
                        className={`${buttonStyles.accordionButton} ${teams.isExpanded ? "accordion__button--active" : ""}`}
                        onClick={teams.toggleAccordion}
                    >
                        <div className={buttonStyles.accordionInfo}>
                            <p className={buttonStyles.accordionTittle}>
                                Команды
                            </p>
                            <Icon
                                src={Arrow}
                                alt="arrow"
                                className={`accordion__arrow ${teams.isExpanded ? "accordion__arrow--expanded" : ""}`}
                            />
                        </div>
                    </MyButton>
                    <div className="home__divider"></div>
                    <div
                        className={`accordion__content ${teams.isExpanded ? "accordion__content--expanded" : "accordion__content--collapsed"}`}
                    ></div>
                </div>
            </div>

            <div className="home__item">
                <div className="home__item-header">
                    <MyButton
                        className={`${buttonStyles.accordionButton} ${calls.isExpanded ? "accordion__button--active" : ""}`}
                        onClick={calls.toggleAccordion}
                    >
                        <div className={buttonStyles.accordionInfo}>
                            <p className={buttonStyles.accordionTittle}>
                                Звонки
                            </p>
                            <Icon
                                src={Arrow}
                                alt="arrow"
                                className={`accordion__arrow ${calls.isExpanded ? "accordion__arrow--expanded" : ""}`}
                            />
                        </div>
                    </MyButton>
                    <div className="home__divider"></div>
                    <div
                        className={`accordion__content ${calls.isExpanded ? "accordion__content--expanded" : "accordion__content--collapsed"}`}
                    ></div>
                </div>
            </div>
        </div>
    );
}

export { HomeComp };
