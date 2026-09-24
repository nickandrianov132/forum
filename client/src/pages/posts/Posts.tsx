
import { useMutation, useQuery } from "@apollo/client/react";
import { ADD_LIKE } from "../../graphql/mutations/addLike";
import { ADD_DISLIKE } from "../../graphql/mutations/addDislike";
import { useAppSelector } from "../../store/hooks";
import { Link, useParams } from "react-router";
import { FaHeart } from "react-icons/fa";
import { BiSolidDislike } from "react-icons/bi";
import { GET_POSTS_BY_CATEGORY } from "../../graphql/querry/getPostsByCategory";
import { convertDateFn } from "../../utils/functions";
import { CREATE_NEW_POST } from "../../utils/constants";
import { DELETE_POST } from "../../graphql/mutations/deletePost";
import { useState } from "react";



const Posts = () => {
    const { categorySlug } = useParams<{ categorySlug: string }>();
    const { loading, error, data } = useQuery(GET_POSTS_BY_CATEGORY, {
        variables: { slug: categorySlug || "news"}, // дефолтный фолбек, если slug пустой
        skip: !categorySlug  // пропускаем запрос, если slug ещё не успел прочитаться
    })
    // const { loading, error, data } = useQuery(GET_POSTS);
    const { user } = useAppSelector((state) => state.user);
    const [addLike] = useMutation(ADD_LIKE);
    const [addDislike] = useMutation(ADD_DISLIKE);
    const [postId, setPostId] = useState('');
    const [deletePost, {loading: delLoading, error: delError, called}] = useMutation(DELETE_POST, {
        onCompleted: (data) => {
            console.log(data.deletePost)
            setPostId('')
        },
        onError: (err) => {
            console.log(`Server error: ${err.message}`);
        },
         
    });

    if (loading) return (
        <>
            <div className="flex h-14 p-4 bg-slate-900/40 border border-white/5 rounded-xl animate-pulse"></div>
            <div className="flex flex-col h-26.75 p-4 bg-slate-900/40 border border-white/5 rounded-xl animate-pulse">
                <div className="w-full h-1/2  "></div>
                <div className="w-full h-1/2 pt-2 border-t border-white/5"></div>
            </div>
            <div className="flex flex-col h-26.75 p-4 bg-slate-900/40 border border-white/5 rounded-xl animate-pulse">
                <div className="w-full h-1/2  "></div>
                <div className="w-full h-1/2 pt-2 border-t border-white/5"></div>
            </div>
            <div className="flex flex-col h-26.75 p-4 bg-slate-900/40 border border-white/5 rounded-xl animate-pulse">
                <div className="w-full h-1/2  "></div>
                <div className="w-full h-1/2 pt-2 border-t border-white/5"></div>
            </div>
        </>
    )
    if (error) return <p>Error: {error.message}</p>

    const category = data?.categoryBySlug;
    console.log(category?.posts);

    const handleDelete = (id: string) => {
        if(user) {
            setPostId(id)
            deletePost({
                variables: {
                    id
                },
                refetchQueries: [
                    {
                        query: GET_POSTS_BY_CATEGORY,
                        variables: { slug: categorySlug }
                    }
                ]
            })
        } else {
            console.log("Not authenticate!");
        }
    }

    const handleLike = (post: any) => {
        if(user){
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
        } else {
            return
        }
    };

    const handleDislike = (post: any) => {
        if(user){
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
  

    // console.log(data?.posts[0].isLiked);

    return (
        <div className="flex flex-col gap-3 min-h-full p-4">
        {/* Шапка категории */}
        <div className="flex h-14 items-center justify-between px-4 rounded-xl bg-slate-900/40 border border-white/5 backdrop-blur-xs mb-2">
            <h2 className="text-lg font-semibold text-slate-100 tracking-wide">
                {category?.name}
            </h2>
            {user && (
                <Link
                    to={CREATE_NEW_POST}
                    className="flex items-center h-9 px-4 text-sm font-medium text-slate-200! rounded-lg bg-emerald-500/80 hover:text-white! hover:bg-emerald-500 transition-all duration-200 hover:shadow-lg hover:shadow-emerald-500/20 active:scale-95"
                >Create
                </Link>
            )}
        </div>

        {/* Список постов */}
        {category?.posts?.map((post) => (
            <Link 
                key={post.id}  
                to={`/post/${categorySlug}/${post.id}`} 
                className="group flex flex-col gap-2 p-4 rounded-xl bg-slate-900/40  border border-white/5 backdrop-blur-xs transition-all duration-200 hover:bg-slate-900/60 hover:border-white/10 hover:shadow-lg hover:-translate-y-0.5"
            >
                {/* Верхняя строка: Название и Дата */}
                <div className="flex justify-between items-start gap-4">
                    <h3 className="font-semibold text-slate-200 text-base md:text-lg leading-snug group-hover:text-sky-400 transition-colors">
                        {post.title}
                    </h3>
                    <span className="text-xs font-medium text-slate-500 shrink-0 mt-1">
                        {convertDateFn(Number(post.createdAt))}
                    </span>
                </div>

                {/* Нижняя строка: Интерактив и Автор / Удаление */}
                <div className="flex justify-between items-center mt-2 pt-2 border-t border-white/5">
                    
                    {/* Блок Лайков и Дизлайков */}
                    <div className="flex items-center gap-3">
                        {/* Лайк */}
                        <div 
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleLike(post);
                            }} 
                            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium cursor-pointer transition-all ${
                                post.isLiked 
                                    ? 'bg-rose-500/20 text-rose-400' 
                                    : 'bg-slate-800/60 text-slate-400 hover:bg-rose-500/10 hover:text-rose-400'
                            }`}
                        >
                            <FaHeart className={post.isLiked ? 'text-rose-500' : 'text-slate-400'} />
                            <span>{post.likesCount}</span>
                        </div>

                        {/* Дизлайк */}
                        <div 
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleDislike(post);
                            }} 
                            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium cursor-pointer transition-all ${
                                post.isDisliked 
                                    ? 'bg-blue-500/20 text-blue-400' 
                                    : 'bg-slate-800/60 text-slate-400 hover:bg-blue-500/10 hover:text-blue-400'
                            }`}
                        >
                            <BiSolidDislike className={post.isDisliked ? 'text-blue-500' : 'text-slate-400'} />
                            <span>{post.dislikesCount}</span>
                        </div>  
                    </div>

                    {/* Блок Авторства или Кнопки удаления */}
                    <div className="flex items-center gap-3 text-xs text-slate-400">
                        {post.user?.login === user?.login ? (
                            <button
                                disabled={delLoading && post.id === postId} 
                                className="opacity-0 group-hover:opacity-100 flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white transition-all duration-200 disabled:bg-slate-800 disabled:text-slate-600 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                                onClick={(e) => {
                                    e.preventDefault();
                                    handleDelete(post.id);
                                }}
                            >
                                <span>Delete</span>
                                <svg 
                                    className="w-3.5 h-3.5 stroke-current" 
                                    viewBox="0 0 24 24" 
                                    fill="none" 
                                    xmlns="http://w3.org"
                                    strokeWidth="2"
                                >
                                    <circle cx="12" cy="12" r="9" />
                                    <path d="M15 9L9 15M9 9L15 15" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </button>
                        ) : (
                            <span className="font-normal text-slate-400">
                                Author: <span className="text-slate-300 font-medium">{post.user?.login || "Anonymous"}</span>
                            </span>
                        )}
                    </div>
                </div>
            </Link>
        ))}

        {/* Сообщение, если постов нет */}
        {category && category.posts.length === 0 && (
            <p className="text-center text-slate-500 text-sm py-8 bg-slate-900/20 rounded-xl border border-dashed border-white/5">
                No posts in this section.
            </p>
        )}
    </div>
        // <div className="flex flex-col min-h-full bg-slate-800/90">
        //     <div className="flex h-12 items-center mb-1 bg-slate-800/90 text-white text-shadow-2xs text-shadow-gray-900">
        //         <h2 className="text-lg text-center w-full font-semibold text-shadow-sm text-shadow-black/60 tracking-wide" 
        //         >{category?.name}</h2>
        //         {user &&
        //             <Link
        //                 to={CREATE_NEW_POST}
        //                 className="flex items-center m-2 h-9 px-3 text-gray-200 border-l border-slate-700 bg-emerald-600/80 hover:text-white hover:bg-emerald-500/70 hover:shadow-2xl hover:shadow-emerald-500"
        //             >Create</Link>
        //         }
        //     </div>
        //     {category?.posts?.map((post) => 
        //         // <div key={post.id} className="post-wrapper hover:scale-[101%]">
        //         <Link 
        //             key={post.id}  
        //             to={`/post/${categorySlug}/${post.id}`} 
        //             className="post-wrapper"
        //         >
        //             <div className="flex text-gray-300 justify-between shadow-2xs shadow-gray-300/30 py-1 px-3">
        //                 <h2 className="post-title">{post.title}</h2>
        //                 <span className="text-xs font-sans">{convertDateFn(Number(post.createdAt))}</span>
        //             </div>

        //             <div className="flex items-center justify-between py-1 px-3 text-sm">
        //                 <div className="flex">
        //                     {/* Лайк */}
        //                     <div 
        //                         onClick={(e) => {
        //                             e.preventDefault()
        //                             e.stopPropagation()
        //                             handleLike(post)
        //                         }} 
        //                         className="like-dislike-wrapper"
        //                     >
        //                         {post.isLiked ? <FaHeart className="like-red"/> : <FaHeart className="like-gray"/>}
        //                         <p className="text-xs">{post.likesCount}</p>
        //                     </div>
        //                     {/* Дизлайк */}
        //                     <div 
        //                         onClick={(e) => {
        //                             e.preventDefault()
        //                             e.stopPropagation()
        //                             handleDislike(post)
        //                         }} 
        //                         className="like-dislike-wrapper"
        //                     >
        //                         {post.isDisliked ? <BiSolidDislike className="dislike-blue" /> : <BiSolidDislike className="dislike-gray"/>}
        //                         <p className="text-xs">{post.dislikesCount}</p>
        //                     </div>  
        //                 </div>

        //                 <div className="flex text-xs text-gray-300/70">
        //                     {post.isOwner && user
        //                         ?
        //                         <button
        //                             disabled={delLoading && post.id === postId} 
        //                             className="group flex items-center w-auto mb-2 mt-1 py-1.5 px-2 border-2 cursor-grab border-red-500 rounded-md text-gray-200 bg-red-500 transition-all duration-200 hover:text-white hover:bg-red-600 hover:border-red-600 hover:shadow-lg hover:shadow-red-500/30 active:scale-95 active:bg-red-700 active:border-red-700 disabled:bg-gray-500 disabled:border-gray-700"
        //                             // className="group flex items-center w-auto py-1.5 px-2 border-2 cursor-grab border-red-300 rounded-md text-gray-200 bg-red-500 hover:text-white hover:bg-red-600/70 disabled:bg-gray-500 disabled:border-gray-700"
        //                             onClick={(e) => {
        //                                 e.preventDefault()
        //                                 handleDelete(post.id)
        //                             }}
        //                         >Delete
        //                         <svg 
        //                             className="w-4 h-4 ml-1 stroke-gray-200 stroke-2 group-hover:stroke-white" 
        //                             viewBox="0 0 24 24" 
        //                             fill="none" 
        //                             xmlns="http://w3.org"
        //                             >
        //                             <circle cx="12" cy="12" r="9" />
        //                             <path d="M15 9L9 15M9 9L15 15" strokeLinecap="round" strokeLinejoin="round"/>
        //                         </svg>
        //                         </button>
        //                         :
        //                         <>
        //                            <span className="inline-flex items-center font-serif mb-2 mt-1">Author:
        //                             <em className="underline decoration-solid ml-0.5">{post.user?.login || "Anonymous"}</em> 
        //                            </span>
        //                             {/* Логин может быть undefined, добавим безопасный фолбек */}
        //                         </>
        //                     }
                            
        //                 </div>
        //             </div>
        //         </Link>
        //         // </div>
        //     )}

        //     {/* Опционально: вывод сообщения, если постов в категории нет */}
        //     {category && category.posts.length === 0 && (
        //         <p className="no_posts_message">No posts in this section.</p>
        //     )}
        // </div>
        // <div className="posts_container">
        //     {data && data.posts.map((post) => 
        //         <div key={post.id} className="post-wrapper">
        //             <Link to={`/posts/${post.id}`}>
        //                 <h4 
        //                     className="post-title"
        //                 >{post.title}</h4>
        //             </Link>
        //             {/* <p className="post_content">{post.content}</p> */}
        //             <div className="post_footer">
        //                 <div className="likes_dislikes_wrapper">
        //                 {/* Лайк */}
        //                     <div onClick={() => handleLike(post)} className="action_item">
        //                         {post.isLiked ? <FaHeart className="like_red"/> : <FaHeart className="like_grey"/>}
        //                         <p className="likes_count">{post.likesCount}</p>
        //                     </div>
        //                 {/* Дизлайк */}
        //                     <div onClick={() => handleDislike(post)} className="action_item">
        //                         {post.isDisliked ? <BiSolidDislike className="dislike_checked" /> : <BiSolidDislike className="dislike_unchecked"/>}
        //                         <p className="likes_count">{post.dislikesCount}</p>
        //                     </div>  
        //                 </div>

        //                 <div className="div_author"><span>author:</span><em>{post.user?.login}</em></div>
        //             </div>
        //         </div>
        //     )}
        // </div>
    );
}

export default Posts;
