import { useQuery } from "@apollo/client/react";
import { GET_USERS_ONLINE, USER_STATUS_SUBSCRIPTION } from "../../../../graphql/querry/getOnlineUsers";
import { useEffect } from "react";


const UsersOnline = () => {
    const {data, loading, error, subscribeToMore} = useQuery(GET_USERS_ONLINE);

  console.log(data);
// 2. Подключаем подписку при монтировании компонента
//   useEffect(() => {
//     const unsubscribe = subscribeToMore({
//       document: USER_STATUS_SUBSCRIPTION,
//       // updateQuery срабатывает каждый раз, когда бэкэнд шлет событие
//       updateQuery: (prev, { subscriptionData }) => {
//         if (!subscriptionData.data) return prev;
        
//         const updatedUser = subscriptionData.data.userStatusChanged;

//         // Пересобираем список пользователей с учетом изменившегося статуса
//         const updatedList = (prev.getOnlineUsers || []).map((user: any) => {
//           if (user.id === updatedUser.id) {
//             return { ...user, isOnline: updatedUser.isOnline };
//           }
//           return user;
//         });

//         return {
//           ...prev,
//           getOnlineUsers: updatedList,
//         } as any;
//       },
//     });

//     // Отписываемся при уничтожении компонента
//     return () => unsubscribe();
//   }, [subscribeToMore]);
useEffect(() => {
  const unsubscribe = subscribeToMore({
    document: USER_STATUS_SUBSCRIPTION,
    updateQuery: (prev, { subscriptionData }) => {
      console.log("Данные из сокета прилетели в Apollo:", subscriptionData);
      
      if (!subscriptionData.data?.userStatusChanged) return prev;

      const changedUser = subscriptionData.data.userStatusChanged;
      
      // Принудительно приводим ID к строке для надежности сравнения
      const targetId = String(changedUser.id || (changedUser as any)._id || "");

      // 1. Фильтруем список, убирая пользователя (независимо от того, зашел он или вышел)
      const filteredUsers = (prev.getOnlineUsers || []).filter((u: any) => {
        const currentId = String(u?.id || u?._id || "");
        return currentId !== targetId;
      });

      // 2. Если он онлайн — добавляем обновленный объект, иначе оставляем чистый отфильтрованный массив
      const updatedList = changedUser.isOnline 
        ? [...filteredUsers, changedUser] 
        : filteredUsers;

      console.log("Новый сформированный массив для UI:", updatedList);

      // 3. КРИТИЧЕСКИЙ ШАГ: Возвращаем НОВЫЙ объект через деструктуризацию,
      // чтобы React зафиксировал изменение ссылки и принудительно обновил интерфейс
      return {
        ...prev,
        getOnlineUsers: [...updatedList], // Явное копирование массива
      } as any;
    },
  });

  return () => unsubscribe();
}, [subscribeToMore]);
    // useEffect(() => {
    //     const unsubscribe = subscribeToMore({
    //     document: USER_STATUS_SUBSCRIPTION,
    //     updateQuery: ( prev, { subscriptionData } ) => {
    //         console.log(subscriptionData);
    //         // Если данных нет, возвращаем текущее состояние без изменений
    //         if (!subscriptionData.data?.userStatusChanged) return prev;

    //         const changedUser = subscriptionData.data.userStatusChanged;
    //         console.log("Прилетели данные из подписки:", changedUser);
    //         // Убираем пользователя из старого списка, если он там уже был
    //         const filteredUsers = (prev.getOnlineUsers || []).filter(
    //         (u) => u?.id !== changedUser.id
    //         );

    //         // Если он зашел (isOnline), добавляем его в начало или конец массива
    //         const updatedList = changedUser.isOnline 
    //         ? [...filteredUsers, changedUser] 
    //         : filteredUsers;

    //         // Возвращаем объект, полностью соответствующий типу GetOnlineUsersQuery
    //     return {
    //     ...prev,
    //     getOnlineUsers: updatedList,
    //     } as any;
    //     },
    //     });

    //     return () => unsubscribe();

    // }, [subscribeToMore]);

    if (loading) return <div>Loading Users...</div>
    if (error) return <div className="text-rose-500">Error Users</div>


    return (
        <div className="w-full bg-slate-900/40 backdrop-blur-sm border border-slate-800/60 rounded-xl p-4 shadow-xl">
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-800/80">
            <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <h3 className="text-xs font-bold tracking-wider text-slate-400 uppercase">
                Online — {data?.getOnlineUsers.length || 0}
            </h3>
            </div>

            <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto pr-1 custom-scrollbar">
            {data?.getOnlineUsers.map((userOnline) => {
   
                const isAdmin = userOnline.login?.toLowerCase() === 'admin' || userOnline.role === 'Admin';
                
                return (
                <div
                    key={userOnline.id}
                    className={`
                    group relative flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium
                    transition-colors duration-200 ease-out select-none
                    bg-slate-950/60 border
                    ${isAdmin 
                        ? 'border-red-500/30' 
                        : 'border-slate-600/4'
                    }
                    `}
                >
                    <span className={`h-1.5 w-1.5 rounded-full ${isAdmin ? 'bg-yellow-500' : 'bg-emerald-400'}`} />
                    
                    <span className={`
                    tracking-wide transition-colors
                    ${isAdmin 
                        ? 'text-red-400 font-bold drop-shadow-[0_0_6px_rgba(239,68,68,0.4)]' 
                        : 'text-emerald-300'
                    }
                    `}>
                    {userOnline.login}
                    </span>
                </div>
                );
            })}

            {data?.getOnlineUsers.length === 0 && (
                <span className="text-xs text-slate-500 italic">no users...</span>
            )}
            </div>
        </div>
    );
}

export default UsersOnline;
