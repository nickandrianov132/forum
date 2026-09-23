import { useAppSelector } from "../../../store/hooks";


const UserAvatar = () => {
    const { user } = useAppSelector(state => state.user)
    return (
        <div className="flex  p-1 rounded-full bg-linear-to-tr from-blue-600 from-0% via-indigo-500 via-50% to-cyan-400 to-100% mr-2">
            <img alt="avatar" title={user?.login} className="w-13 h-13 border-transparent rounded-full relative bg-gray-800" src={user?.avatar}/>
        </div>
    );
}

export default UserAvatar;
