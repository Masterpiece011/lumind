const { now } = require("sequelize/lib/utils");
const sequelize = require("../db");

const { DataTypes } = require("sequelize");

//Пользователь

const Users = sequelize.define(
    "user",
    {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        img: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: "non-avatar.png",
        },
        email: { type: DataTypes.STRING, unique: true },
        password: { type: DataTypes.STRING, allowNull: false },
        first_name: { type: DataTypes.STRING },
        middle_name: { type: DataTypes.STRING },
        last_name: { type: DataTypes.STRING },
        created_at: {
            type: DataTypes.DATE,
            defaultValue: now(),
            allowNull: true,
        },
        updated_at: {
            type: DataTypes.DATE,
            defaultValue: now(),
            allowNull: true,
        },
    },
    {
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
    }
);

//Роли

const Roles = sequelize.define(
    "roles",
    {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        name: { type: DataTypes.STRING, defaultValue: "USER" },
        created_at: {
            type: DataTypes.DATE,
            defaultValue: now(),
            allowNull: true,
        },
        updated_at: {
            type: DataTypes.DATE,
            defaultValue: now(),
            allowNull: true,
        },
    },
    {
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
    }
);

//Чат

const Chats = sequelize.define(
    "chats",
    {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        created_at: { type: DataTypes.DATE, defaultValue: now() },
        chat_members: { type: DataTypes.JSON },
    },
    {
        timestamps: true,
        createdAt: "created_at", // необязательно, если названия совпадают
        updatedAt: "updated_at", // необязательно, если названия совпадают
    }
);

//Сообщения чата

const Chat_messages = sequelize.define(
    "chat_messages",
    {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        message: { type: DataTypes.STRING },
        from_user: { type: DataTypes.STRING, allowNull: false },
        created_at: { type: DataTypes.DATE, defaultValue: now() },
    },
    {
        timestamps: true,
        createdAt: "created_at", // необязательно, если названия совпадают
        updatedAt: "updated_at", // необязательно, если названия совпадают
    }
);

//Участники чата

const Chat_Members = sequelize.define(
    "chat_members",
    {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        user_id: { type: DataTypes.INTEGER },
        chat_id: { type: DataTypes.INTEGER },
    },
    {
        timestamps: true,
        createdAt: "created_at", // необязательно, если названия совпадают
        updatedAt: "updated_at", // необязательно, если названия совпадают
    }
);

//Уведомления

const Notifications = sequelize.define(
    "notifications",
    {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        title: { type: DataTypes.STRING },
        message: { type: DataTypes.STRING, allowNull: true },
        is_read: { type: DataTypes.BOOLEAN },
        user_id: { type: DataTypes.INTEGER },
        notificator_id: { type: DataTypes.INTEGER, allowNull: true },
    },
    {
        timestamps: true,
        createdAt: "created_at", // необязательно, если названия совпадают
        updatedAt: "updated_at", // необязательно, если названия совпадают
    }
);

//Группы

const Groups = sequelize.define(
    "groups",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            unique: true,
            autoIncrement: true,
        },
        title: { type: DataTypes.STRING },
        created_at: {
            type: DataTypes.DATE,
            defaultValue: now(),
            allowNull: true,
        },
        updated_at: {
            type: DataTypes.DATE,
            defaultValue: now(),
            allowNull: true,
        },
        creator_id: { type: DataTypes.INTEGER, allowNull: true },
    },
    {
        timestamps: true,
        createdAt: "created_at", // необязательно, если названия совпадают
        updatedAt: "updated_at", // необязательно, если названия совпадают
    }
);

//Группы c Пользователями

const Users_Groups = sequelize.define(
    "users_groups",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            unique: true,
            autoIncrement: true,
        },
        created_at: {
            type: DataTypes.DATE,
            defaultValue: now(),
            allowNull: true,
        },
        updated_at: {
            type: DataTypes.DATE,
            defaultValue: now(),
            allowNull: true,
        },
    },
    {
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
    }
);

// Команды
const Teams = sequelize.define(
    "teams",
    {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        name: { type: DataTypes.STRING, allowNull: false },
        description: { type: DataTypes.STRING, allowNull: true },
        created_at: { type: DataTypes.DATE, defaultValue: now() },
        updated_at: { type: DataTypes.DATE, defaultValue: now() },
        creator_id: { type: DataTypes.INTEGER, allowNull: true },
    },
    {
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
    }
);
//Команды с Пользователями
const Users_Teams = sequelize.define(
    "users_teams",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            unique: true,
            autoIncrement: true,
        },
        created_at: {
            type: DataTypes.DATE,
            defaultValue: now(),
            allowNull: true,
        },
        updated_at: {
            type: DataTypes.DATE,
            defaultValue: now(),
            allowNull: true,
        },
    },
    {
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
    }
);

const Groups_Teams = sequelize.define(
    "groups_teams",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            unique: true,
            autoIncrement: true,
        },
        created_at: {
            type: DataTypes.DATE,
            defaultValue: now(),
            allowNull: true,
        },
        updated_at: {
            type: DataTypes.DATE,
            defaultValue: now(),
            allowNull: true,
        },
    },
    {
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
    }
);

//Задания
const Assignments = sequelize.define(
    "assignments",
    {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        title: { type: DataTypes.STRING, allowNull: false },
        description: { type: DataTypes.STRING, allowNull: true },
        due_date: { type: DataTypes.DATE, allowNull: false },
        comment: { type: DataTypes.STRING, allowNull: true },
        creator_id: { type: DataTypes.INTEGER, allowNull: true },
    },
    {
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
    }
);

//Вложения задания

const Assignments_investments = sequelize.define(
    "assignments_investments",
    {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        assignment_id: { type: DataTypes.INTEGER },
        file_url: { type: DataTypes.STRING, allowNull: true },
    },
    {
        timestamps: true,
        createdAt: "created_at", // необязательно, если названия совпадают
        updatedAt: "updated_at", // необязательно, если названия совпадают
    }
);

//Задания_Группы

const Assignments_Teams = sequelize.define(
    "assignments_teams",
    {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    },
    {
        timestamps: true,
        createdAt: "created_at", // необязательно, если названия совпадают
        updatedAt: "updated_at", // необязательно, если названия совпадают
    }
);

//Проверка(сдача) задания

const Submissions = sequelize.define(
    "submissions",
    {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        user_id: { type: DataTypes.INTEGER },
        assignment_id: { type: DataTypes.INTEGER },
        submitted_date: { type: DataTypes.DATE, allowNull: false },
        comment: { type: DataTypes.STRING, allowNull: true },
    },
    {
        timestamps: true,
        createdAt: "created_at", // необязательно, если названия совпадают
        updatedAt: "updated_at", // необязательно, если названия совпадают
    }
);

//Вложения для проверка

const Submissions_investments = sequelize.define(
    "submissions_investments",
    {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        submission_id: { type: DataTypes.INTEGER },
        file_url: { type: DataTypes.STRING },
    },
    {
        timestamps: true,
        createdAt: "created_at", // необязательно, если названия совпадают
        updatedAt: "updated_at", // необязательно, если названия совпадают
    }
);

//Публикации

const Publications = sequelize.define(
    "publications",
    {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        title: { type: DataTypes.STRING },
        description: { type: DataTypes.STRING, allowNull: true },
        content: { type: DataTypes.STRING, allowNull: false },
        published_at: { type: DataTypes.DATE, defaultValue: now() },
        creator_id: { type: DataTypes.INTEGER, allowNull: true },
    },
    {
        timestamps: true,
        createdAt: "created_at", // необязательно, если названия совпадают
        updatedAt: "updated_at", // необязательно, если названия совпадают
    }
);

//Вложения публикации

const Publication_investments = sequelize.define(
    "publication_investments",
    {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        publication_id: { type: DataTypes.INTEGER },
        file_url: { type: DataTypes.STRING, allowNull: true },
    },
    {
        timestamps: true,
        createdAt: "created_at", // необязательно, если названия совпадают
        updatedAt: "updated_at", // необязательно, если названия совпадают
    }
);

//Комментарии к публикации

const Publication_comments = sequelize.define(
    "publication_comments",
    {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        comment: { type: DataTypes.STRING, allowNull: false },
        publication_id: { type: DataTypes.INTEGER },
    },
    {
        timestamps: true,
        createdAt: "created_at", // необязательно, если названия совпадают
        updatedAt: "updated_at", // необязательно, если названия совпадают
    }
);

//Вложения комментария к публикации

const Publication_comments_investments = sequelize.define(
    "publication_comments_investments",
    {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        publication_comment_id: { type: DataTypes.INTEGER },
        file_url: { type: DataTypes.STRING, allowNull: false },
    },
    {
        timestamps: true,
        createdAt: "created_at", // необязательно, если названия совпадают
        updatedAt: "updated_at", // необязательно, если названия совпадают
    }
);

//Конференция

const Conferences = sequelize.define(
    "conferences",
    {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        title: { type: DataTypes.STRING, allowNull: true },
        link: { type: DataTypes.STRING, allowNull: false },
        duration: { type: DataTypes.INTEGER, allowNull: false },
        session_date: { type: DataTypes.DATE, allowNull: false },
        created_at: { type: DataTypes.DATE, defaultValue: now() },
        creator_id: { type: DataTypes.INTEGER, allowNull: true },
        conference_members: { type: DataTypes.JSON },
    },
    {
        timestamps: true,
        createdAt: "created_at", // необязательно, если названия совпадают
        updatedAt: "updated_at", // необязательно, если названия совпадают
    }
);

//Участники конференции

const Conference_Members = sequelize.define(
    "conference_members",
    {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    },
    {
        timestamps: true,
        createdAt: "created_at", // необязательно, если названия совпадают
        updatedAt: "updated_at", // необязательно, если названия совпадают
    }
);

//Связка Пользователя с Уведомлениями

Users.hasMany(Notifications, { foreignKey: "user_id" });
Notifications.belongsTo(Users, { foreignKey: "user_id" });

//Связка Пользователя с Ролью

Roles.hasMany(Users, { foreignKey: "role_id" });
Users.belongsTo(Roles, { foreignKey: "role_id" });

//Связка Пользователя с Чатом

Chats.belongsToMany(Users, { through: Chat_Members, foreignKey: "chat_id" });
Users.belongsToMany(Chats, { through: Chat_Members, foreignKey: "user_id" });

//Связка между Команд и Пользователей
Users.belongsToMany(Teams, { through: Users_Teams, foreignKey: "user_id" });
Teams.belongsToMany(Users, { through: Users_Teams, foreignKey: "team_id" });

//Связка между Командой и Группой
Groups.belongsToMany(Teams, { through: Groups_Teams, foreignKey: "group_id" });
Teams.belongsToMany(Groups, { through: Groups_Teams, foreignKey: "team_id" });

//Связка Чата с Сообщениями чата

Chats.hasMany(Chat_messages, { foreignKey: "chat_id" });
Chat_messages.belongsTo(Chats, { foreignKey: "chat_id" });

//Связка Конференции с Пользователем

Conferences.belongsToMany(Users, {
    through: Conference_Members,
    foreignKey: "conference_id",
});
Users.belongsToMany(Conferences, {
    through: Conference_Members,
    foreignKey: "user_id",
});

//Связка Публикации с Конференцией

Publications.hasOne(Conferences, { foreignKey: "publication_id" });
Conferences.belongsTo(Publications, { foreignKey: "publication_id" });

//Связка Публикации с Группой

Groups.hasMany(Publications, { foreignKey: "group_id" });
Publications.belongsTo(Groups, { foreignKey: "group_id" });

//Связка Вложений публикации с Публикацией

Publications.hasMany(Publication_investments, { foreignKey: "publication_id" });
Publication_investments.belongsTo(Publications, {
    foreignKey: "publication_id",
});

//Связка Комментов публикации с Публикацией

Publications.hasMany(Publication_comments, { foreignKey: "publication_id" });
Publication_comments.belongsTo(Publications, { foreignKey: "publication_id" });

//Связка Комментов публикации с Пользователем (Создатель коммента)

Users.hasOne(Publication_comments, { foreignKey: "user_id" });
Publication_comments.belongsTo(Users, { foreignKey: "user_id" });

//Связка Вложений комментов публикации с Комментами публикации

Publication_comments.hasMany(Publication_comments_investments, {
    foreignKey: "publication_comment_id",
});
Publication_comments_investments.belongsTo(Publication_comments, {
    foreignKey: "publication_comment_id",
});

//Связка Пользоватей с Группами

Groups.belongsToMany(Users, { through: Users_Groups, foreignKey: "group_id" });
Users.belongsToMany(Groups, { through: Users_Groups, foreignKey: "user_id" });

//Связка Заданий с Командой

Assignments.belongsToMany(Teams, {
    through: Assignments_Teams,
    foreignKey: "assignment_id",
});
Teams.belongsToMany(Assignments, {
    through: Assignments_Teams,
    foreignKey: "team_id",
});

//Связка Вложений заданий с Заданием

Assignments.hasMany(Assignments_investments, { foreignKey: "assignment_id" });
Assignments_investments.belongsTo(Assignments, { foreignKey: "assignment_id" });

//Связка Проверки с Заданием

Assignments.hasOne(Submissions, { foreignKey: "assignment_id" });
Submissions.belongsTo(Assignments, { foreignKey: "assignment_id" });

//Связка Вложений проверки с Проверкой

Submissions.hasMany(Submissions_investments, { foreignKey: "submission_id" });
Submissions_investments.belongsTo(Submissions, { foreignKey: "submission_id" });

//Связка Проверки с Пользователем

Users.hasOne(Submissions, { foreignKey: "user_id" });
Submissions.belongsTo(Users, { foreignKey: "user_id" });

module.exports = {
    Users,
    Roles,
    Groups,
    Teams,
    Users_Groups,
    Users_Teams,
    Groups_Teams,
    Assignments_Teams,
    Chat_Members,
    Notifications,
    Assignments,
    Assignments_investments,
    Submissions,
    Submissions_investments,
    Chats,
    Chat_messages,
    Conferences,
    Publications,
    Publication_comments,
    Publication_comments_investments,
};
