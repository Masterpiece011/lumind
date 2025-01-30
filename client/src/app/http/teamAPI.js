import { createAsyncThunk } from '@reduxjs/toolkit';
import { $authHost, $host } from "./page";

export const getTeams = createAsyncThunk('teams/getTeams', async () => {
    try {
      const response = await $host.get("/api/teams/");
      return response.data.teams;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Ошибка получения команды");
    }
  });

export const createTeam = async (teamData) => {
  try {
    const response = await $authHost.post("/api/teams/", teamData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Ошибка создания команды");
  }
};

export const updateTeam = async (teamData) => {
  try {
    const response = await $authHost.put("/api/teams/", teamData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Ошибка обновления команды");
  }
};

export const deleteTeam = async (teamId) => {
  try {
    const response = await $authHost.delete(`/api/teams/${teamId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Ошибка удаления команды");
  }
};