const { now } = require('sequelize/lib/utils')
const sequelize = require('../db')

const { DataTypes } = require('sequelize')

//Пользователь

const Users = sequelize.define('user', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    img: { type: DataTypes.STRING, allowNull: false, defaultValue: 'non-avatar.png' },
    email: { type: DataTypes.STRING, unique: true },
    password: { type: DataTypes.STRING },
    first_name: { type: DataTypes.STRING },
    middle_name: { type: DataTypes.STRING },
    last_name: { type: DataTypes.STRING },
    created_at: { type: DataTypes.DATE, defaultValue: now(), allowNull: true },
    updated_at: { type: DataTypes.DATE, defaultValue: now(), allowNull: true },
    role_id: { type: DataTypes.INTEGER },
},
    {
        timestamps: true,
        createdAt: 'created_at', // необязательно, если названия совпадают
        updatedAt: 'updated_at'  // необязательно, если названия совпадают
    }
)

//Роли

const Roles = sequelize.define('roles', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, defaultValue: "USER" },
    created_at: { type: DataTypes.DATE, defaultValue: now(), allowNull: true },
    updated_at: { type: DataTypes.DATE, defaultValue: now(), allowNull: true }
},
    {
        timestamps: true,
        createdAt: 'created_at', // необязательно, если названия совпадают
        updatedAt: 'updated_at'  // необязательно, если названия совпадают
    }
)

//Чат

const Chats = sequelize.define('chats', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    created_at: { type: DataTypes.DATE, defaultValue: now() },
    chat_members: { type: DataTypes.JSON }
},
    {
        timestamps: true,
        createdAt: 'created_at', // необязательно, если названия совпадают
        updatedAt: 'updated_at'  // необязательно, если названия совпадают
    })

//Сообщения чата

const Chat_messages = sequelize.define('chat_messages', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    chat_id: { type: DataTypes.INTEGER },
    message: { type: DataTypes.STRING },
    from_user: { type: DataTypes.STRING, allowNull: false },
    created_at: { type: DataTypes.DATE, defaultValue: now() },
},
    {
        timestamps: true,
        createdAt: 'created_at', // необязательно, если названия совпадают
        updatedAt: 'updated_at'  // необязательно, если названия совпадают
    }
)

//Участники чата

const Chat_Members = sequelize.define('chat_members', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: { type: DataTypes.INTEGER },
    chat_id: { type: DataTypes.INTEGER }
},
{
    timestamps: true,
    createdAt: 'created_at', // необязательно, если названия совпадают
    updatedAt: 'updated_at'  // необязательно, если названия совпадают
})

//Уведомления

const Notifications = sequelize.define('notifications', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    title: { type: DataTypes.STRING },
    message: { type: DataTypes.STRING, allowNull: true },
    is_read: { type: DataTypes.BOOLEAN },
    user_id: { type: DataTypes.INTEGER },
    notificator_id: { type: DataTypes.INTEGER, allowNull: true }
},
{
    timestamps: true,
    createdAt: 'created_at', // необязательно, если названия совпадают
    updatedAt: 'updated_at'  // необязательно, если названия совпадают
})

//Группы

const Groups = sequelize.define('groups', {
    id: { type: DataTypes.STRING, primaryKey: true, unique: true },
    title: { type: DataTypes.STRING },
    created_at: { type: DataTypes.DATE, defaultValue: now() },
    user_id: { type: DataTypes.INTEGER },
    creator_id: { type: DataTypes.INTEGER, allowNull: true }
},
{
    timestamps: true,
    createdAt: 'created_at', // необязательно, если названия совпадают
    updatedAt: 'updated_at'  // необязательно, если названия совпадают
})

//Задания

const Assignments = sequelize.define('assignments', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    title: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.STRING, allowNull: true },
    due_date: { type: DataTypes.DATE, allowNull: false },
    comment: { type: DataTypes.STRING, allowNull: true },
    group_id: { type: DataTypes.INTEGER },
    creator_id: { type: DataTypes.INTEGER, allowNull: true }
},
{
    timestamps: true,
    createdAt: 'created_at', // необязательно, если названия совпадают
    updatedAt: 'updated_at'  // необязательно, если названия совпадают
})

//Вложения задания

const Assignments_investments = sequelize.define('assignments_investments', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    assigment_id: { type: DataTypes.INTEGER },
    file_url: { type: DataTypes.STRING, allowNull: true }
},
{
    timestamps: true,
    createdAt: 'created_at', // необязательно, если названия совпадают
    updatedAt: 'updated_at'  // необязательно, если названия совпадают
})

//Задания_Группы

const Groups_Assignments = sequelize.define('groups_assignments', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    assigment_id: { type: DataTypes.INTEGER },
    group_id: { type: DataTypes.INTEGER }
},
{
    timestamps: true,
    createdAt: 'created_at', // необязательно, если названия совпадают
    updatedAt: 'updated_at'  // необязательно, если названия совпадают
})

//Проверка(сдача) задания

const Submissions = sequelize.define('submissions', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: { type: DataTypes.INTEGER },
    assigment_id: { type: DataTypes.INTEGER },
    submitted_date: { type: DataTypes.DATE, allowNull: false },
    comment: { type: DataTypes.STRING, allowNull: true },
},
{
    timestamps: true,
    createdAt: 'created_at', // необязательно, если названия совпадают
    updatedAt: 'updated_at'  // необязательно, если названия совпадают
})

//Вложения для проверка

const Submissions_investments = sequelize.define('submissions_investments', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    submission_id: { type: DataTypes.INTEGER },
    file_url: { type: DataTypes.STRING }
},
{
    timestamps: true,
    createdAt: 'created_at', // необязательно, если названия совпадают
    updatedAt: 'updated_at'  // необязательно, если названия совпадают
})

//Публикации

const Publications = sequelize.define('publications', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    title: { type: DataTypes.STRING },
    description: { type: DataTypes.STRING, allowNull: true },
    content: { type: DataTypes.STRING, allowNull: false },
    published_at: { type: DataTypes.DATE, defaultValue: now() },
    creator_id: { type: DataTypes.INTEGER, allowNull: true }
},
{
    timestamps: true,
    createdAt: 'created_at', // необязательно, если названия совпадают
    updatedAt: 'updated_at'  // необязательно, если названия совпадают
})

//Вложения публикации

const Publication_investments = sequelize.define('publication_investments', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    publication_id: { type: DataTypes.INTEGER },
    file_url: { type: DataTypes.STRING, allowNull: true }
},
{
    timestamps: true,
    createdAt: 'created_at', // необязательно, если названия совпадают
    updatedAt: 'updated_at'  // необязательно, если названия совпадают
})

//Комментарии к публикации

const Publication_comments = sequelize.define('publication_comments', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    comment: { type: DataTypes.STRING, allowNull: false },
    publication_id: { type: DataTypes.INTEGER },
    comment_creator_id: { type: DataTypes.INTEGER, allowNull: false }
},
{
    timestamps: true,
    createdAt: 'created_at', // необязательно, если названия совпадают
    updatedAt: 'updated_at'  // необязательно, если названия совпадают
})

//Вложения комментария к публикации

const Publication_comments_investments = sequelize.define('publication_comments_investments', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    publication_comment_id: { type: DataTypes.INTEGER },
    file_url: { type: DataTypes.STRING, allowNull: false }
},
{
    timestamps: true,
    createdAt: 'created_at', // необязательно, если названия совпадают
    updatedAt: 'updated_at'  // необязательно, если названия совпадают
})

//Конференция

const Conferences = sequelize.define('conferences', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    title: { type: DataTypes.STRING, allowNull: true },
    link: { type: DataTypes.STRING, allowNull: false },
    duration: { type: DataTypes.INTEGER, allowNull: false },
    session_date: { type: DataTypes.DATE, allowNull: false },
    created_at: { type: DataTypes.DATE, defaultValue: now() },
    creator_id: { type: DataTypes.INTEGER, allowNull: true },
    conference_members: { type: DataTypes.JSON }
},
{
    timestamps: true,
    createdAt: 'created_at', // необязательно, если названия совпадают
    updatedAt: 'updated_at'  // необязательно, если названия совпадают
})

//Участники конференции

const Conference_Members = sequelize.define('conference_members', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    conference_id: { type: DataTypes.INTEGER },
    user_id: { type: DataTypes.INTEGER }
},
{
    timestamps: true,
    createdAt: 'created_at', // необязательно, если названия совпадают
    updatedAt: 'updated_at'  // необязательно, если названия совпадают
})

//Связка Пользователя с Уведомлениями

Notifications.hasMany(Users, { foreignKey: 'user_id' })
Users.belongsTo(Notifications, { foreignKey: 'user_id' })

//Связка Пользователя с Ролью

Roles.hasMany(Users, { foreignKey: 'role_id' })
Users.belongsTo(Roles, { foreignKey: 'role_id' })

//Связка Пользователя с Чатом

Chats.belongsToMany(Users, { through: Chat_Members, foreignKey: 'chat_id' })
Users.belongsToMany(Chats, { through: Chat_Members, foreignKey: 'chat_id' })

//Связка Чата с Сообщениями чата

Chat_messages.hasMany(Chats, { foreignKey: 'chat_id' })
Chats.belongsTo(Chat_messages, { foreignKey: 'chat_id' })

//Связка Конференции с Пользователем

Conferences.belongsToMany(Users, { through: Conference_Members, foreignKey: 'conference_id' })
Users.belongsToMany(Conferences, { through: Conference_Members, foreignKey: 'user_id' })

//Связка Публикации с Конференцией

Publications.hasOne(Conferences, { foreignKey: 'conference_id' })
Conferences.belongsTo(Publications, { foreignKey: 'conference_id' })

//Связка Публикации с Группой

Publications.hasMany(Groups, { foreignKey: 'group_id' })
Groups.belongsTo(Publications, { foreignKey: 'group_id' })

//Связка Вложений публикации с Публикацией

Publication_investments.hasMany(Publications, { foreignKey: 'publication_id' })
Publications.belongsTo(Publication_investments, { foreignKey: 'publication_id' })

//Связка Комментов публикации с Публикацией

Publication_comments.hasMany(Publications, { foreignKey: 'publication_id' })
Publications.belongsTo(Publication_comments, { foreignKey: 'publication_id' })

//Связка Комментов публикации с Пользователем (Создатель коммента)

Publication_comments.hasOne(Users, { foreignKey: 'comment_creator_id' })
Users.belongsTo(Publication_comments, { foreignKey: 'comment_creator_id' })

//Связка Вложений комментов публикации с Комментами публикации

Publication_comments_investments.hasMany(Publication_comments, { foreignKey: 'publication_comment_id' })
Publication_comments.belongsTo(Publication_comments_investments, { foreignKey: 'publication_comment_id' })

//Связка Пользоватей с Группами

Groups.hasMany(Users, { foreignKey: 'user_id' })
Users.belongsTo(Groups, { foreignKey: 'user_id' })

//Связка Заданий с Группой

Groups.belongsToMany(Assignments, { through: Groups_Assignments, foreignKey: 'group_id' })
Assignments.belongsToMany(Groups, { through: Groups_Assignments, foreignKey: 'assignment_id' })

//Связка Вложений заданий с Заданием

Assignments_investments.hasMany(Assignments, { foreignKey: 'assignment_id' })
Assignments.belongsTo(Assignments_investments, { foreignKey: 'assignment_id' })

//Связка Проверки с Заданием

Submissions.hasOne(Assignments, { foreignKey: 'assignment_id' })
Assignments.belongsTo(Submissions, { foreignKey: 'assignment_id' })

//Связка Вложений проверки с Проверкой

Submissions_investments.hasMany(Submissions, { foreignKey: 'submission_id' })
Submissions.belongsTo(Submissions_investments, { foreignKey: 'submission_id' })

//Связка Проверки с Пользователем

Submissions.hasOne(Users, { foreignKey: 'user_id' })
Users.belongsTo(Submissions, { foreignKey: 'user_id' })


module.exports = {
    Users,
    Roles,
    Groups,
    Groups_Assignments,
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
}
