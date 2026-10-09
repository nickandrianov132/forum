
import { useMutation, useQuery } from "@apollo/client/react";
import { ADD_LIKE } from "../../graphql/mutations/addLike";
import { ADD_DISLIKE } from "../../graphql/mutations/addDislike";
import { useAppSelector } from "../../store/hooks";
import { Link, useParams } from "react-router";
import { FaHeart } from "react-icons/fa";
import { BiSolidDislike } from "react-icons/bi";
import { GET_CATEGORY_BY_SLUG, GET_POSTS_BY_CATEGORY } from "../../graphql/querry/getPostsByCategory";
import { convertDateFn } from "../../utils/functions";
import { CREATE_NEW_POST } from "../../utils/constants";
import { DELETE_POST } from "../../graphql/mutations/deletePost";
import { useEffect, useState } from "react";

const ITEMS_PER_PAGE = 5;

const Posts = () => {
    const { categorySlug } = useParams<{ categorySlug: string }>();
    const [currentPage, setCurrentPage] = useState(1);
    const targetSlug = categorySlug || "news";   // fallback for slug

    useEffect(() => {
        setCurrentPage(1);
    }, [categorySlug]);

    const { loading: catLoading, error: catError, data: catData } = useQuery(GET_CATEGORY_BY_SLUG, {
        variables: { slug: targetSlug },
        skip: !categorySlug  // if no slug or slug not yet available, skip request
    });

    const category = catData?.categoryBySlug;

    const { loading: postsLoading, error: postsError, data: postsData } = useQuery(GET_POSTS_BY_CATEGORY, {
        variables: {
            slug: targetSlug,
            limit: ITEMS_PER_PAGE,
            offset: (currentPage - 1) * ITEMS_PER_PAGE
        },

        skip: !categorySlug, // if no slug or slug not yet available, skip request
        fetchPolicy: 'cache-and-network',
    });

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

    const isLoading = catLoading || (postsLoading && !postsData);


    if (isLoading) return (
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
    if (catError) return <p>Error loading category: {catError.message}</p>
    if (postsError) return <p>Error loading posts: {postsError.message}</p>

    const paginatedPostsObj = postsData?.postsByCategory;
    const posts = paginatedPostsObj?.posts || [];
    const totalCount = paginatedPostsObj?.totalCount || 0;
    const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);


    // const category = data?.categoryBySlug;
    // console.log(category?.posts);

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
                        variables: { 
                            slug: categorySlug, 
                            limit: ITEMS_PER_PAGE,
                            offset: (currentPage - 1) * ITEMS_PER_PAGE
                        }
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
        {/* Category */}
        <div className="flex h-14 w-9/10 self-center items-center gap-2 justify-between overflow-hidden rounded-xl bg-slate-900/40 border border-white/5 backdrop-blur-xs mb-2">
            <div className="flex h-full rounded-xl items-center flex-3/4">
                <span className="inline-flex animate-once-shine px-5 items-center bg-linear-to-tr from-blue-600 via-indigo-600 to-purple-600/70 text-white font-semibold shadow-xs h-full">Category</span>
                <h2 className="w-full text-center text-2xl font-semibold text-slate-200 tracking-wide">
                    {category?.name}
                </h2>
            </div>
            {user && (
                <Link
                    to={CREATE_NEW_POST}
                    className="flex items-center h-9 px-4 text-sm mr-6 font-medium text-slate-200! rounded-lg bg-emerald-500/80 hover:text-white! hover:bg-emerald-500 transition-all duration-200 hover:shadow-lg hover:shadow-emerald-500/20 active:scale-95"
                >Create
                </Link>
            )}
        </div>

        {/* Posts List */}
        <div 
            className="flex flex-col gap-3 transition-opacity duration-200"
            style={{ opacity: isLoading ? 0.6 : 1 }}
        >
            {posts?.map((post) => (
                <Link 
                    key={post.id}  
                    to={`/post/${categorySlug}/${post.id}`} 
                    className="group flex flex-col gap-2 p-4 rounded-lg bg-slate-900/40  border border-white/5 backdrop-blur-xs transition-all duration-200 hover:bg-slate-900/60 hover:border-white/10 hover:shadow-lg hover:-translate-y-0.5"
                >
                    {/* Post header */}
                    <div className="flex justify-between items-start gap-4">
                        <h3 className="font-semibold text-slate-200 text-base md:text-lg leading-snug group-hover:text-sky-400 transition-colors">
                            {post.title}
                        </h3>
                        <span className="text-xs font-medium text-slate-500 shrink-0 mt-1">
                            {convertDateFn(Number(post.createdAt))}
                        </span>
                    </div>

                    {/* post footer */}
                    <div className="flex justify-between items-center mt-2 pt-2 border-t border-white/5">
                        
                        {/* Like Dislike block */}
                        <div className="flex items-center gap-3">
                            {/* Like */}
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

                            {/* Dislike */}
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

                        {/* Author and Delete btn block */}
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
        </div>

        {/* No posts message */}
        {postsData && postsData.postsByCategory.posts.length === 0 && (
            <p className="text-center text-slate-500 text-sm py-8 bg-slate-900/20 rounded-xl border border-dashed border-white/5">
                No posts in this section.
            </p>
        )}

        {/* Pagination section */}
        {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6 text-sm text-slate-200">
                {/* Button Prev */}
                <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1 || isLoading}
                    className="px-3 py-1.5 rounded-lg bg-slate-900/40 border border-white/5 backdrop-blur-xs disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer hover:bg-slate-800/60 hover:border-white/10 transition-all duration-150 active:scale-95"
                >
                    Prev
                </button>

                {/* Array with Numerical Buttons */}
                {Array.from({ length: totalPages }, (_, i) => {
                    const page = i + 1;
                    return (
                        <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            disabled={isLoading}
                            className={`px-3 py-1.5 rounded-lg border backdrop-blur-xs transition-all duration-150 cursor-pointer ${
                                currentPage === page
                                    ? "bg-indigo-600/80 border-indigo-500 text-white font-bold shadow-md shadow-indigo-600/10"
                                    : "bg-slate-900/40 border-white/5 text-slate-400 hover:bg-slate-800/60 hover:text-slate-200 hover:border-white/10"
                            }`}
                        >
                            {page}
                        </button>
                    );
                })}

                {/* Button Next */}
                <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages || isLoading}
                    className="px-3 py-1.5 rounded-lg bg-slate-900/40 border border-white/5 backdrop-blur-xs disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer hover:bg-slate-800/60 hover:border-white/10 transition-all duration-150 active:scale-95"
                >
                    Next
                </button>
            </div>
        )}
    </div>
)};

export default Posts;