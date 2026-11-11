import { useMutation, useQuery } from "@apollo/client/react";
import { useEffect, useState, type SubmitEvent } from "react";
import { GET_COMMENTS_BY_POST } from "../../graphql/querry/getCommentsByPost";
import { ADD_COMMENT, COMMENT_FIELDS_FRAGMENT } from "../../graphql/mutations/addComment";
import { useAppSelector } from "../../store/hooks";
import { graphql, useFragment } from "../../gql";
import { FaHeart } from "react-icons/fa";
import { BiSolidDislike } from "react-icons/bi";
import { DELETE_COMMENT } from "../../graphql/mutations/deleteComment";
import { UPDATE_COMMENT } from "../../graphql/mutations/updateComment";
import type { CommentFieldsFragment } from "../../gql/graphql";


interface CommentsSectionProps {
    postId: string;
}

const CommentsSection = ({ postId }: CommentsSectionProps ) => {
    const { user } = useAppSelector(state => state.user);
    const [isEdit, setIsEdit] = useState(false);
    const [editedComment, setEditedComment] = useState('');
    const [editedText, setEditedText] = useState('');
    const [page, setPage] = useState(1);
    const [commentText, setCommentText] = useState('');
    const LIMIT = 5;
    const offset = (page - 1) * LIMIT;
    const { data, error, loading: isLoading } = useQuery(GET_COMMENTS_BY_POST, {
        variables: {
            postId,
            limit: LIMIT,
            offset

        },
        fetchPolicy: 'network-only',
    });
    const comments = data?.commentsByPost?.comments || [];
    const totalCount = data?.commentsByPost?.totalCount || 0;
    const totalPages = Math.ceil(totalCount / LIMIT);

    const [createComment, {loading: isSubmitting, error: createError}] = useMutation(ADD_COMMENT);
    const [deleteComment, { error: delError, loading: delLoading }] = useMutation(DELETE_COMMENT, {
        optimisticResponse: {
            __typename: 'Mutation',
            deleteComment: true
        },
        update(cache, { data }, { variables }) {
            if (!data || !data.deleteComment) return;

            const commentId = variables?.id;
            if (!commentId) return;

            cache.evict({
                id: cache.identify({
                    __typename: 'Comment',
                    id: commentId
                })
            });
            cache.gc();
            cache.modify({
                fields: {
                    commentsByPost(existingCommentsData) {
                        if (!existingCommentsData) return existingCommentsData;
                        return {
                            ...existingCommentsData,
                            totalCount: Math.max(0, (existingCommentsData.totalCount || 0))
                        };
                    }
                }
            });
        }
    })
    const [updateComment, { error: updateEror, loading: isUpdating }] = useMutation(UPDATE_COMMENT);

    // Хук автоматического перенаправления на предыдущую страницу при удалении последнего комментария
    useEffect(() => {
        // Если мы ушли дальше первой страницы, загрузка завершена, а массив комментариев пуст
        if (!isLoading && page > 1 && comments.length === 0) {
            if (totalPages > 0 && page > totalPages) {
                // Если общее количество страниц уменьшилось и текущая страница стала больше максимальной
                setPage(totalPages);
            } else {
                // Фолбек: просто делаем шаг назад
                setPage((prev) => Math.max(prev - 1, 1));
            }
        }
    }, [comments.length, page, totalPages, isLoading]);


    const handleSubmit = async (e:  SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!commentText.trim()) return;
        if (!user) return;
  
        try {
            await createComment({
                variables: {
                    postId,
                    content: commentText.trim()
                },
                optimisticResponse: {
                    __typename: 'Mutation',
                    createComment:  {
                        __typename: 'Comment',
                        id: `temp-id-${Date.now()}`,
                        content: commentText,
                        createdAt: new Date().toISOString(),
                        likesCount: 0,
                        dislikesCount: 0,
                        isLiked: false,
                        isDisliked: false,
                        isOwner: true,
                        user: {
                            __typename: 'User',
                            id: user.id,
                            login: user.login,
                            avatar: user.avatar,
                            role: user.role 
                        }
                    } as any
                },
                update(cache, { data }) {
                    if (!data || !data.createComment) return;

                    const commentData = useFragment(COMMENT_FIELDS_FRAGMENT, data.createComment);

                    cache.modify({
                        fields: {
                            commentsByPost(existingCommentsData, { toReference }: any) {
                                if (!existingCommentsData) {
                                    return existingCommentsData;
                                }

                                const newCommentRef = toReference({
                                    __typename: 'Comment',
                                    id: commentData.id,
                                });

                                const isAlreadyAdded = existingCommentsData.comments?.some(
                                    (ref: any) => ref.__ref === newCommentRef.__ref
                                );
                                if (isAlreadyAdded) return existingCommentsData;

                                return {
                                    ...existingCommentsData,
                                    totalCount: (existingCommentsData.totalCount || 0) + 1,
                                    comments: [newCommentRef, ...(existingCommentsData.comments || [])],
                                };
                            }
                        },
                    });
                }

            });
            setCommentText('');
            setPage(1);
        } catch (error) {
            console.error("Sending comment error:", error);
        }
    };
    const handleUpdate = async (comment: CommentFieldsFragment, e: SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!comment) return;
        try {
            await updateComment({
                variables: {
                    id: editedComment,
                    content: editedText,
                },
                optimisticResponse: {
                    __typename: 'Mutation',
                    updateComment: {
                        ...comment,
                        id: editedComment,
                        __typename: 'Comment',
                        content: editedText,
                    }
                }
            })
            setIsEdit(false);
            setEditedComment('');
            setEditedText('');
            console.log(`update text: ${editedText}`);
        } catch (error) {
            console.error("Failed to update comment:", error);
        }
    }

    const handleDelete = async (id: string) => {
        try {
            await deleteComment({
                variables: {
                    id
                }
            });
        } catch (error) {
            
        }
    }

    if (isLoading && page === 1) {
        return <div className="mt-6 text-center text-slate-400 animate-pulse text-sm">Loading...</div>;
    }
    if (error) {
        return <div className="mt-6 text-center text-red-500 border border-red-500/30 bg-red-500/10 p-3 rounded-md text-sm">{error.message}</div>;
    }

    return (
    <div className="mt-6 bg-[#1b2230] border border-[#2e374a] rounded-lg p-5 shadow-xl">
        <h3 className="text-white text-base font-semibold mb-4">
            Comments <span className="text-slate-400 font-normal">({totalCount})</span>
        </h3>

        {/* Text Area */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-2.5 mb-6">
            <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write a response to this post..."
                maxLength={1000}
                disabled={isSubmitting}
                className="w-full min-h-20 bg-[#121722] border border-[#2e374a] rounded-md p-3 text-white text-sm font-sans resize-vertical placeholder-slate-500 transition-colors duration-200 focus:outline-none focus:border-[#ff2a74] focus:ring-1 focus:ring-[#ff2a74]/50 disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <div className="flex justify-end">
                <button
                    type="submit"
                    disabled={isSubmitting || !commentText.trim()}
                    className="bg-[#ff2a74] hover:bg-[#ff2a74]/90 text-white font-medium text-sm py-2 px-5 rounded transition-all duration-200 shadow-[0_0_10px_rgba(255,42,116,0.2)] hover:shadow-[0_0_15px_rgba(255,42,116,0.4)] disabled:bg-[#3b4252] disabled:text-slate-500 disabled:shadow-none disabled:cursor-not-allowed"
                >
                    {isSubmitting ? 'Sending...' : 'Reply'}
                </button>
            </div>
        </form>

        {/* Comment Container */}
        <div 
            className="flex flex-col gap-3 transition-opacity duration-200"
            style={{ opacity: isLoading ? 0.6 : 1 }}
        >
            {comments.length === 0 ? (
                <p className="text-center text-slate-500 text-sm py-8 bg-slate-900/20 rounded-xl border border-dashed border-white/5">
                    No comments yet. Leave the first one!
                </p>
            ) : (
                comments.map((comment) => (
                    <div 
                        key={comment.id} 
                        className="group flex flex-col gap-2 px-4 py-2 rounded-lg bg-slate-900/40 border border-white/5 backdrop-blur-xs transition-colors duration-200 hover:bg-slate-900/60 hover:border-white/10 hover:shadow-lg hover:-translate-y-0.5"
                    >
                        {/* Card Header */}
                        <div className="flex justify-between items-start gap-4">
                            <div 
                                className="flex items-center"
                            >
                                <img
                                    className="w-10 h-10 rounded-full border-2 border-sky-500/40 ring-1" 
                                    src={comment.user.avatar}
                                />
                                <span className="text-sky-400 ml-1.5 font-semibold text-xs tracking-wide">
                                    {comment.user?.login || "Anonymous"}
                                </span>

                            </div>

                            <div className="flex justify-end gap-4 items-center">
                                <span className="text-xs font-medium text-slate-500 shrink-0">
                                    {new Date(comment.createdAt).toLocaleDateString()} at {new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                                {/* Кнопка Edit */}
                                {comment.user?.login === user?.login &&
                                    <button 
                                    onClick={() => {
                                        setIsEdit(state => !state)
                                        setEditedComment(comment.id)
                                        setEditedText(comment.content)
                                    }}
                                    className="p-1 text-slate-500 hover:text-sky-400 transition-colors duration-200"
                                    title="Edit comment"
                                    >
                                        <svg 
                                            xmlns="http://w3.org" 
                                            fill="none" 
                                            viewBox="0 0 24 24" 
                                            strokeWidth={2} 
                                            stroke="currentColor" 
                                            className="w-4 h-4"
                                        >
                                            <path 
                                            strokeLinecap="round" 
                                            strokeLinejoin="round" 
                                            d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" 
                                            />
                                        </svg>
                                    </button>
                                
                                }
                            </div>
                        </div>
                        
                        {/* Card Body */}
                        {isEdit && comment.id === editedComment ?
                            <form onSubmit={(e) => {handleUpdate(comment, e)}} className="flex flex-col gap-2.5 mb-6">
                                <textarea
                                    value={editedText}
                                    onChange={(e) => setEditedText(e.target.value)}
                                    placeholder="Write your comment text here..."
                                    maxLength={1000}
                                    disabled={isUpdating}
                                    className="w-full min-h-20 bg-[#121722] border border-[#2e374a] rounded-md p-3 text-white text-sm font-sans resize-vertical placeholder-slate-500 transition-colors duration-200 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-600/70 disabled:opacity-50 disabled:cursor-not-allowed"
                                />
                                <div className="flex justify-between">
                                    <button
                                        type="button"
                                        disabled={isUpdating}
                                        onClick={() => {
                                            setIsEdit(false)
                                            setEditedComment('')
                                            setEditedText('')
                                        }}
                                        className="bg-blue-700/90 hover:bg-blue-600 text-white font-medium text-sm py-2 px-5 rounded transition-colors duration-200 shadow shadow-blue-700/30 hover:shadow-lg hover:shadow-blue-600/30 disabled:bg-[#3b4252] disabled:text-slate-500 disabled:shadow-none disabled:cursor-not-allowed"
                                    >
                                    Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isUpdating || !editedText.trim()}
                                        className="bg-emerald-500/80 hover:bg-emerald-500 text-white font-medium text-sm py-2 px-5 rounded transition-colors duration-200 shadow shadow-emerald-600/30 hover:shadow-lg hover:shadow-emerald-500/20 disabled:bg-gray-600/80 disabled:text-slate-500 disabled:shadow-none disabled:cursor-not-allowed"

                                    >
                                        {isUpdating ? 'Saving...' : 'Save'}
                                    </button>
                                </div>
                            </form>
                        : 
                            <div className="text-slate-200 text-sm leading-relaxed whitespace-pre-line my-1">
                                {comment.content}
                            </div>
                        }
                    {/* Card footer */}
                    <div className="flex justify-between items-center mt-2 pt-2 border-t border-white/5">
                        
                        {/* Like Dislike block */}
                        <div className="flex items-center gap-3">
                            {/* Like */}
                            <div 
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    // handleLike(post);
                                }} 
                                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium cursor-pointer transition-all ${
                                    comment.isLiked 
                                        ? 'bg-rose-500/20 text-rose-400' 
                                        : 'bg-slate-800/60 text-slate-400 hover:bg-rose-500/10 hover:text-rose-400'
                                }`}
                            >
                                <FaHeart className={comment.isLiked ? 'text-rose-500' : 'text-slate-400'} />
                                <span>{comment.likesCount}</span>
                            </div>

                            {/* Dislike */}
                            <div 
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    // handleDislike(post);
                                }} 
                                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium cursor-pointer transition-all ${
                                    comment.isDisliked 
                                        ? 'bg-blue-500/20 text-blue-400' 
                                        : 'bg-slate-800/60 text-slate-400 hover:bg-blue-500/10 hover:text-blue-400'
                                }`}
                            >
                                <BiSolidDislike className={comment.isDisliked ? 'text-blue-500' : 'text-slate-400'} />
                                <span>{comment.dislikesCount}</span>
                            </div>  
                        </div>

                        {/* Delete btn block */} 
                        <div className="flex items-center gap-3 text-xs text-slate-400">
                            {comment.user?.login === user?.login && 
                                <button
                                    disabled={delLoading} 
                                    className="opacity-0 group-hover:opacity-100 flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white transition-all duration-200 disabled:bg-slate-800 disabled:text-slate-600 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        handleDelete(comment.id);
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
                                
                            }
                        </div>
                    </div>
                    </div>
                ))
            )}
        </div>

        {/* Pagination Section */}
        {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6 text-sm text-slate-200">
                {/*  Prev */}
                <button
                    type="button"
                    onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                    disabled={page === 1 || isLoading}
                    className="px-3 py-1.5 rounded-lg bg-slate-900/40 border border-white/5 backdrop-blur-xs disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer hover:bg-slate-800/60 hover:border-white/10 transition-all duration-150 active:scale-95"
                >
                    Prev
                </button>

                {/* Nubmer buttons */}
                {Array.from({ length: totalPages }, (_, i) => {
                    const pageNumber = i + 1;
                    return (
                        <button
                            type="button"
                            key={pageNumber}
                            onClick={() => setPage(pageNumber)}
                            disabled={isLoading}
                            className={`px-3 py-1.5 rounded-lg border backdrop-blur-xs transition-all duration-150 cursor-pointer ${
                                page === pageNumber
                                    ? "bg-indigo-600/80 border-indigo-500 text-white font-bold shadow-md shadow-indigo-600/10"
                                    : "bg-slate-900/40 border-white/5 text-slate-400 hover:bg-slate-800/60 hover:text-slate-200 hover:border-white/10"
                            }`}
                        >
                            {pageNumber}
                        </button>
                    );
                })}

                {/*  Next */}
                <button
                    type="button"
                    onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={page === totalPages || isLoading}
                    className="px-3 py-1.5 rounded-lg bg-slate-900/40 border border-white/5 backdrop-blur-xs disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer hover:bg-slate-800/60 hover:border-white/10 transition-all duration-150 active:scale-95"
                >
                    Next
                </button>
            </div>
        )}
    </div>
    );
}

export default CommentsSection;
