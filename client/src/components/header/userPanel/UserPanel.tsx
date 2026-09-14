import { useAppSelector } from "../../../store/hooks";


const UserPanel = () => {
    const { accessToken } = useAppSelector((state) => state.user)
    console.log(accessToken);
    const isLoggedIn = !!accessToken;
    console.log(isLoggedIn);

    return (
        <div className="user_panel">
            www
        </div>
    );
}

export default UserPanel;
