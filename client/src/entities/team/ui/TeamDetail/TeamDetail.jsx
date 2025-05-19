import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { getTeamById } from "@/shared/api/teamAPI";
import { useAssignmentsFilter } from "@/entities/assignment/model/useAssignmentsFilter";
import { Filters } from "@/entities/assignment/ui/Filters";
import { AssignmentsList } from "@/entities/assignment/ui/AssignmentsList";
import { ClockLoader } from "@/shared/ui/Loaders/ClockLoader";
import { FileItem } from "@/shared/ui/FileComp";
import { MyButton } from "@/shared/uikit/MyButton";

import { useTeamFiles } from "@/shared/lib/hooks/useTeamFiles";

import { Icon } from "@/shared/uikit/icons";
import UserIcon from "@/app/assets/icons/user-icon.png";
import Assignment from "@/app/assets/icons/assignments-icon.svg";
import File from "@/app/assets/icons/file-icon.svg";
import Publication from "@/app/assets/icons/publication-icon.svg";

import * as buttonStyles from "@/shared/uikit/MyButton/MyButton.module.scss";
import "./TeamDetail.scss";

const sidebarButtonsItems = [
    { id: 1, icon: Publication, label: "Публикации", tabLink: "publications" },
    { id: 2, icon: UserIcon, label: "Участники", tabLink: "members" },
    { id: 3, icon: Assignment, label: "Задания", tabLink: "assignments" },
    { id: 4, icon: File, label: "Файлы", tabLink: "files" },
];

const TeamDetailPage = ({ onSelectAssignment }) => {
    const { id } = useParams();
    const dispatch = useDispatch();

    const {
        currentTeam,
        loading: teamLoading,
        error: teamError,
    } = useSelector((state) => state.teams);

    const {
        data: allAssignments,
        total: assignmentsTotal,
        loading: assignmentsLoading,
        error: assignmentsError,
    } = useSelector((state) => state.assignments.teamAssignments);

    const user = useSelector((state) => state.user.user);
    const isInstructor = user?.role?.name === "INSTRUCTOR";

    const [activeTab, setActiveTab] = useState(sidebarButtonsItems[0].tabLink);
    const [filteredAssignments, setFilteredAssignments] = useState([]);
    const { filter, isFilterLoading, handleSetNewFilter } =
        useAssignmentsFilter({
            userId: user?.id,
            teamId: id,
            activeTab,
        });

    const { files: teamFiles, loading: filesLoading } = useTeamFiles(id, {
        page: 1,
        quantity: 10,
    });

    useEffect(() => {
        if (allAssignments) {
            if (filter === "all") {
                setFilteredAssignments(allAssignments);
            } else {
                setFilteredAssignments(
                    allAssignments.filter((a) => a.status === filter),
                );
            }
        }
    }, [allAssignments, filter]);

    useEffect(() => {
        if (id && user?.id) {
            dispatch(getTeamById({ teamId: id, userId: user.id }));
        }
    }, [id, user?.id, dispatch]);

    const tabContent = {
        publications: <PublicationsTabContent />,
        members: <MembersTabContent users={currentTeam?.users} />,
        assignments: (
            <div className="team__tab-content">
                <h3 className="team__tab-title">Задания команды</h3>
                <Filters
                    currentFilter={filter}
                    onFilterChange={handleSetNewFilter}
                />
                <div className="assignments__divider"></div>
                {assignmentsError ? (
                    <div className="error-message">{assignmentsError}</div>
                ) : (
                    <AssignmentsList
                        assignments={filteredAssignments}
                        assignmentsTotal={
                            filter === "all"
                                ? assignmentsTotal
                                : filteredAssignments.length
                        }
                        isLoading={assignmentsLoading}
                        isFilterLoading={isFilterLoading}
                        onSelect={onSelectAssignment}
                    />
                )}
            </div>
        ),
        files: (
            <FilesTabContent
                files={teamFiles}
                loading={filesLoading}
                onSelectAssignment={onSelectAssignment}
            />
        ),
    };

    if (teamLoading) return <ClockLoader loading={true} />;
    if (teamError) return <div>Ошибка загрузки команды: {teamError}</div>;
    if (!currentTeam) return <div>Команда не найдена</div>;

    return (
        <div className="team__wrapper">
            <div className="team__content-wrapper">
                <div className="team__content">
                    {tabContent[activeTab] || <p>Выберите раздел</p>}
                </div>
            </div>
            <TeamSidebar
                currentTeam={currentTeam}
                setActiveTab={setActiveTab}
                buttonStyles={buttonStyles}
            />
        </div>
    );
};

const MembersTabContent = ({ users }) => (
    <div className="team__tab-content">
        <h3 className="team__tab-title">Участники команды</h3>
        <ul className="team__members-list">
            {users?.map((user) => (
                <li className="team__member" key={user.id}>
                    <div className="team__member-info">
                        <span className="team__member-name">
                            {user.first_name || user.email.split("@")[0]}
                        </span>
                        <span className="team__member-email">
                            ({user.email})
                        </span>
                    </div>
                </li>
            )) || <p className="team__no-members">Нет участников</p>}
        </ul>
    </div>
);

const FilesTabContent = ({ files, loading, onSelectAssignment }) => (
    <div className="team-files">
        <h3>Файлы заданий команды</h3>
        {loading ? (
            <div>Загрузка файлов...</div>
        ) : files.length > 0 ? (
            <div className="file-list">
                {files.map((file) => (
                    <FileItem
                        key={file.id}
                        fileUrl={file.file_url}
                        fileName={file.original_name}
                        additionalInfo={file.taskTitle}
                        onClick={() => onSelectAssignment(file.taskId)}
                    />
                ))}
            </div>
        ) : (
            <p>Нет файлов заданий</p>
        )}
    </div>
);

const PublicationsTabContent = () => (
    <div className="team-posts">
        <p>Публикации команды</p>
    </div>
);

const TeamSidebar = ({ currentTeam, setActiveTab, buttonStyles }) => (
    <aside className="team__sidebar">
        <div
            className="team__avatar"
            style={{ backgroundColor: currentTeam.avatar_color }}
        ></div>
        <div className="team__divider"></div>
        <h2>{currentTeam.name}</h2>

        <ul className="team__sidebar-content">
            {sidebarButtonsItems.map((sidebar) => (
                <SidebarButton
                    icon={sidebar.icon}
                    label={sidebar.label}
                    onClick={() => setActiveTab(sidebar.tabLink)}
                    buttonStyles={buttonStyles}
                />
            ))}
        </ul>
    </aside>
);

const SidebarButton = ({ icon, label, onClick, buttonStyles }) => (
    <MyButton className={buttonStyles.teamButton} onClick={onClick}>
        <span className={buttonStyles.sidebarIcon}>
            <Icon src={icon} alt={`${label.toLowerCase()}-icon`} />
        </span>
        <span className={buttonStyles.sidebarInfo}>{label}</span>
    </MyButton>
);

export { TeamDetailPage };
