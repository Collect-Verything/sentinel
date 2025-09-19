import {createBrowserRouter} from "react-router";
import {Login} from "../pages/login";
import {Error404} from "../pages/404";
import {Home} from "../pages/home";
import {MainLayout} from "../pages/main-layout";
import {AddServers} from "../pages/add-servers";
import {Servers} from "../pages/servers";

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
                path: "/add-servers",
                element: <AddServers/>,
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
