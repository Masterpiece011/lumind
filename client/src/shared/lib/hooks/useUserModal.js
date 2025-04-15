"use client";

import { UserModal } from "@/entities/user/ui/Profile";
import { useModal } from "@/shared/uikit/UiModal/ModalProvider";

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
