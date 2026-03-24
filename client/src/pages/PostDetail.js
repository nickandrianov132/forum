"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _reactRouter = require("react-router");
var _getOnePost = require("../graphql/querry/getOnePost");
var _react = require("@apollo/client/react");
var _constants = require("../utils/constants");
var _hooks = require("../store/hooks");
var _addLike = require("../graphql/mutations/addLike");
var _addDislike = require("../graphql/mutations/addDislike");
var _fa = require("react-icons/fa");
var _bi = require("react-icons/bi");
var _react2 = require("react");
var _updatePost = require("../graphql/mutations/updatePost");
function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t.return && (u = t.return(), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
var PostDetail = function PostDetail() {
  var _useState = (0, _react2.useState)(false),
    _useState2 = _slicedToArray(_useState, 2),
    isEdit = _useState2[0],
    setIsEdit = _useState2[1];
  var _useState3 = (0, _react2.useState)(''),
    _useState4 = _slicedToArray(_useState3, 2),
    postContent = _useState4[0],
    setPostContent = _useState4[1];
  var _useState5 = (0, _react2.useState)(''),
    _useState6 = _slicedToArray(_useState5, 2),
    postTitle = _useState6[0],
    setPostTitle = _useState6[1];
  var navigate = (0, _reactRouter.useNavigate)();
  var _useAppSelector = (0, _hooks.useAppSelector)(function (state) {
      return state.user;
    }),
    accessToken = _useAppSelector.accessToken;
  var _useMutation = (0, _react.useMutation)(_addLike.ADD_LIKE),
    _useMutation2 = _slicedToArray(_useMutation, 1),
    addLike = _useMutation2[0];
  var _useMutation3 = (0, _react.useMutation)(_addDislike.ADD_DISLIKE),
    _useMutation4 = _slicedToArray(_useMutation3, 1),
    addDislike = _useMutation4[0];
  var _useParams = (0, _reactRouter.useParams)(),
    id = _useParams.id;
  var _useQuery = (0, _react.useQuery)(_getOnePost.GET_ONE_POST, {
      variables: {
        id: id !== null && id !== void 0 ? id : ""
      },
      skip: !id // Пропускаем запрос, если id по какой-то причине пуст
    }),
    data = _useQuery.data,
    loading = _useQuery.loading,
    error = _useQuery.error;
  var _useMutation5 = (0, _react.useMutation)(_updatePost.UPDATE_POST),
    _useMutation6 = _slicedToArray(_useMutation5, 1),
    updatePost = _useMutation6[0];
  (0, _react2.useEffect)(function () {
    if (loading === false) {
      setPostContent(post.content);
      setPostTitle(post.title);
    }
  }, [loading]);
  var handleLike = function handleLike(post) {
    if (accessToken.length != 0) {
      addLike({
        variables: {
          postId: post.id
        },
        optimisticResponse: {
          addLike: {
            __typename: 'Post',
            id: post.id,
            // Если уже был лайк — уменьшаем, если нет — увеличиваем
            likesCount: post.isLiked ? post.likesCount - 1 : post.likesCount + 1,
            // Если был дизлайк и мы ставим лайк — дизлайк исчезает (логика бэкенда)
            dislikesCount: post.isDisliked ? post.dislikesCount - 1 : post.dislikesCount,
            isLiked: !post.isLiked,
            isDisliked: false
          }
        }
      });
    } else {
      return;
    }
  };
  var handleDislike = function handleDislike(post) {
    if (accessToken.length != 0) {
      addDislike({
        variables: {
          postId: post.id
        },
        optimisticResponse: {
          addDislike: {
            __typename: 'Post',
            id: post.id,
            dislikesCount: post.isDisliked ? post.dislikesCount - 1 : post.dislikesCount + 1,
            likesCount: post.isLiked ? post.likesCount - 1 : post.likesCount,
            isDisliked: !post.isDisliked,
            isLiked: false
          }
        }
      });
    } else {
      return;
    }
  };

  // const handleEditPost = () => {
  //     if (accessToken.length != 0 ){}
  // }

  var handleUpdatePost = function handleUpdatePost(pId, pTitle, pContent) {
    if (accessToken.length != 0) {
      updatePost({
        variables: {
          id: pId,
          postTitle: pTitle,
          postContent: pContent
        }
      });
      setIsEdit(function (isEdit) {
        return !isEdit;
      });
    }
  };
  // 1. Сначала обрабатываем состояние загрузки
  if (loading) return /*#__PURE__*/React.createElement("div", null, "\u0417\u0430\u0433\u0440\u0443\u0437\u043A\u0430...");

  // 2. Обрабатываем ошибку (если есть)
  if (error) return /*#__PURE__*/React.createElement("div", null, "\u041E\u0448\u0438\u0431\u043A\u0430: ", error.message);

  // 3. Проверяем наличие данных. После этого условия TS поймет, что data определена.
  if (!data || !data.post) {
    return /*#__PURE__*/React.createElement("div", null, "\u041F\u043E\u0441\u0442 \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D");
  }

  // Теперь здесь переменная post будет иметь четкий тип без undefined
  var post = data.post;
  return /*#__PURE__*/React.createElement("div", {
    className: "post_detail"
  }, isEdit ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("input", {
    type: "text",
    defaultValue: postTitle,
    onChange: function onChange(e) {
      return setPostTitle(e.target.value);
    }
  }), /*#__PURE__*/React.createElement("div", {
    className: "post_content_wrapper"
  }, /*#__PURE__*/React.createElement("textarea", {
    defaultValue: post.content,
    onChange: function onChange(e) {
      return setPostContent(e.target.value);
    }
  }), /*#__PURE__*/React.createElement("div", {
    contentEditable: "true",
    content: post.content
  }), /*#__PURE__*/React.createElement("button", {
    className: "post_content_btn_save",
    onClick: function onClick() {
      return handleUpdatePost(post.id, postTitle, postContent);
    }
  }, "Save"))) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("h1", {
    className: "title"
  }, post.title), /*#__PURE__*/React.createElement("div", {
    className: "post_content_wrapper"
  }, /*#__PURE__*/React.createElement("p", {
    className: "post_content_p"
  }, postContent), /*#__PURE__*/React.createElement("div", {
    contentEditable: "true"
  }, post.content), post.isOwner && accessToken.length != 0 && /*#__PURE__*/React.createElement("button", {
    className: "post_content_btn_edit",
    onClick: function onClick() {
      return setIsEdit(function (isEdit) {
        return !isEdit;
      });
    }
  }, "Edit\u2712\uFE0F"))), /*#__PURE__*/React.createElement("div", {
    className: "post_footer"
  }, /*#__PURE__*/React.createElement("div", {
    className: "likes_dislikes_wrapper"
  }, /*#__PURE__*/React.createElement("div", {
    onClick: function onClick() {
      return handleLike(post);
    },
    className: "action_item"
  }, post.isLiked ? /*#__PURE__*/React.createElement(_fa.FaHeart, {
    className: "like_red"
  }) : /*#__PURE__*/React.createElement(_fa.FaHeart, {
    className: "like_grey"
  }), /*#__PURE__*/React.createElement("p", {
    className: "likes_count"
  }, post.likesCount)), /*#__PURE__*/React.createElement("div", {
    onClick: function onClick() {
      return handleDislike(post);
    },
    className: "action_item"
  }, post.isDisliked ? /*#__PURE__*/React.createElement(_bi.BiSolidDislike, {
    className: "dislike_checked"
  }) : /*#__PURE__*/React.createElement(_bi.BiSolidDislike, {
    className: "dislike_unchecked"
  }), /*#__PURE__*/React.createElement("p", {
    className: "likes_count"
  }, post.dislikesCount))), /*#__PURE__*/React.createElement("div", {
    className: "div_author"
  }, /*#__PURE__*/React.createElement("span", {
    className: "author_span"
  }, "Author:"), /*#__PURE__*/React.createElement("em", null, post.user.login))), /*#__PURE__*/React.createElement("button", {
    className: "post_button",
    onClick: function onClick() {
      return navigate(_constants.POSTS_ROUTE);
    }
  }, "Back to posts"));
};
var _default = exports.default = PostDetail;