"use client";

import React from "react";
import Image from "next/image";
import "./style.scss";
import * as buttonStyles from "@/shared/uikit/MyButton/MyButton.module.scss";

import { Icon } from "../../../../shared/uikit/icons";
import nonAvatar from "@/app/assets/img/non-avatar.png";
import CloseIcon from "@/app/assets/icons/close-icon.svg";

import { MyButton } from "@/shared/uikit/MyButton";
import { UiModal } from "@/shared/uikit/UiModal/UiModal";
import { getTranslatedRole } from "@/shared/lib/utils/getTranslatedRole";

const UserModal = ({ user, onClose }) => {
    return (
        <>
            <UiModal.Header>
                <div className="close-wrapper">
                    <MyButton
                        className={buttonStyles.userProfileButton}
                        onClick={onClose}
                    >
                        <Icon
                            src={CloseIcon}
                            alt="close-icon"
                            className={buttonStyles.userProfileIcon}
                        />
                    </MyButton>
                </div>
            </UiModal.Header>

            <UiModal.Body>
                <div className="user-profile">
                    <div className="user-profile__header">
                        <Image
                            src={nonAvatar}
                            alt="User Avatar"
                            className="user-profile__avatar"
                        />
                        <div className="user-profile__info">
                            <h2 className="user-profile__name">
                                {user.first_name} {user.last_name}{" "}
                                {user.middle_name}
                            </h2>
                            <p className="user-profile__position">
                                {getTranslatedRole(user.role)}
                            </p>
                            <p className="user-profile__department">
                                {user?.group?.title ||
                                    user?.groups?.[0]?.title ||
                                    "Отдел не указан"}
                            </p>
                        </div>
                    </div>

                    <div className="user-profile__divider"></div>

                    <div className="user-profile__contacts">
                        <div className="user-profile__contact-item">
                            <span className="user-profile__contact-label">
                                Электронная почта:
                            </span>
                            <span className="user-profile__contact-value">
                                {user.email}
                            </span>
                        </div>
                        <div className="user-profile__contact-item">
                            <span className="user-profile__contact-label">
                                Чат:
                            </span>
                            <span className="user-profile__contact-value">
                                Не указан
                            </span>
                        </div>
                        <div className="user-profile__contact-item">
                            <span className="user-profile__contact-label">
                                Организация:
                            </span>
                            <span className="user-profile__contact-value">
                                Не указана
                            </span>
                        </div>
                    </div>
                </div>
            </UiModal.Body>
        </>
    );
};

export { UserModal };
