import { $authHost, $host } from "./page";

export const getGroups = async () => {
  try {
    const response = await $host.get("/api/groups/");
    return response.data.groups;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Ошибка получения групп");
  }
};

export const createGroup = async (groupData) => {
  try {
    const response = await $authHost.post("/api/groups/", groupData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Ошибка создания группы");
  }
};

export const updateGroup = async (groupData) => {
  try {
    const response = await $authHost.put("/api/groups/", groupData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Ошибка обновления группы");
  }
};

export const deleteGroup = async (groupId) => {
  try {
    const response = await $authHost.delete(`/api/groups/${groupId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Ошибка удаления группы");
  }
};