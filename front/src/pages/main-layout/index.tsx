import {Outlet} from "react-router";
import {MainAppBar} from "../app-bar";
import {Tasks} from "../tasks";

export const MainLayout = () => {
    return (
        <>
                <MainAppBar/>
                <Outlet/>
                <Tasks/>
        </>
    )
}