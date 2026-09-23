import type { MyContext } from "../../../index.ts";
import { LikeModel } from "../../models/Likes.ts";
import { PostModel } from "../../models/Posts.ts";
import { UserModel  } from "../../models/Users.ts";
import type { Resolvers } from "../../types/resolvers-types.ts";
import { GraphQLError } from 'graphql';
import jwt from "jsonwebtoken"
import { authenticated } from "../../utils/authGuard.ts";
import { env } from "../../config.ts";
import bcrypt from 'bcrypt'; 

// const generateJwt = (login: string, password: string, id: string) => {
// return  jwt.sign(
//         {login, password, id}, 
//         env.JWT_SECRET_KEY || 'SECRET',
//         {expiresIn: '1h'}
//         )
// }

const generateJwt = (login: string, id: string) => {
  return jwt.sign(
    { login, id }, // убрал пароль
    env.JWT_SECRET_KEY || 'SECRET',
    { expiresIn: '5m' }
  );
};
const generateRefreshToken = (id: string) => {
  return jwt.sign(
    { id },
    env.JWT_REFRESH_SECRET || 'REFRESH_SECRET', // Используй другой секрет!
    { expiresIn: '15d' } // Длинный срок
  );
};

const resolvers: Resolvers<MyContext> = {
    Query: {
        me: async (
        _parent: unknown,           // У me нет родителя, поэтому можно указать unknown или any
        _args: unknown,             // У me нет входящих аргументов (в схеме просто me: User), поэтому unknown
        context: MyContext          // Передаем кастомный контекст, где есть userId и loaders
        ) => {
        
        // 1. Проверяем наличие id в контексте
        if (!context.userId) {
            throw new GraphQLError('Not authenticated', {
            extensions: { code: 'UNAUTHENTICATED' },
            });
        }

        // 2. Достаем пользователя из базы по id напрямую
        const currentUser = await UserModel.findById(context.userId);

        // 3. Проверяем, существует ли он
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
            accessToken: generateJwt(user.login!, user.id),
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
                    accessToken: generateJwt(user.login!, user.id),
                    refreshToken: generateRefreshToken(user.id),
                    user: user
                };
            } catch (e) {
                throw new GraphQLError('Session expired. Please log in again', {
                    extensions: { code: 'UNAUTHENTICATED' }
                });
            }
        },
        addUser: async (_, { login, password, email }) => {
            // Хэшируем пароль перед сохранением (salt rounds = 10)
            const hashedPassword = await bcrypt.hash(password, 10);
            
            const newUser = new UserModel({
                login, 
                password: hashedPassword, // сохраняем хэш
                email
            });

            await newUser.save();
            
            // Токен тоже без пароля
            // const token = generateJwt(login, newUser.id);
            // return { user: newUser, token: token };
            return { 
            user: newUser, 
            accessToken: generateJwt(login, newUser.id),
            refreshToken: generateRefreshToken(newUser.id)
        };
        },



        updateUser: authenticated( async (_, {id, ...args}) => {
            const user = await UserModel.findByIdAndUpdate(id, args, {new: true})
            return user
        }),
        deleteUser: authenticated(async (_, { id }) => {
            // 1. Удаляем посты пользователя
            await PostModel.deleteMany({ userId: id });
            
            // 2. Удаляем лайки пользователя 
            await LikeModel.deleteMany({ userId: id });

            // 3. Удаляем самого пользователя
            const result = await UserModel.findByIdAndDelete(id);
            return !!result;
        }),
        // deleteUser: authenticated( async (_, {id}) => {
        //     const result = await UserModel.findByIdAndDelete(id)
        //     return !!result
        // }),
        
    },
    User: {
        posts: async (parent) => await PostModel.find({userId: parent.id}),
        likes: async (parent) => {
            // Находим все объекты лайков по массиву ID из модели User
            return await LikeModel.find({ _id: { $in: parent.likesId } });
        } 
    }
}

export default resolvers;