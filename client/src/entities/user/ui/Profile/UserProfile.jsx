"use client";

import React from "react";
import Image from "next/image";
import "./UserProfile.scss";
import * as buttonStyles from "@/shared/uikit/MyButton/MyButton.module.scss";

import { Icon } from "@/shared/uikit/icons";
import nonAvatar from "@/app/assets/img/non-avatar.png";
import CloseIcon from "@/app/assets/icons/close-icon.svg";

import { MyButton } from "@/shared/uikit/MyButton";
import Text from "@/shared/ui/Text";
import { UiModal } from "@/shared/uikit/UiModal/UiModal";
import { getTranslatedRole } from "@/shared/lib/utils/getTranslatedRole";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";

const UserModal = ({ user, onClose }) => {
    const router = useRouter();

    const userId = useSelector(
        (state) => state.user?.user?.id || null,
        (prev, next) => prev === next,
    );
    let isMyProfile = false;

    if (user.id === userId) {
        isMyProfile = true;
    }

    const onChats = ({ userId }) => {
        router.push("/chats");

        onClose();
    };

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
                            <Text tag="h2" className="user-profile__name">
                                {user.last_name} {user.first_name}{" "}
                                {user.middle_name}
                            </Text>
                            <Text tag="p" className="user-profile__position">
                                {getTranslatedRole(user.role)}
                            </Text>
                            <Text tag="p" className="user-profile__group">
                                Группа:{" "}
                                {user?.group?.title || "Группа не указана"}
                            </Text>
                        </div>
                    </div>

                    {!isMyProfile && (
                        <MyButton
                            className="write-btn"
                            onClick={() => onChats({ userId: user.id })}
                        >
                            Написать
                        </MyButton>
                    )}

                    <div className="user-profile__divider"></div>

                    <div className="user-profile__contacts">
                        <div className="user-profile__contact-item">
                            <Text
                                tag="span"
                                className="user-profile__contact-label"
                            >
                                Электронная почта:
                            </Text>
                            <Text
                                tag="span"
                                className="user-profile__contact-value"
                            >
                                {user.email}
                            </Text>
                        </div>
                        <div className="user-profile__contact-item">
                            <Text
                                tag="span"
                                className="user-profile__contact-label"
                            >
                                Чат:
                            </Text>
                            <Text
                                tag="span"
                                className="user-profile__contact-value"
                            >
                                Не указан
                            </Text>
                        </div>
                        <div className="user-profile__contact-item">
                            <Text
                                tag="span"
                                className="user-profile__contact-label"
                            >
                                Организация:
                            </Text>
                            <Text
                                tag="span"
                                className="user-profile__contact-value"
                            >
                                Не указана
                            </Text>
                        </div>
                    </div>
                </div>
            </UiModal.Body>
        </>
    );
};

export { UserModal };
