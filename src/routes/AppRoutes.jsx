import { Route, Routes } from "react-router-dom";
import Error from "../pages/error/Error";
import App from "../App";
import Home from "../pages/home/Home";
import SignupModal from "../pages/signup/SignupModal";
import LoginModal from "../pages/login/LoginModal";

const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<App />}>
                <Route index element={<Home />} />
                {/* <Route path="/home" element={<Signup />} /> */}

                <Route path="/connect" element={<SignupModal></SignupModal>} />
                <Route path="/login" element={<LoginModal></LoginModal>} />
                

                {/* 404 Route */}
                <Route path="*" element={<Error />} />
            </Route>
        </Routes>
    );
};

export default AppRoutes;