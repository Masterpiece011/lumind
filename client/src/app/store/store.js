import { configureStore } from "@reduxjs/toolkit";
import userReducer from "../../entities/user/model/userStore";
import usersReducer from "../../entities/user/model/usersStore";
import groupReducer from "../store/groupStore";
import teamReducer from "../../entities/team/model/teamStore";
import assignmentReducer from "../../entities/assignment/model/assignmentStore";
import submissionReducer from "../../features/submissions/model/submissionStore";
import themeReducer from "../../features/theme/model/themeStore";
import fileReducer from "../../entities/files/model/fileStore";

export const store = configureStore({
    reducer: {
        user: userReducer,
        users: usersReducer,
        group: groupReducer,
        teams: teamReducer,
        assignments: assignmentReducer,
        submissions: submissionReducer,
        theme: themeReducer,
        file: fileReducer,
    },
});
