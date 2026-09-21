import { useNavigate, useParams } from "react-router";
import { GET_ONE_POST } from "../graphql/querry/getOnePost";
import { useMutation, useQuery } from "@apollo/client/react";
import { POSTS_ROUTE } from "../utils/constants";
import { useAppSelector } from "../store/hooks";
import { ADD_LIKE } from "../graphql/mutations/addLike";
import { ADD_DISLIKE } from "../graphql/mutations/addDislike";
import { FaHeart } from "react-icons/fa";
import { BiSolidDislike } from "react-icons/bi";
import { useEffect, useState } from "react";
import { UPDATE_POST } from "../graphql/mutations/updatePost";

import Editor from "../components/lexical/Editor.js"; // Тот самый типизированный Editor, который мы собрали
import LexicalHTMLRenderer from "../components/lexical/LexicalHTMLRenderer.js"; // Для отображения контента


const PostDetail = () => {
    const { categorySlug, id } = useParams<{ categorySlug: string, id: string }>();
    const [isEdit, setIsEdit] = useState(false);
    const [postContent, setPostContent] = useState('') // Сюда Lexical будет писать JSON-строку
    const [postTitle, setPostTitle] = useState('')
    const navigate = useNavigate();
    const { accessToken } = useAppSelector((state) => state.user);
    const [addLike] = useMutation(ADD_LIKE);
    const [addDislike] = useMutation(ADD_DISLIKE);
    const { data, loading, error } = useQuery(GET_ONE_POST, {
        variables: { id: id ?? "" },
        skip: !id, // Пропускаем запрос, если id по какой-то причине пуст
    });
    const [updatePost] = useMutation(UPDATE_POST);
    console.log(accessToken);

    // useEffect(() => {
    //     if (loading === false) {
    //         setPostContent(post.content)
    //         setPostTitle(post.title)
    //     }
    // }, [loading])
    useEffect(() => {
        if (data?.post) {
            setPostContent(data.post.content)
            setPostTitle(data.post.title)
        }
    }, [data]);

    // console.log(data);

    const handleLike = (post: any) => {
        if(accessToken.length != 0){
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


    // const handleEditPost = () => {
    //     if (accessToken.length != 0 ){}
    // }

    // const handleUpdatePost = (pId: String, pTitle: String, pContent: String) => {
    //     if(accessToken.length !== 0) {
    //         updatePost({
    //             variables: {id: pId, postTitle: pTitle, postContent: pContent}
    //         })
    //         setIsEdit(false)
    //     }
    // }

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
                optimisticResponse: {
                    updatePost: {
                        __typename: 'Post',
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
    // 1. Сначала обрабатываем состояние загрузки
    if (loading) return <div>Loading...</div>;

    // 2. Обрабатываем ошибку (если есть)
    if (error) {
        console.log(error);
        return <div>Error: {error.message}</div>;
    }

    // 3. Проверяем наличие данных. После этого условия TS поймет, что data определена.
    if (!data || !data.post) {
        return <div>Post not found</div>;
    }

    // Теперь здесь переменная post будет иметь четкий тип без undefined
    const { post } = data;


    return (
        <div className="post-detail">
            <div className="flex flex-col w-25 border border-gray-400">
                <div className="flex items-center justify-center w-full text-xs text-gray-800">
                    <span></span><em>{post.user?.login}</em>
                </div>
                <img className="w-auto p-4 bg-gray-800" src={post.user?.avatar}/>
            </div>
            <div className="flex flex-col text-sm flex-auto">
            { isEdit ? (
                
                <div className="flex flex-col items-start justify-start p-4">
                    <label htmlFor="title">Title of Post:</label>
                    <input
                        id="title" 
                        type="text" 
                        // className="editor_title_input"
                        className="editor-title-input"
                        value={postTitle}
                        onChange={(e) => setPostTitle(e.target.value)}
                    ></input>
                    {/* ЗАМЕНЯЕМ textarea НА LEXICAL */}
                    <Editor 
                        initialContent={post.content} 
                        onChange={(jsonString) => setPostContent(jsonString)} 
                    />
                    {/* <textarea 
                        defaultValue={post.content}
                        onChange={(e) => setPostContent(e.target.value)}
                    ></textarea> */}
                    <button 
                        className="px-3 py-1.5 inline-flex h-fit border border-transparent bg-blue-700 text-shadow-sm/20 text-shadow-emerald-950 text-gray-100 rounded-md transition-colors active:bg-blue-500 hover:bg-blue-600 hover:border-sky-500 hover:text-white hover:shadow-md hover:shadow-blue-500/30"
                        onClick={() => handleUpdatePost(post.id, postTitle, postContent)}
                    >Save</button>
                </div>
                )
                : 
                (
                <div>
                    <div className="flex items-center justify-around bg-gray-400/30 px-2 py-2.5 box-border border-b border-slate-400/40">
                        <h1 className="post-title">{post.title}</h1>
                        {post.isOwner && accessToken.length != 0 &&
                        <button 
                            className="w-fit px-2.5 bg-slate-400 text-sm text-gray-800 border-transparent rounded-md transition-all hover:bg-emerald-400 hover:text-white hover:text-shadow-2xs hover:text-shadow-gray-800 active:scale-95"
                            onClick={() => setIsEdit(isEdit => !isEdit)}
                        >✒️edit</button>
                    }
                    </div>
                    {/* ЗАМЕНЯЕМ <p> НА РЕНДЕРЕР HTML */}
                    <LexicalHTMLRenderer jsonString={post.content} />
                    {/* <p className="post_content_p">{postContent}</p> */}

                </div>
                )
            }
            <div className="post-footer">
                <div className="flex mb-3">
                        {/* Лайк */}
                            <div onClick={() => handleLike(post)} className="flex items-center text-md mr-2">
                                {post.isLiked ? <FaHeart className="like-red"/> : <FaHeart className="like-gray"/>}
                                <p className="text-xs">{post.likesCount}</p>
                            </div>
                        {/* Дизлайк */}
                            <div onClick={() => handleDislike(post)} className="flex items-center text-md">
                                {post.isDisliked ? <BiSolidDislike className="dislike-blue" /> : <BiSolidDislike className="dislike-gray"/>}
                                <p className="text-xs">{post.dislikesCount}</p>
                            </div>  
                </div>
                {/* <span className="like_span">Likes: {post.likesCount}</span>
                <span className="dislike_span">Dislikes: {post.dislikesCount}</span> */}

            </div>
            <button 
                className="post-btn" 
                onClick={() => navigate(`/posts/${categorySlug}`)}
            >Back</button>
        </div>
        </div>
    );
}

export default PostDetail;
