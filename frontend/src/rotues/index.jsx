import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import RegisterPage from "../Pages/RegisterPage";
import CheckEmailPage from "../Pages/CheckEmailPage";
import CheckPasswordPage from "../Pages/CheckPassword";
import Forgotpassword from "../Pages/ForgotPassword";
import Home from "../Pages/Home";
import MessagePage from "../Components/MessagePage";
import ResetPassword from "../Components/ResetPassword";

const router = createBrowserRouter([
{
    path : "/",
    element : <App/>,
    children : [
        {
            path : "register",
            element :<RegisterPage/>
        },
        {
            path : 'email',
            element : <CheckEmailPage/>
        },
        {
            path : 'password',
            element : <CheckPasswordPage/>
        },
        {
            path : 'forgot-password',
            element : <Forgotpassword/>
        },
        {
            path : 'reset-password/:token',
            element : <ResetPassword/>
        },
        {
            path : "",
            element : <Home/>,
            children : [
                {
                    path : ':userId',
                    element : <MessagePage/>
                }
            ]
        }
    ]
}
])

export default router