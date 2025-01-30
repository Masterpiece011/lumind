import { configureStore } from "@reduxjs/toolkit";
import userReducer from "../store/userStore";
import groupReducer from "../store/groupStore"
import teamReducer from "../store/teamStore"

export const store = configureStore({
    reducer: {
        user: userReducer, 
        group: groupReducer,
        teams: teamReducer,
    },
});
