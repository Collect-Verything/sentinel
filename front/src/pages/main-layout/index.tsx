import {Outlet} from "react-router";
import {MainAppBar} from "../app-bar";

export const MainLayout = () => {
    return (
        <>
            <MainAppBar/>
            <Outlet/>
        </>
    )
}