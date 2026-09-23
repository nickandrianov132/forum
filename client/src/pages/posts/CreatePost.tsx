import { useMutation, useQuery } from "@apollo/client/react";
import { GET_CATEGORIES } from "../../graphql/querry/getCategories";
import Editor from "../../components/lexical/Editor";
import { useEffect, useState, type SubmitEvent } from "react";
import { CREATE_POST } from "../../graphql/mutations/createPost";
import { useAppSelector } from "../../store/hooks";
import { useNavigate } from "react-router";
import { GET_POSTS_BY_CATEGORY } from "../../graphql/querry/getPostsByCategory";


const CreatePost = () => {
    const navigate = useNavigate();
    const [cat, setCat] = useState('');
    const [title, setTitle] = useState('');
    const [postContent, setPostContent] = useState('');
    const { user } = useAppSelector(state => state.user);
    const { loading, error, data } = useQuery(GET_CATEGORIES);
    const [createPostMutation, { loading: postLoading, error: postError, called }] = useMutation(CREATE_POST, {
        onCompleted: (data) => {
            console.log(data);
            setTitle('');
            setPostContent('');
        },
        onError: (error) => {
            console.log(`Server error: ${error.message}`);
        }
    });

    const isSuccess = called && !postLoading && !postError;

    useEffect(() => {
        if (data?.categories && data.categories.length > 0 && !cat) {
            setCat(data.categories[0].id);
        }
         console.log(cat);
    }, [data, cat]);

    // console.log(data);   
   
    
    if (loading || postLoading )  return <div>Loading...</div> 

    if (postError) return <div>{postError.message}</div>

    if (error) return (<div>{error.message}</div>)


    const handleSubmit = (e: SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!title.trim() || !cat || loading || !user) return

        const selectedCategory = data?.categories.find((c) => c.id === cat);
        const categorySlug = selectedCategory?.slug;

        createPostMutation({
            variables: {
                categoryId: cat,
                title,
                content: postContent,
                userId: user.id
            },

            refetchQueries: [   
                {
                    query: GET_POSTS_BY_CATEGORY,
                    variables: { slug: categorySlug }
                }
            ]
        });
    };



    return (
        <form onSubmit={handleSubmit} className="flex relative flex-col">
            {isSuccess &&
                <div className="flex flex-col items-center absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm p-6 text-white rounded-2xl bg-slate-800/90 backdrop-blur-md border border-slate-700 shadow-2xl shadow-teal-400/30 text-center ">
                    <span className="flex mb-4 mt-3 text-xl">Success!</span>
                    <span className="mb-2 px-2">Post was created!</span>
                    <button 
                        className="w-1/3 mt-4 px-4 py-2.5 rounded-xl bg-linear-to-r from-emerald-500 to-teal-600 text-white font-medium tracking-wide transform-gpu transition-colors duration-200 hover:from-emerald-400 hover:to-teal-500 hover:shadow-[0_0_12px_rgba(16,185,129,0.4)] hover:-translate-y-0.5 hover:text-gray-200 hover:drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] active:translate-y-0"
                        onClick={() => navigate(-1)}
                    >Ok</button>
                </div>
            }
            {!loading ?
                <>
                <span className="mb-2">
                    <label>Category:</label>    
                    <select className="w-fit border rounded-xs ml-2" value={cat} onChange={(e) => setCat(e.target.value)}>
                        {data?.categories.map((c) => (
                            <option key={c.id} value={c.id} >
                                {c.name}
                            </option>
                        ))}
                    </select>
                </span>
                <span>
                    <label>
                        Title:
                    </label>
                    <input 
                        type="text"
                        maxLength={30}
                        className="min-w-95 text-sm/5 px-2 py-1 border border-gray-600/70 rounded-sm ml-2 focus:outline-none focus:border-blue-500/40 focus:ring-2 focus:ring-blue-200" 
                        value={title} 
                        placeholder="Your title...."
                        onChange={(e) => setTitle(e.target.value)} 
                    />
                </span>
                <Editor initialContent={postContent} onChange={(jsonString) => setPostContent(jsonString)} />
                </>
                :
                <p>Loading...</p>
            }
            <button 
                type="submit"
                disabled={loading}
                className="post-btn self-start ml-6 mr-0"
            >{loading ? "Loading..." : "Create"}</button>
        </form>
    );
}


export default CreatePost;
