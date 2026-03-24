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


const PostDetail = () => {
    const [isEdit, setIsEdit] = useState(false);
    const [postContent, setPostContent] = useState('')
    const [postTitle, setPostTitle] = useState('')
    const navigate = useNavigate();
    const { accessToken } = useAppSelector((state) => state.user);
    const [addLike] = useMutation(ADD_LIKE);
    const [addDislike] = useMutation(ADD_DISLIKE);
    const { id } = useParams<{ id: string }>();
    const { data, loading, error } = useQuery(GET_ONE_POST, {
        variables: { id: id ?? "" },
        skip: !id, // Пропускаем запрос, если id по какой-то причине пуст
    });
    const [updatePost] = useMutation(UPDATE_POST);


    useEffect(() => {
        if (loading === false) {
            setPostContent(post.content)
            setPostTitle(post.title)
        }
    }, [loading])
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

    const handleUpdatePost = (pId: String, pTitle: String, pContent: String) => {
        if(accessToken.length != 0) {
            updatePost({
                variables: {id: pId, postTitle: pTitle, postContent: pContent}
            })
            setIsEdit(isEdit => !isEdit)
        }
    }
    // 1. Сначала обрабатываем состояние загрузки
    if (loading) return <div>Загрузка...</div>;

    // 2. Обрабатываем ошибку (если есть)
    if (error) return <div>Ошибка: {error.message}</div>;

    // 3. Проверяем наличие данных. После этого условия TS поймет, что data определена.
    if (!data || !data.post) {
        return <div>Пост не найден</div>;
    }

    // Теперь здесь переменная post будет иметь четкий тип без undefined
    const { post } = data;


    return (
        <div className="post_detail">
            { isEdit ? 
                <>
                <input 
                    type="text" 
                    defaultValue={postTitle}
                    onChange={(e) => setPostTitle(e.target.value)}
                ></input>
                <div className="post_content_wrapper">
                    <textarea 
                        defaultValue={post.content}
                        onChange={(e) => setPostContent(e.target.value)}
                    ></textarea>
                    <div contentEditable="true" content={post.content}>
                        
                    </div>
                    <button 
                        className="post_content_btn_save"
                        onClick={() => handleUpdatePost(post.id, postTitle, postContent)}
                        >Save</button>
                </div>
                </>
                : 
                <>
                <h1 className="title">{post.title}</h1>
                <div className="post_content_wrapper">
                    <p className="post_content_p">{postContent}</p>
                    <div contentEditable="true">
                        {post.content}
                    </div>
                    {post.isOwner && accessToken.length != 0 &&
                        <button 
                            className="post_content_btn_edit"
                            onClick={() => setIsEdit(isEdit => !isEdit)}
                        >Edit✒️</button>
                    }
                </div>
                </>
            }
            <div className="post_footer">
                <div className="likes_dislikes_wrapper">
                        {/* Лайк */}
                            <div onClick={() => handleLike(post)} className="action_item">
                                {post.isLiked ? <FaHeart className="like_red"/> : <FaHeart className="like_grey"/>}
                                <p className="likes_count">{post.likesCount}</p>
                            </div>
                        {/* Дизлайк */}
                            <div onClick={() => handleDislike(post)} className="action_item">
                                {post.isDisliked ? <BiSolidDislike className="dislike_checked" /> : <BiSolidDislike className="dislike_unchecked"/>}
                                <p className="likes_count">{post.dislikesCount}</p>
                            </div>  
                </div>
                {/* <span className="like_span">Likes: {post.likesCount}</span>
                <span className="dislike_span">Dislikes: {post.dislikesCount}</span> */}
                <div className="div_author">
                    <span className="author_span">Author:</span><em>{post.user.login}</em>
                </div>
            </div>
            <button 
                className="post_button" 
                onClick={() => navigate(POSTS_ROUTE)}
            >Back to posts</button>
        </div>
    );
}

export default PostDetail;
