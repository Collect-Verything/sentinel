import {router} from "./router.tsx";
import {RouterProvider} from "react-router";
import {TasksProvider} from "../contexts/TasksContext.tsx";
import React from "react";
import {ServersProvider} from "../contexts/ServersContext.tsx";

export const App: React.FC = () => {
    return (
        <React.StrictMode>
            <ServersProvider>
                <TasksProvider>
                    <RouterProvider router={router}/>
                </TasksProvider>
            </ServersProvider>
        </React.StrictMode>
    );
};
