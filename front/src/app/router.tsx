import {createBrowserRouter} from "react-router";
import {Login} from "../pages/login";
import {Error404} from "../pages/404";
import {Home} from "../pages/home";
import {MainLayout} from "../pages/main-layout";
import {AddServers} from "../pages/add-servers";
import {Servers} from "../pages/servers";
import {ServersConfig} from "../pages/servers-config";
import {Tasks} from "../pages/tasks";

export const router = createBrowserRouter([
    {
        path: "/",
        element: <MainLayout/>,
        children: [
            {
                path: "/",
                element: <Home/>,
            },
            {
                path: "/servers",
                element: <Servers/>,
            },
            {
                path: "/servers-config",
                element: <ServersConfig/>,
            },
            {
                path: "/add-servers",
                element: <AddServers/>,
            },
            {
                path: "/tasks",
                element: <Tasks/>,
            },
        ],
    },
    {
        path: "*",
        element: <Error404/>,
    },
    {
        path: "/login",
        element: <Login/>,
    },
]);
