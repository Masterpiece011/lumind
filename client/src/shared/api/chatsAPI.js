import { createAsyncThunk } from "@reduxjs/toolkit";
import { $authHost } from "./page";

export const getUserChats = async ({
    userId,
    searchQuery,
    pageNumber,
    itemsPerPage,
}) => {
    try {
        const { data } = await $authHost.post("/api/chats/get-all", {
            user_id: userId,
            page: pageNumber,
            search_text: searchQuery,
            quantity: itemsPerPage,
        });

        return data;
    } catch (error) {
        throw new Error(
            error.response?.data?.message || "Ошибка получения заданий",
        );
    }
};

export const getChatHistory = async ({
    userId,
    searchQuery,
    pageNumber,
    itemsPerPage,
}) => {
    try {
        const { data } = await $authHost.post("/api/chats/get-all", {
            user_id: userId,
            page: pageNumber,
            search_text: searchQuery,
            quantity: itemsPerPage,
        });

        return data;
    } catch (error) {
        throw new Error(
            error.response?.data?.message || "Ошибка получения заданий",
        );
    }
};
