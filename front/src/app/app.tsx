import {router} from "./router.tsx";
import {RouterProvider} from "react-router";

export const App: React.FC = () => {
    return (
        <RouterProvider router={router}/>
    );
};
