import { NavLink } from "react-router";
import { useQuery } from "@apollo/client/react";
import { GET_CATEGORIES } from "../../graphql/querry/getCategories";

const LeftNavbar = () => {
    const {loading, error, data } = useQuery(GET_CATEGORIES);
    console.log(data);

    if (loading) return (
        <div className="left-bar lg:h-full p-4 border border-slate-500/20 rounded-l-lg h-fit bg-gray-800 animate-pulse"></div>
    )
    if (error) return <aside className="left-bar"><p className="text-red-400 p-4">Error loading categories</p></aside>;

    return (
        <aside className="left-bar">
            <nav className="bg-gray-800 p-4 rounded-l-lg h-fit lg:h-full border border-slate-400/20">
                <ul className="text-gray-300 text-sm w-full">
                    {data?.categories.map((category: any) => (
                        <li key={category.id}>
                            <NavLink 
                                to={`/posts/${category.slug}`}
                                className={({ isActive }) => 
                                    `nav-link-base ${isActive ? "nav-link-active" : ""}`
                                }
                            >
                                {category.name}
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </nav>
        </aside>
    );
}

export default LeftNavbar;
