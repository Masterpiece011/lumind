export const formatUserName = (user) => {
    const lastName = user.last_name || "";
    const firstName = user.first_name ? `${user.first_name.charAt(0)}.` : "";
    const middleName = user.middle_name ? `${user.middle_name.charAt(0)}.` : "";

    return `${lastName} ${firstName} ${middleName}`.trim();
};
