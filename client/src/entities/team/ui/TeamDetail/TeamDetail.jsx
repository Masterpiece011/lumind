import React, { useMemo, useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { getTeamById } from "@/shared/api/teamAPI";
import { useAssignmentsFilter } from "@/entities/assignment/model/useAssignmentsFilter";
import { Filters } from "@/entities/assignment/ui/Filters";
import { AssignmentsList } from "@/entities/assignment/ui/AssignmentsList";
import { ClockLoader } from "@/shared/ui/Loaders/ClockLoader";
import { FileItem } from "@/shared/ui/FileComp";
import { MyButton } from "@/shared/uikit/MyButton";

import { Icon } from "@/shared/uikit/icons";
import UserIcon from "@/app/assets/icons/user-icon.png";
import Assignment from "@/app/assets/icons/assignments-icon.svg";
import File from "@/app/assets/icons/file-icon.svg";
import Publication from "@/app/assets/icons/publication-icon.svg";

import * as buttonStyles from "@/shared/uikit/MyButton/MyButton.module.scss";
import "./TeamDetail.scss";

const TeamDetailPage = ({ onSelectAssignment }) => {
    const { id } = useParams();
    const dispatch = useDispatch();
    const {
        currentTeam,
        loading: teamLoading,
        error: teamError,
    } = useSelector((state) => state.teams);
    const {
        assignments,
        assignmentsTotal,
        loading: assignmentsLoading,
    } = useSelector((state) => state.assignments);
    const user_id = useSelector((state) => state.user.user?.id);

    const [activeTab, setActiveTab] = useState("members");
    const { filter, isFilterLoading, handleSetNewFilter } =
        useAssignmentsFilter({
            userId: user_id,
            teamId: id,
            activeTab,
        });

    useEffect(() => {
        if (id && user_id) {
            dispatch(getTeamById({ teamId: id, userId: user_id }));
        }
    }, [id, user_id, dispatch]);

    const allFiles = useMemo(() => {
        const taskFiles =
            currentTeam?.tasks?.flatMap((task) =>
                (task.files || []).map((file) => ({
                    ...file,
                    taskTitle: task.title,
                    taskId: task.id,
                })),
            ) || [];

        const assignmentFiles =
            currentTeam?.tasks?.flatMap(
                (task) =>
                    task.assignments?.flatMap((assignment) =>
                        (assignment.files || []).map((file) => ({
                            ...file,
                            assignmentTitle: assignment.title,
                            assignmentId: assignment.id,
                        })),
                    ) || [],
            ) || [];

        return [...taskFiles, ...assignmentFiles];
    }, [currentTeam]);

    const tabContent = {
        members: <MembersTabContent users={currentTeam?.users} />,
        assignments: (
            <div className="team__tab-content">
                <h3 className="team__tab-title">Задания команды</h3>
                <Filters
                    currentFilter={filter}
                    onFilterChange={handleSetNewFilter}
                />
                <div className="assignments__divider"></div>
                <AssignmentsList
                    assignments={assignments}
                    assignmentsTotal={assignmentsTotal}
                    isLoading={assignmentsLoading}
                    isFilterLoading={isFilterLoading}
                    onSelect={onSelectAssignment}
                />
            </div>
        ),
        files: (
            <FilesTabContent
                files={allFiles}
                onSelectAssignment={onSelectAssignment}
            />
        ),
        posts: <PostsTabContent />,
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

const FilesTabContent = ({ files, onSelectAssignment }) => (
    <div className="team-files">
        <h3>Файлы команды</h3>
        {files.length > 0 ? (
            <div className="file-list">
                {files.map((file) => (
                    <FileItem
                        key={file.id}
                        fileUrl={file.file_url}
                        additionalInfo={file.assignmentTitle || "Файл задания"}
                        onClick={() =>
                            file.assignmentId &&
                            onSelectAssignment(file.assignmentId)
                        }
                    />
                ))}
            </div>
        ) : (
            <p>Нет файлов</p>
        )}
    </div>
);

const PostsTabContent = () => (
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
            <SidebarButton
                icon={UserIcon}
                label="Участники"
                onClick={() => setActiveTab("members")}
                buttonStyles={buttonStyles}
            />
            <SidebarButton
                icon={Assignment}
                label="Задания"
                onClick={() => setActiveTab("assignments")}
                buttonStyles={buttonStyles}
            />
            <SidebarButton
                icon={File}
                label="Файлы"
                onClick={() => setActiveTab("files")}
                buttonStyles={buttonStyles}
            />
            <SidebarButton
                icon={Publication}
                label="Публикации"
                onClick={() => setActiveTab("posts")}
                buttonStyles={buttonStyles}
            />
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
