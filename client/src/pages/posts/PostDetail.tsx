import { useNavigate, useParams } from "react-router";
import { GET_ONE_POST } from "../../graphql/querry/getOnePost.js";
import { useMutation, useQuery } from "@apollo/client/react";
import { useAppSelector } from "../../store/hooks.js";
import { ADD_LIKE } from "../../graphql/mutations/addLike.js";
import { ADD_DISLIKE } from "../../graphql/mutations/addDislike.js";
import { FaHeart } from "react-icons/fa";
import { BiSolidDislike } from "react-icons/bi";
import { useEffect, useState } from "react";
import { UPDATE_POST } from "../../graphql/mutations/updatePost.js";

import Editor from "../../components/lexical/Editor.js"; // Тот самый типизированный Editor
import LexicalHTMLRenderer from "../../components/lexical/LexicalHTMLRenderer.js"; // Для отображения контента


const PostDetail = () => {
    const { categorySlug, id } = useParams<{ categorySlug: string, id: string }>();
    const [isEdit, setIsEdit] = useState(false);
    const [postContent, setPostContent] = useState('') // Сюда Lexical будет писать JSON-строку
    const [postTitle, setPostTitle] = useState('')
    const navigate = useNavigate();
    const { accessToken, user } = useAppSelector((state) => state.user);
    const [addLike] = useMutation(ADD_LIKE);
    const [addDislike] = useMutation(ADD_DISLIKE);
    const { data, loading, error } = useQuery(GET_ONE_POST, {
        variables: { id: id ?? "" },
        skip: !id, // Пропускаем запрос, если id по какой-то причине пуст
    });
    const [updatePost] = useMutation(UPDATE_POST);
    console.log(accessToken);

    useEffect(() => {
        if (data?.post) {
            setPostContent(data.post.content)
            setPostTitle(data.post.title)
        }
    }, [data]);
    // console.log(data);
    const handleLike = (post: any) => {
        if(accessToken.length === 0) return
        addLike({
            variables: { postId: post.id },
            optimisticResponse: {
                addLike: {
                    __typename: 'Post',
                    id: post.id,
                    // Если уже был лайк — уменьшаем, если нет — увеличиваем
                    likesCount: post.isLiked ? post.likesCount - 1 : post.likesCount + 1,
                    // Если был дизлайк и мы ставим лайк — дизлайк исчезает (логика бэкенда)
                    dislikesCount: post.isDisliked ? post.dislikesCount - 1 : post.dislikesCount,
                    isLiked: !post.isLiked,
                    isDisliked: false,
                },
            },
        });
    };
    const handleDislike = (post: any) => {
        if(accessToken.length != 0){
            addDislike({
                variables: { postId: post.id },
                optimisticResponse: {
                    addDislike: {
                        __typename: 'Post',
                        id: post.id,
                        dislikesCount: post.isDisliked ? post.dislikesCount - 1 : post.dislikesCount + 1,
                        likesCount: post.isLiked ? post.likesCount - 1 : post.likesCount,
                        isDisliked: !post.isDisliked,
                        isLiked: false,
                    },
                },
            });
        } else {
            return
        }
    };

    //// Новый хэндлер апдейта поста с учетом использования Lexical:
    const handleUpdatePost = (pId: string, pTitle: string, pContent: string) => {
        if (accessToken.length !== 0) {
            updatePost({
                variables: { 
                    id: pId, 
                    postTitle: pTitle, 
                    postContent: pContent 
                },
                // Оптимистичный ответ должен полностью соответствовать структуре мутации
                // В кратце optimisticResponse берет объект из кэша, меняет и выдает на фронтб в фоне улетает запрос на сервер 
                // когда запрос пришел OK: то он просто подменяет значения
                // иначе просто откатывает данные назад
                optimisticResponse: {
                    updatePost: {
                        __typename: 'Post', /// Важно для того что бы Apollo Client понимал какой именно объект в кэше обновить
                        id: pId,
                        title: pTitle,
                        content: pContent,
                        // Берем текущие значения из data.post, чтобы кэш не занулился
                        likesCount: post.likesCount,
                        dislikesCount: post.dislikesCount,
                        isLiked: post.isLiked,
                        isDisliked: post.isDisliked,
                        isOwner: post.isOwner
                    },
                },
            });
            setIsEdit(false);
        }
    };
    // 1. Loading state
    if (loading) return (
            /* Skeleton */
            <div className="flex flex-col animate-pulse gap-4 w-full max-w-4xl mx-auto p-4">
                <div className="h-10 w-31 bg-slate-800 rounded-md"></div>
                <div className="h-50 w-215 bg-slate-800 rounded-xl"></div>
            </div>
    );

    // 2. Error state
    if (error) {
        console.log(error);
        return <div>Error: {error.message}</div>;
    }

    // 3. TS type guard for data
    if (!data || !data.post) {
        return <div>Post not found</div>;
    }

    // post without undefined here
    const { post } = data;


    return (
    <div className="post-detail">
        {/* button <- Back  */}
        <div className="flex justify-between items-center">
            <button 
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-300 rounded-lg bg-slate-900/40 border border-white/5 hover:bg-slate-900/60 hover:text-white transition-all duration-200 cursor-pointer" 
                onClick={() => navigate(`/posts/${categorySlug}`)}
            >
                <svg xmlns="http://w3.org" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                </svg>
                <span>Back to list</span>
            </button>
        </div>

        {/* Main post card */}
        <div className="flex flex-col md:flex-row rounded-xl bg-slate-900/40 border border-white/5 backdrop-blur-xs overflow-hidden">
            
            {/* Left side: Avatar */}
            <div className="flex flex-col items-center justify-start p-5 w-full md:w-44 shrink-0 bg-slate-900/20 border-b md:border-b-0 md:border-r border-white/5">
                <div className="relative group flex items-center justify-center">
                    <img 
                        className="block w-20 h-20 md:w-24 md:h-24 rounded-full border-2 border-slate-700/50 object-cover bg-slate-800 shadow-md transition-transform group-hover:scale-105" 
                        src={post.user?.avatar || "https://placeholder.com"}
                        alt="Avatar"
                    />
                    <div className="absolute inset-0 rounded-full bg-sky-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <em className="not-italic font-semibold text-slate-200 text-sm mt-3 tracking-wide truncate max-w-full">
                    {post.user?.login || "Anonymous"}
                </em>
                <span className="text-[10px] text-slate-500 font-medium uppercase tracking-widest mt-1">
                    Author
                </span>
            </div>

            {/* Right side: Content */}
            <div className="flex flex-col flex-auto min-w-0">
                {isEdit ? (
                    /* Editing */
                    <div className="flex flex-col gap-4 p-5">
                        <div className="flex flex-col gap-1.5">
                            <label htmlFor="title" className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                Title of Post
                            </label>
                            <input
                                id="title" 
                                type="text" 
                                className="w-full px-3 py-2 rounded-lg bg-slate-950/40 border border-white/5 text-slate-100 focus:outline-hidden focus:border-sky-500/50 focus:bg-slate-950/60 font-medium transition-all"
                                value={postTitle}
                                onChange={(e) => setPostTitle(e.target.value)}
                            />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                Content
                            </label>
                            <div className="rounded-lg border border-white/5 bg-slate-950/20 focus-within:border-sky-500/50 transition-all overflow-hidden">
                                <Editor 
                                    initialContent={post.content} 
                                    onChange={(jsonString) => setPostContent(jsonString)} 
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 mt-2">
                            <button 
                                className="px-4 py-2 text-sm font-medium text-slate-400 rounded-lg hover:bg-slate-700 transition-colors"
                                onClick={() => setIsEdit(false)}
                            >
                                Cancel
                            </button>
                            <button 
                                className="px-5 py-2 text-sm font-medium bg-sky-600 hover:bg-sky-500 text-white rounded-lg transition-all shadow-md shadow-sky-600/10 active:scale-95"
                                onClick={() => handleUpdatePost(post.id, postTitle, postContent)}
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                ) : (
                    /* View */
                    <div className="flex flex-col h-full justify-between">
                        
                        {/* Post header */}
                        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5 bg-slate-900/10 gap-4">
                            <h1 className="text-xl font-bold text-slate-100 tracking-wide leading-tight wrap-break-word">
                                {post.title}
                            </h1>
                            {post.user?.login === user?.login && (
                                <button 
                                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-800 text-slate-300 rounded-lg border border-white/5 hover:bg-slate-700 hover:text-white transition-all active:scale-95 shrink-0"
                                    onClick={() => setIsEdit(true)}
                                >
                                    <span>✒️</span>
                                    <span>Edit</span>
                                </button>
                            )}
                        </div>

                        {/* Post body */}
                        <div className="p-5 text-slate-300 text-base leading-relaxed flex-auto overflow-y-auto">
                            <LexicalHTMLRenderer jsonString={post.content} />
                        </div>

                        {/* Footer likes/dislikes */}
                        <div className="flex items-center justify-between px-5 py-3 bg-slate-950/20 border-t border-white/5">
                            <div className="flex items-center gap-3">
                                {/* Like */}
                                <button 
                                    onClick={() => handleLike(post)} 
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all ${
                                        post.isLiked 
                                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/20' 
                                            : 'bg-slate-800/40 text-slate-400 border border-transparent hover:bg-rose-500/10 hover:text-rose-400'
                                    }`}
                                >
                                    <FaHeart className={post.isLiked ? 'text-rose-500' : 'text-slate-400'} />
                                    <span>{post.likesCount}</span>
                                </button>

                                {/* Dislike */}
                                <button 
                                    onClick={() => handleDislike(post)} 
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all ${
                                        post.isDisliked 
                                            ? 'bg-blue-500/20 text-blue-400 border border-blue-500/20' 
                                            : 'bg-slate-800/40 text-slate-400 border border-transparent hover:bg-blue-500/10 hover:text-blue-400'
                                    }`}
                                >
                                    <BiSolidDislike className={post.isDisliked ? 'text-blue-500' : 'text-slate-400'} />
                                    <span>{post.dislikesCount}</span>
                                </button>  
                            </div>
                            
                            <span className="text-[11px] text-slate-500">
                                MU Void Community Forum
                            </span>
                        </div>

                    </div>
                )}
            </div>

        </div>
    </div>
    );
}

export default PostDetail;
