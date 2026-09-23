
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

    if (loading) return <p>Loading...</p>
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
        <div className="flex flex-col min-h-full bg-slate-200">
            <div className="flex h-10 items-center mb-3 bg-slate-600 text-white text-shadow-2xs text-shadow-gray-900">
                <h2 className="text-lg text-center w-full font-semibold text-shadow-sm text-shadow-black/60 tracking-wide" 
                >{category?.name}</h2>
                {user &&
                    <Link
                        to={CREATE_NEW_POST}
                        className="flex items-center h-full px-3 text-gray-200 border-l border-gray-400 bg-blue-700 hover:text-white hover:bg-blue-600"
                    >Create</Link>
                }
            </div>
            {category?.posts?.map((post) => 
                // <div key={post.id} className="post-wrapper hover:scale-[101%]">
                <Link 
                    key={post.id}  
                    to={`/post/${categorySlug}/${post.id}`} 
                    className="post-wrapper"
                >
                    <div className="flex justify-between shadow-2xs py-1 px-3">
                        <h2 className="post-title">{post.title}</h2>
                        <span className="text-gray-700 text-xs font-sans">{convertDateFn(Number(post.createdAt))}</span>
                    </div>

                    <div className="flex items-center justify-between py-1 px-3 text-sm bg-slate-300 border-transparent rounded-b-sm">
                        <div className="flex">
                            {/* Лайк */}
                            <div 
                                onClick={(e) => {
                                    e.preventDefault()
                                    e.stopPropagation()
                                    handleLike(post)
                                }} 
                                className="like-dislike-wrapper"
                            >
                                {post.isLiked ? <FaHeart className="like-red"/> : <FaHeart className="like-gray"/>}
                                <p className="text-xs">{post.likesCount}</p>
                            </div>
                            {/* Дизлайк */}
                            <div 
                                onClick={(e) => {
                                    e.preventDefault()
                                    e.stopPropagation()
                                    handleDislike(post)
                                }} 
                                className="like-dislike-wrapper"
                            >
                                {post.isDisliked ? <BiSolidDislike className="dislike-blue" /> : <BiSolidDislike className="dislike-gray"/>}
                                <p className="text-xs">{post.dislikesCount}</p>
                            </div>  
                        </div>

                        <div className="flex text-xs text-gray-800">
                            {post.isOwner && user
                                ?
                                <button
                                    disabled={delLoading && post.id === postId} 
                                    className="py-1 px-2 border-2 cursor-grab border-red-300 rounded-md text-gray-200 bg-red-500 hover:text-white hover:bg-red-600/70 disabled:bg-gray-500 disabled:border-gray-700"
                                    onClick={(e) => {
                                        e.preventDefault()
                                        handleDelete(post.id)
                                    }}
                                >Delete</button>
                                :
                                <>
                                   <span className="font-serif">Author:</span>
                                    {/* Логин может быть undefined, добавим безопасный фолбек */}
                                    <em className="underline decoration-solid">{post.user?.login || "Anonymous"}</em> 
                                </>
                            }
                            
                        </div>
                    </div>
                </Link>
                // </div>
            )}

            {/* Опционально: вывод сообщения, если постов в категории нет */}
            {category && category.posts.length === 0 && (
                <p className="no_posts_message">No posts in this section.</p>
            )}
        </div>
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
