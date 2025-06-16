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
import Text from "@/shared/ui/Text";

import * as buttonStyles from "@/shared/uikit/MyButton/MyButton.module.scss";
import "./TeamDetail.scss";
import { getAllTeamPublications } from "@/shared/api/publicationsAPI";

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

    const [publications, setPublications] = useState([]);
    const [publicationsTotal, setPublicationsTotal] = useState(0);

    const [loadingPublications, setLoadingPublications] = useState(false);
    const [errorPublications, setErrorPublications] = useState(null);

    const user = useSelector((state) => state.user.user);

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
        const fetchPublications = async () => {
            setLoadingPublications(true);
            try {
                const { data } = await getAllTeamPublications({ teamId: id });
                setPublications(data.publications || []);
                setPublicationsTotal(data.total || 0);
            } catch (error) {
                setErrorPublications(error.message);
            } finally {
                setLoadingPublications(false);
            }
        };

        fetchPublications();
    }, [id]);

    useEffect(() => {
        if (id && user?.id) {
            dispatch(getTeamById({ teamId: id, userId: user.id }));
        }
    }, [id, user?.id, dispatch]);

    const tabContent = {
        publications: (
            <PublicationsTabContent
                publications={publications}
                publicationsTotal={publicationsTotal}
                loading={loadingPublications}
                error={errorPublications}
            />
        ),
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

const FilesTabContent = ({ onSelectAssignment }) => {
    const files = useSelector((state) => state.files?.teamFiles || []);
    const loading = useSelector((state) => state.files?.loading || false);

    if (loading) {
        return (
            <div className="team-files">
                <h3>Файлы заданий команды</h3>
                <div>Загрузка файлов...</div>
            </div>
        );
    }

    if (!files || files.length === 0) {
        return (
            <div className="team-files">
                <h3>Файлы заданий команды</h3>
                <p>Нет файлов заданий</p>
            </div>
        );
    }

    return (
        <div className="team-files">
            <h3>Файлы команды</h3>
            <div className="file-list">
                {files.map((file) => (
                    <div key={file.id} className="file-item-wrapper">
                        <FileItem
                            fileUrl={file.file_url}
                            fileName={
                                file.original_name ||
                                file.file_url.split("/").pop()
                            }
                            additionalInfo={file.taskTitle}
                            onClick={() =>
                                file.taskId && onSelectAssignment(file.taskId)
                            }
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

const PublicationsTabContent = ({
    publications,
    publicationsTotal,
    loading,
    error,
}) => {
    if (loading) return <div>Загрузка публикаций...</div>;
    if (error) return <div>Ошибка: {error}</div>;
    if (!publications?.length) return <p>Нет публикаций</p>;

    const formatDate = (dateString) => {
        const date = new Date(dateString);

        // Получаем часы и минуты
        const hours = String(date.getHours()).padStart(2, "0");
        const minutes = String(date.getMinutes()).padStart(2, "0");

        // Получаем день, месяц и год
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0"); // Месяцы начинаются с 0
        const year = date.getFullYear();

        return `${hours}:${minutes} ${day}.${month}.${year}`;
    };

    return (
        <div className="team-publications">
            <div className="e-top">
                <Text tag="h2">Публикации команды</Text>

                <MyButton>Создать публикацию</MyButton>
            </div>
            {publicationsTotal && (
                <ul className="team-publications-list">
                    {publications.map((publication) => (
                        <li
                            key={publication.id}
                            className="team-publication-item"
                        >
                            <div className="e-header">
                                <Text className="title" tag="h3">
                                    {publication.title}
                                </Text>
                                <Text className="create-date" tag="p">
                                    {formatDate(publication.created_at)}
                                </Text>
                            </div>

                            <Text className="description" tag="p">
                                {publication.creator_id}
                            </Text>

                            <Text className="description" tag="p">
                                {publication.description}
                            </Text>
                            <Text className="content" tag="p">
                                {publication.content}
                            </Text>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};
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
                    key={sidebar.id}
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
