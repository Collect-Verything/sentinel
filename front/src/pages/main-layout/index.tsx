import {Outlet} from "react-router";
import {MainAppBar} from "../app-bar";
import {Tasks} from "../tasks";
import {TasksProvider} from "../../contexts/TasksContext.tsx";

export const MainLayout = () => {
    return (
        <>
                <MainAppBar/>
                <Outlet/>
                <Tasks/>
        </>
    )
}