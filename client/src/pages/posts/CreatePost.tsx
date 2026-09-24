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
   
    
    if (loading || postLoading )  return (
            <div className="relative flex flex-col gap-6 w-full max-w-3xl mx-auto p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl animate-pulse">
                <div className="h-7 w-full pb-4 border-b border-slate-800"></div>
                <div className="ml-29 h-8 w-1/5 bg-slate-800 rounded-md"></div>
                <div className="self-end h-8 w-5/6 mr-1 bg-slate-800 rounded-md"></div>
                <div className="h-50 w-full bg-slate-800 rounded-xl"></div>
                <div className="flex justify-end gap-2 h-6 w-full mb-3">
                    <div className="h-9 w-22 bg-slate-800 rounded-md"></div>
                </div>
            </div>
            )

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
    <form onSubmit={handleSubmit} className="relative flex flex-col gap-6 w-full max-w-3xl mx-auto p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl">
      
      {/* Модальное окно успешного создания */}
      {isSuccess && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md rounded-2xl animate-fade-in">
          <div className="flex flex-col items-center w-full max-w-sm p-6 text-center bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl shadow-teal-500/10">
            <div className="flex items-center justify-center w-12 h-12 mb-4 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              ✓
            </div>
            <h3 className="mb-1 text-xl font-semibold text-white tracking-wide">Success!</h3>
            <p className="text-sm text-slate-400 mb-6">Your post was created.</p>
            <button 
              type="button"
              className="w-full px-4 py-2.5 rounded-xl bg-linear-to-r from-emerald-500 to-teal-600 text-white font-medium tracking-wide transition-all duration-200 hover:from-emerald-400 hover:to-teal-500 active:scale-98 shadow-lg shadow-emerald-500/20" 
              onClick={() => navigate(-1)}
            >
              Nice
            </button>
          </div>
        </div>  
      )}

      {/* Основной контент формы */}

            <div className="flex flex-col gap-5">
            {/* Заголовок формы (опционально, для лучшего UX) */}
            <div className="border-b border-slate-800 pb-4">
                <h2 className="text-xl font-bold text-white">Creating new post</h2>
            </div>

            {/* Селект категории */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
                <label className="text-sm font-medium text-slate-300 min-w-20">
                Category
                </label>
                <div className="relative w-full sm:w-64">
                <select 
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 text-sm text-slate-200 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all appearance-none cursor-pointer"
                    value={cat} 
                    onChange={(e) => setCat(e.target.value)}
                >
                    {data?.categories.map((c) => (
                    <option key={c.id} value={c.id} className="bg-slate-850">
                        {c.name}
                    </option>
                    ))}
                </select>
                {/* Кастомная стрелочка для селекта */}
                <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-400">
                    ▼
                </div>
                </div>
            </div>

            {/* Инпут заголовка */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
                <label className="text-sm font-medium text-slate-300 min-w-20">
                Title
                </label>
                <div className="relative flex-1">
                <input 
                    type="text" 
                    maxLength={30} 
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 text-sm text-slate-200 rounded-xl placeholder-slate-500 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all"
                    value={title} 
                    placeholder="Your title..." 
                    onChange={(e) => setTitle(e.target.value)} 
                />
                <span className="absolute right-3 bottom-2.5 text-xs text-slate-500">
                    {title.length}/30
                </span>
                </div>
            </div>

            {/* Редактор */}
            <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-slate-300">Content</label>
                <div className="rounded-xl border border-slate-700 bg-slate-800 overflow-hidden focus-within:border-teal-500 focus-within:ring-2 focus-within:ring-teal-500/20 transition-all">
                <Editor 
                    initialContent={postContent} 
                    onChange={(jsonString) => setPostContent(jsonString)} 
                />
                </div>
            </div>
            </div>
        

      {/* Кнопка отправки формы */}
      <div className="flex justify-end border-t border-slate-800 pt-4 mt-2">
        <button 
          type="submit" 
          disabled={loading} 
          className="px-6 py-2.5 bg-linear-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-white font-medium text-sm rounded-xl transition-all duration-200 shadow-md shadow-teal-500/10 hover:shadow-teal-500/25 active:scale-98 disabled:opacity-50 disabled:pointer-events-none disabled:transform-none"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              Creating...
            </span>
          ) : (
            "Create"
          )}
        </button>
      </div>

    </form>
  );

}


export default CreatePost;
