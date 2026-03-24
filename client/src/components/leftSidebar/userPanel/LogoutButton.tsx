import { useNavigate } from "react-router";
import { NEWS_ROUTE } from "../../../utils/constants";
import { useAppDispatch } from "../../../store/hooks";
import { logout } from "../../../store/slices/authSlice";
import { useApolloClient } from "@apollo/client/react"; 

const LogoutButton = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const client = useApolloClient();

    const handleLogout = async () => {
        // 1. Удаляем токен из хранилища
        dispatch(logout())
        await client.clearStore(); 
        // 3. Перенаправляем или обновляем UI
        navigate(NEWS_ROUTE) // Или используй useNavigate из react-router
    }

    return (
        <button className="logout_btn" onClick={handleLogout} >
            Logout
        </button>
    );
}

export default LogoutButton;
