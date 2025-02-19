"use client";

import React from "react";
import Image from "next/image";
import "./UserProfile.scss";
import nonAvatar from "@/app/assets/img/non-avatar.png";
import { UiModal } from "../../uikit/UiModal/UiModal";

const UserModal = ({ user, isOpen, onClose }) => {
    return (
        <UiModal isOpen={isOpen} onClose={onClose}>
            <UiModal.Header>
                <button
                    className="user-profile__close-button"
                    onClick={onClose}
                >
                    ×
                </button>
            </UiModal.Header>

            <UiModal.Body>
                <div className="user-profile">
                    <Image
                        src={nonAvatar}
                        alt="User Avatar"
                        className="user-profile__avatar"
                    />
                    <h2 className="user-profile__name">{user.fullName}</h2>
                    <p className="user-profile__group">
                        <p className="user-profile__group">
                            <p className="user-profile__group">
                                {user?.group?.title ||
                                    user?.groups?.[0]?.title ||
                                    "Нет группы"}
                            </p>
                        </p>
                    </p>
                    <div className="user-profile__contact">
                        <p>Email: {user.email}</p>
                        <p>Роль: {user.role?.name || "Не указано"}</p>
                    </div>
                </div>
            </UiModal.Body>
        </UiModal>
    );
};

export { UserModal };
