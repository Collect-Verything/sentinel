import {router} from "./router.tsx";
import {RouterProvider} from "react-router";
import {TasksProvider} from "../contexts/TasksContext.tsx";
import React from "react";

export const App: React.FC = () => {
    return (
        <React.StrictMode>
            <TasksProvider>
                <RouterProvider router={router}/>
            </TasksProvider>
        </React.StrictMode>
    );
};
