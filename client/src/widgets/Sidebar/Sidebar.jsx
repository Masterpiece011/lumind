"use client";

import "./Sidebar.scss";

import React from "react";
import { usePathname, useRouter } from "next/navigation";
import { Icon } from "@/shared/uikit/icons";
import HomeIcon from "@/app/assets/icons/home-icon.svg";
import ChatIcon from "@/app/assets/icons/chat-icon.svg";
import TeamsIcon from "@/app/assets/icons/teams-icon.svg";
import AssignmentsIcon from "@/app/assets/icons/assignments-icon.svg";
import NotificationsIcon from "@/app/assets/icons/notification-icon.svg";
import ScheduleIcon from "@/app/assets/icons/schedule-icon.svg";

const Sidebar = () => {
    const router = useRouter();
    const pathname = usePathname();

    const handleNavigation = (path) => {
        router.push(path);
    };

    const isActive = (path) => {
        if (path === "/") return pathname === path;
        return pathname.startsWith(path);
    };

    const navigationButtons = [
        { id: 1, src: HomeIcon, alt: "home-icon", routePath: "/" },
        {
            id: 2,
            src: NotificationsIcon,
            alt: "notifications-icon",
            routePath: "/notifications",
        },
        {
            id: 3,
            src: TeamsIcon,
            alt: "teams-icon",
            routePath: "/teams",
        },
        {
            id: 4,
            src: ChatIcon,
            alt: "chat-icon",
            routePath: "/chats",
        },
        {
            id: 5,
            src: AssignmentsIcon,
            alt: "assignments-icon",
            routePath: "/assignments",
        },
        {
            id: 6,
            src: ScheduleIcon,
            alt: "schedule-icon",
            routePath: "/schedule",
        },
    ];

    const buttonsClasses = {
        active: "main__sidebar-icon main__sidebar-icon--active",
        default: "main__sidebar-icon",
    };

    return (
        <aside className="main__sidebar">
            <ul className="main__sidebar-list">
                {navigationButtons.map(({ id, src, alt, routePath }) => (
                    <li key={id}>
                        <Icon
                            src={src}
                            alt={alt}
                            onClick={() => handleNavigation(routePath)}
                            className={
                                isActive(routePath)
                                    ? buttonsClasses.active
                                    : buttonsClasses.default
                            }
                        />
                    </li>
                ))}
            </ul>
        </aside>
    );
};

export { Sidebar };
