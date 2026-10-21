import type { MyContext } from "../../../index.ts";
import { LikeModel } from "../../models/Likes.ts";
import { PostModel } from "../../models/Posts.ts";
import { UserModel  } from "../../models/Users.ts";
import type { Resolvers } from "../../types/resolvers-types.ts";
import { GraphQLError } from 'graphql';
import jwt from "jsonwebtoken"
import { authenticated, hasRole } from "../../utils/authGuard.ts";
import { env } from "../../config.ts";
import bcrypt from 'bcrypt'; 
import { MessageModel } from "../../models/Messages.ts";
import { DislikeModel } from "../../models/Dislikes.ts";

const generateJwt = (login: string, id: string, role: string) => {
  return jwt.sign(
    { login, id, role }, 
    env.JWT_SECRET_KEY || 'SECRET',
    { expiresIn: '5m' }
  );
};
const generateRefreshToken = (id: string) => {
  return jwt.sign(
    { id },
    env.JWT_REFRESH_SECRET || 'REFRESH_SECRET', 
    { expiresIn: '15d' } // Длинный срок
  );
};

const resolvers: Resolvers<MyContext> = {
    Query: {
        me: async (
            _parent: unknown,           // У me нет родителя, поэтому указываем unknown или any
            _args: unknown,             // У me нет входящих аргументов (в схеме просто me: User), поэтому unknown
            context: MyContext          // кастомный контекст, где есть userId и loaders
            ) => {
                // 1. Проверка наличия id в контексте
                if (!context.userId) {
                    throw new GraphQLError('Not authenticated', {
                    extensions: { code: 'UNAUTHENTICATED' },
                    });
                }
                // 2. Достся пользователь из базы по id напрямую
                const currentUser = await UserModel.findById(context.userId);
                // 3. Проверка, существует ли он
                if (!currentUser) {
                    throw new GraphQLError('User not found', {
                    extensions: { code: 'UNAUTHENTICATED' },
                    });
                }
                // 4. Возвращаем пользователя (благодаря mappers в codegen TS примет этот объект)
            return currentUser;
        },
        user: authenticated( async (_, {id}) => UserModel.findById(id)),
        users: async () => await UserModel.find(),
    },
    Mutation: {
        loginUser: async (_, { login, password }) => {
            const user = await UserModel.findOne({ login });
            if (!user || !(await bcrypt.compare(password, user.password!))) {
                throw new GraphQLError('Incorrect password or login');
            }

            return {
            accessToken: generateJwt(user.login!, user.id, user.role),
            refreshToken: generateRefreshToken(user.id),
            user: user
        };
        },
        // МУТАЦИЯ ДЛЯ ОБНОВЛЕНИЯ
        refreshToken: async (_, { token }) => {
            try {
                // Проверяем пришедший рефреш-токен
                const payload = jwt.verify(token, env.JWT_REFRESH_SECRET || 'REFRESH_SECRET') as { id: string };
                
                const user = await UserModel.findById(payload.id);
                if (!user) throw new Error();

                // Генерируем новую пару (Rotation)
                return {
                    accessToken: generateJwt(user.login!, user.id, user.role),
                    refreshToken: generateRefreshToken(user.id),
                    user: user
                };
            } catch (e) {
                throw new GraphQLError('Session expired. Please log in again', {
                    extensions: { code: 'UNAUTHENTICATED' }
                });
            }
        },
        addUser: async (_, { login, password, email, avatar }) => {
            // Хэшируем пароль перед сохранением (salt rounds = 10)
            const hashedPassword = await bcrypt.hash(password, 10);
            
            const newUser = new UserModel({
                login, 
                password: hashedPassword, // сохраняем хэш
                email,
                avatar
            });

            await newUser.save();
            
            return { 
            user: newUser, 
            accessToken: generateJwt(login, newUser.id, newUser.role),
            refreshToken: generateRefreshToken(newUser.id)
        };
        },
        updateUser: authenticated( async (_, {id, input}) => {
            
            if (input.password) {
                input.password = await bcrypt.hash(input.password, 10)
            }
            
            const user = await UserModel.findByIdAndUpdate(id, input, {new: true})
            return user
        }),
        deleteUser: authenticated(async (_, { id }) => {
            // 1. Удаляем посты пользователя
            await PostModel.deleteMany({ userId: id });
            // 2. Удаляем лайки пользователя 
            await LikeModel.deleteMany({ userId: id });
            // 3. Удаляем дизлайки пользователя
            await DislikeModel.deleteMany({ userId: id })
            // 4. Удаляем чат-сообщения пользователя
            await MessageModel.deleteMany({ userId: id })
            // 5. Удаляем самого пользователя
            const result = await UserModel.findByIdAndDelete(id);
            return !!result;
        }),
        banUser: hasRole(['Admin', 'Moderator'])(
            async (_, { input }) => {
                const user = await UserModel.findOne({login: input.login});

                if (!user) {
                    throw new GraphQLError('User not found!', {
                        extensions: { code: 'BAD_USER_INPUT' }
                    });
                }
                user.isBanned = true;
                user.bannedReason = input.reason || null;

                if (input.durationInDays && input.durationInDays > 0) {
                    const banEndDate = new Date();
                    banEndDate.setDate(banEndDate.getDate() + input.durationInDays);
                    user.bannedUntil = banEndDate;
                } else {
                    user.bannedUntil = null;
                }

                await user.save();
                console.log(`[Admin] User ${user.login} was banned for ${input.durationInDays} Day(s)!`);
                return true;
            }
        ),
        unbanUser: hasRole(['Admin', 'Moderator']) (
            async (_, { login }) => {
                const user = await UserModel.findOne({ login });
                if (!user) {
                    throw new GraphQLError('User not found!', {
                        extensions: { code: 'BAD_USER_INPUT' }
                    });
                }
                
                user.isBanned = false;
                user.bannedUntil = null;
                user.bannedReason = null;

                await user.save();
                console.log(`[Admin] User ${user.login} was Unbaned!`);
                return true;
            }
        )
    },
    User: {
        messages: async (parent) => {
        return await MessageModel.find({ userId: parent._id });
        },
        posts: async (parent) => await PostModel.find({userId: parent.id}),
        likes: async (parent) => {
            // Находим все объекты лайков по массиву ID из модели User
            return await LikeModel.find({ _id: { $in: parent.likesId } });
        }
    }
}

export default resolvers;