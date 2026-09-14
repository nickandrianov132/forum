import { NavLink } from "react-router";
import { useQuery } from "@apollo/client/react";
import { GET_CATEGORIES } from "../../graphql/querry/getCategories";


const LeftNavbar = () => {
    const {loading, error, data } = useQuery(GET_CATEGORIES);
    console.log(data);

    if (loading) return <aside className="left-bar"><p className="text-gray-400 p-4">Loading...</p></aside>;
    if (error) return <aside className="left-bar"><p className="text-red-400 p-4">Error loading categories</p></aside>;

    return (
        <aside className="left-bar">
            <nav className="bg-gray-800 p-4 rounded-l-md h-fit lg:h-full">
                <ul className="text-gray-300 text-sm">
                 {/* Перебираем категории из базы данных */}
                    {data?.categories.map((category: any) => (
                        <li key={category.id} className="nav-link">
                            {/* Формируем динамический URL на основе slug категории */}
                            <NavLink 
                                to={`/posts/${category.slug}`}
                                className={({ isActive }) => 
                                    isActive ? "text-amber-300 font-bold" : "text-gray-300 hover:text-white"
                                }
                            >
                                {category.name}
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </nav>
        </aside>
        // <aside className="left-bar">
        //     <nav className="bg-gray-800 p-4 rounded-l-md h-fit lg:h-full">
        //         <ul className="text-gray-300 text-sm">
        //             <li className='nav-link after:text-amber-300'>
        //                 <NavLink to={NEWS_ROUTE}>
        //                     News
        //                 </NavLink>
        //             </li>
        //             <li className='nav-link'>
        //                 <NavLink to={POSTS_ROUTE}>
        //                     Posts
        //                 </NavLink>
        //             </li>
        //             <li className='nav-link'>
        //                 <NavLink to={GUIDES_ROUTE}>
        //                     Guides
        //                 </NavLink>
        //             </li>
        //         </ul>
        //     </nav>
        // </aside>

    );
}

export default LeftNavbar;
