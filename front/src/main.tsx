import './index.css'
import {Home} from './pages/home'
import {BrowserRouter, Route, Routes} from "react-router";
import ReactDOM from "react-dom/client";

const root = document.getElementById("root");

ReactDOM.createRoot(root!).render(
    <BrowserRouter>
        <Routes>
            <Route path="/" element={<Home/>}/>
        </Routes>
    </BrowserRouter>,
);