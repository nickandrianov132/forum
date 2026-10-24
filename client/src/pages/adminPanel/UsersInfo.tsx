import { useQuery } from "@apollo/client/react";
import { GET_ALL_USERS } from "../../graphql/querry/getAllUsers";
import Spinner from "../../components/Spinner";

const UsersInfo = () => {
    const {data, loading, error} = useQuery(GET_ALL_USERS);
    console.log(data);

    if (loading) return( <Spinner />)
    if (!data?.users) return(<p>Users Not Found</p>) 
    return (
        <div className="flex gap-2 flex-wrap">
            {data?.users.map((user) => 
                <div key={user.id} className="user-card-container">
                    <img 
                        src={user.avatar} 
                        className="w-15 rounded-2xl"
                        alt="user-avatar"
                        title={user.login} 
                    />
                    <div className="flex flex-col items-center pt-0.5 pr-2">
                        <span className="text-sm">{user.login}</span>
                        {user.role === "Admin" &&
                            <span className="text-rose-500 font-semibold">{user.role}</span>
                        }
                        {user.role === "Moderator" &&
                            <span className="text-orange-400 font-semibold">{user.role}</span>
                        }
                        {user.role === "User" &&
                            <span className="text-sky-400 font-medium">{user.role}</span>
                        }
                        {user.role === "User" &&
                            <span>{user.isBanned ? "Outlaw" : "Commoner"}</span>    
                        }
                    </div>
                </div>
            )}
        </div>
    );
}

export default UsersInfo;
