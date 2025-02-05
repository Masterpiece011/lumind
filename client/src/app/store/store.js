import { configureStore } from "@reduxjs/toolkit";
import userReducer from "../store/userStore";
import groupReducer from "../store/groupStore";
import teamReducer from "../store/teamStore";
import assignmentReducer from "../store/assignmentStore";
import submissionReducer from "../store/submissionStore";

export const store = configureStore({
    reducer: {
        user: userReducer,
        group: groupReducer,
        teams: teamReducer,
        assignments: assignmentReducer,
        submissions: submissionReducer,
    },
});
