import { now } from "sequelize/lib/utils";

import sequelize from "../db.js";

import DataTypes from "sequelize";

//Пользователь

export const Users = sequelize.define(
    "users",
    {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        img: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: "non-avatar.png",
        },
        email: { type: DataTypes.STRING, unique: true },
        password: { type: DataTypes.STRING, allowNull: false },
        first_name: { type: DataTypes.STRING, defaultValue: "" },
        middle_name: { type: DataTypes.STRING, defaultValue: "" },
        last_name: { type: DataTypes.STRING, defaultValue: "" },
        display_name: { type: DataTypes.STRING, defaultValue: "" },
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

//Организации

export const Organizations = sequelize.define(
    "organizations",
    {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        img: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: "non-avatar-organization.png",
        },
        title: { type: DataTypes.STRING, unique: true, allowNull: false },
        description: { type: DataTypes.STRING, allowNull: true },
        creator_id: { type: DataTypes.INTEGER, allowNull: true },
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

export const Roles = sequelize.define(
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

export const Chats = sequelize.define(
    "chats",
    {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        chat_members: { type: DataTypes.JSON },
        created_at: { type: DataTypes.DATE, defaultValue: now() },
    },
    {
        timestamps: true,
        createdAt: "created_at", // необязательно, если названия совпадают
        updatedAt: "updated_at", // необязательно, если названия совпадают
    }
);

//Сообщения чата

export const Chat_Messages = sequelize.define(
    "chat_messages",
    {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        message: { type: DataTypes.STRING },
        chat_id: { type: DataTypes.INTEGER, allowNull: false },
        user_id: { type: DataTypes.INTEGER, allowNull: false },
        created_at: { type: DataTypes.DATE, defaultValue: now() },
    },
    {
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
    }
);

//Участники чата

export const Chat_Members = sequelize.define(
    "chat_members",
    {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        user_id: { type: DataTypes.INTEGER },
        chat_id: { type: DataTypes.INTEGER },
    },
    {
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
    }
);

//Уведомления

export const Notifications = sequelize.define(
    "notifications",
    {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        title: { type: DataTypes.STRING, allowNull: false },
        message: { type: DataTypes.STRING, allowNull: true },
        is_viewed: { type: DataTypes.BOOLEAN },
        user_id: { type: DataTypes.INTEGER },
        notificator_id: { type: DataTypes.INTEGER, allowNull: true },
    },
    {
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
    }
);

//Группы

export const Groups = sequelize.define(
    "groups",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            unique: true,
            autoIncrement: true,
        },
        title: { type: DataTypes.STRING, allowNull: false },
        description: { type: DataTypes.STRING, allowNull: true },
        creator_id: { type: DataTypes.INTEGER, allowNull: true },
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

export const Teams = sequelize.define(
    "teams",
    {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        name: { type: DataTypes.STRING, allowNull: false },
        description: { type: DataTypes.STRING, allowNull: true },
        avatar_color: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: "#FF5733",
        },
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

export const Users_Teams = sequelize.define(
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

// Задания

export const Tasks = sequelize.define(
    "tasks",
    {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        title: { type: DataTypes.STRING, allowNull: false },
        description: { type: DataTypes.STRING, allowNull: true },
        comment: { type: DataTypes.STRING, allowNull: true },
        creator_id: { type: DataTypes.INTEGER, allowNull: true },
    },
    {
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
    }
);

// Команды и задания

export const Teams_Tasks = sequelize.define(
    "teams_tasks",
    {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    },
    {
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
    }
);

// Назначения

export const Assignments = sequelize.define(
    "assignments",
    {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        comment: { type: DataTypes.STRING, allowNull: true },
        user_id: { type: DataTypes.INTEGER, allowNull: false },
        creator_id: { type: DataTypes.INTEGER, allowNull: false },
        assessment: { type: DataTypes.INTEGER, allowNull: true },
        status: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: "assigned",
        },
        plan_date: { type: DataTypes.DATE, allowNull: true },
    },
    {
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
    }
);

//Публикации

export const Publications = sequelize.define(
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
        createdAt: "created_at",
        updatedAt: "updated_at",
    }
);

//Комментарии к публикации

export const Publication_comments = sequelize.define(
    "publication_comments",
    {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        comment: { type: DataTypes.STRING, allowNull: false },
        publication_id: { type: DataTypes.INTEGER },
    },
    {
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
    }
);

// Конференции

export const Conferences = sequelize.define(
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
        createdAt: "created_at",
        updatedAt: "updated_at",
    }
);

// Участники конференции

export const Conference_Members = sequelize.define(
    "conference_members",
    {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        user_id: { type: DataTypes.INTEGER },
    },
    {
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
    }
);

// Файлы

export const Files = sequelize.define(
    "files",
    {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        file_url: { type: DataTypes.STRING, allowNull: false },
        entity_type: { type: DataTypes.STRING, allowNull: false },
        entity_id: { type: DataTypes.INTEGER, allowNull: false },
        original_name: { type: DataTypes.STRING }, // Добавьте это поле
        size: { type: DataTypes.INTEGER }, // Размер файла в байтах
        mime_type: { type: DataTypes.STRING }, // MIME-тип
        user_id: { type: DataTypes.INTEGER }, // Кто загрузил
    },
    {
        timestamps: true,
        createdAt: "created_at", // необязательно, если названия совпадают
        updatedAt: "updated_at", // необязательно, если названия совпадают
    },
    {
        indexes: [],
    }
);

//Связка Организации с Пользователем

Organizations.hasMany(Users, {
    foreignKey: "organization_id",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
});

Users.belongsTo(Organizations, {
    foreignKey: "organization_id",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
});

//Связка Пользователя с Уведомлениями

Users.hasMany(Notifications, {
    foreignKey: "user_id",
    onDelete: "CASCADE", // Удалить уведомления если удалён пользователь
    onUpdate: "CASCADE", // Обновить user_id если изменился id пользователя
});

Notifications.belongsTo(Users, {
    foreignKey: "user_id",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
});

//Связка Пользователя с Ролью

Roles.hasMany(Users, {
    foreignKey: "role_id",
    onDelete: "RESTRICT", // или 'SET NULL' если allowNull: true
    onUpdate: "CASCADE",
});
Users.belongsTo(Roles, {
    foreignKey: "role_id",
    onDelete: "RESTRICT", // или 'SET NULL' если allowNull: true
    onUpdate: "CASCADE",
});

//Связка между Командами и Пользователями

Users.belongsToMany(Teams, { through: Users_Teams, foreignKey: "user_id" });
Teams.belongsToMany(Users, { through: Users_Teams, foreignKey: "team_id" });

//Связка Пользователя с Чатом через Chat_Members

Chats.belongsToMany(Users, {
    through: Chat_Members,
    foreignKey: "chat_id",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
});

Users.belongsToMany(Chats, {
    through: Chat_Members,
    foreignKey: "user_id",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
});

//Связка Чата с Сообщениями чата

Chats.hasMany(Chat_Messages, {
    foreignKey: "chat_id",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
});

Chat_Messages.belongsTo(Chats, {
    foreignKey: "chat_id",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
});

//Связка Публикации с Конференцией

Publications.hasOne(Conferences, {
    foreignKey: "publication_id",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
});

Conferences.belongsTo(Publications, {
    foreignKey: "publication_id",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
});

//Связка Публикации с Командой

Teams.hasMany(Publications, {
    foreignKey: "team_id",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
});

Publications.belongsTo(Teams, {
    foreignKey: "team_id",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
});

//Связка Комментов публикации с Публикацией

Publications.hasMany(Publication_comments, {
    foreignKey: "publication_id",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
});

Publication_comments.belongsTo(Publications, {
    foreignKey: "publication_id",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
});

//Связка Комментов публикации с Пользователем (Создатель коммента)

Users.hasOne(Publication_comments, { foreignKey: "user_id" });
Publication_comments.belongsTo(Users, { foreignKey: "user_id" });

//Связка Пользоватей с Группами

Users.belongsTo(Groups, {
    foreignKey: "group_id",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
});

Groups.hasMany(Users, {
    foreignKey: "group_id",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
});

//Связка Заданий с Командой

Tasks.belongsToMany(Teams, {
    through: Teams_Tasks,
    foreignKey: "task_id",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
});

Teams.belongsToMany(Tasks, {
    through: Teams_Tasks,
    foreignKey: "team_id",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
});

//Связка Заданий с назначением

Tasks.hasMany(Assignments, {
    foreignKey: "task_id",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
});

Assignments.belongsTo(Tasks, {
    foreignKey: "task_id",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
});

//Связка Публикаций с Файлами

Publications.hasMany(Files, {
    foreignKey: "entity_id",
    constraints: false,
    scope: {
        entity_type: "publication",
    },
});

Files.belongsTo(Publications, {
    foreignKey: "entity_id",
    constraints: false,
});

//Связка Комментариев публикации с Файлами

Publication_comments.hasMany(Files, {
    foreignKey: "entity_id",
    constraints: false,
    scope: {
        entity_type: "publication_comment",
    },
});

Files.belongsTo(Publication_comments, {
    foreignKey: "entity_id",
    constraints: false,
});

//Связка Заданий с Файлами

Tasks.hasMany(Files, {
    foreignKey: "entity_id",
    constraints: false,
    scope: {
        entity_type: "task",
    },
});

Files.belongsTo(Tasks, {
    foreignKey: "entity_id",
    constraints: false,
});

//Связка Назначений с Файлами

Assignments.hasMany(Files, {
    foreignKey: "entity_id",
    constraints: false,
    scope: {
        entity_type: "assignment",
    },
});

Files.belongsTo(Assignments, {
    foreignKey: "entity_id",
    constraints: false,
});
