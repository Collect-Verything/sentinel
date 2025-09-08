import {Outlet} from "react-router";

export const MainLayout = () => {
    return (
        <>
            <p>dessus</p>
            <Outlet/>
            <p>dessous</p>
        </>
    )
}