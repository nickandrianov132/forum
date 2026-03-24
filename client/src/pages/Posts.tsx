
import { useMutation, useQuery } from "@apollo/client/react";
import { GET_POSTS } from "../graphql/querry/getPosts";

import { ADD_LIKE } from "../graphql/mutations/addLike";
import { ADD_DISLIKE } from "../graphql/mutations/addDislike";
import { useAppSelector } from "../store/hooks";
import { Link } from "react-router";
import { FaHeart } from "react-icons/fa";
import { BiSolidDislike } from "react-icons/bi";

// import { graphql } from "../gql";

// const GET_POSTS = graphql(`
//     query getPosts{
//         posts {
//             id
//             title
//             content
//             isDisliked
//             isLiked
//             likes {
//             id
//             }
//             likesCount
//             dislikes {
//             id
//             }
//             dislikesCount
//             user {
//             id 
            // login
//             }
//         }
//     }
// `)  
const Posts = () => {
    const { loading, error, data } = useQuery(GET_POSTS);
    const { accessToken } = useAppSelector((state) => state.user)

    const [addLike] = useMutation(ADD_LIKE);
    const [addDislike] = useMutation(ADD_DISLIKE);

    if (loading) return <p>Loading...</p>
    if (error) return <p>Error: {error.message}</p>

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

    console.log(data?.posts[0].isLiked);

    return (
        <div className="posts_container">
            {data && data.posts.map((post) => 
                <div key={post.id} className="post_wrapper">
                    <Link to={`/posts/${post.id}`}>
                        <h4 
                            className="post_title"
                        >{post.title}</h4>
                    </Link>
                    {/* <p className="post_content">{post.content}</p> */}
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

                        <div className="div_author"><span>author:</span><em>{post.user.login}</em></div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Posts;
