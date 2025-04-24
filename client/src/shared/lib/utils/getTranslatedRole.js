const roleTranslations = {
    user: "Студент",
    instructor: "Преподаватель",
    admin: "Администратор",
    moderator: "Модератор",
};

export const getTranslatedRole = (role) => {
    const roleName = typeof role === "string" ? role : role?.name;
    if (!roleName) return "Роль не указана";
    return roleTranslations[roleName.toLowerCase()] || roleName;
};
