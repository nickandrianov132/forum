import { rule, shield, allow } from 'graphql-shield';
import { GraphQLError } from 'graphql';

// Описываем правило проверки авторизации
const isAuthenticated = rule({ cache: 'contextual' })(
  async (parent, args, context) => {
    if (!context.userId) {
      return new GraphQLError('Sign in please!', {
        extensions: { code: 'UNAUTHENTICATED' },
      });
    }
    return true;
  }
);

// Описываем карту доступа
export const permissions = shield({
  Query: {
    loginUser: allow,  // все могут авторизоваться
    users: allow,        // Список пользователей видят все
    user: isAuthenticated,  // Профиль конкретного юзера — только авторизованные
    posts: allow,
    post: allow 
  },
  Mutation: {
    addUser: allow,      // Регистрация доступна всем
    addLike: isAuthenticated, // Лайк — только авторизованные
    addDislike: isAuthenticated, // Лайк — только авторизованные
    updateUser: isAuthenticated,
    deleteUser: isAuthenticated,
    createPost: isAuthenticated,
    updatePost: isAuthenticated,
    deletePost: isAuthenticated
  },
}, {
  // Что возвращать, если правило не прошло (по умолчанию)
  fallbackError: new GraphQLError('Access denied'),
});