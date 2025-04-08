"use client";

import { useModal } from "../components/uikit/UiModal/ModalProvider";
import { UserModal } from "../components/views/Profile";

export const useUserModal = () => {
    const { openModal, closeModal } = useModal();

    const showUserModal = (user) => {
        openModal(
            <UserModal
                user={user}
                onClose={() => {
                    closeModal();
                }}
            />,
        );
    };

    return { showUserModal, closeModal };
};
