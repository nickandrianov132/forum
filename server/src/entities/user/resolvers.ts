import type { MyContext } from "../../../index.ts";
import { LikeModel } from "../../models/Likes.ts";
import { PostModel } from "../../models/Posts.ts";
import { UserModel  } from "../../models/Users.ts";
import type { Resolvers } from "../../types/resolvers-types.ts";
import { GraphQLError } from 'graphql';
import jwt from "jsonwebtoken"
import { authenticated } from "../../utils/authGuard.ts";
import { env } from "../../config.ts";


const generateJwt = (login: string, password: string, id: string) => {
return  jwt.sign(
        {login, password, id}, 
        env.JWT_SECRET_KEY || 'SECRET',
        {expiresIn: '1h'}
        )
}
const resolvers: Resolvers<MyContext> = {
    Query: {
        user: authenticated( async (_, {id}) => UserModel.findById(id)),
        users: async () => await UserModel.find(),
    },
    Mutation: {
        loginUser: async (_, { login, password }) => {
        // 1. Ищем пользователя только по логину
        const user = await UserModel.findOne({ login });
        if (!user) {
            throw new GraphQLError('Invalid credentials');
        }
        // 2. Проверяем пароль (в идеале через bcrypt.compare)
        const isPasswordValid = user.password === password; 
        if (!isPasswordValid) {
            throw new GraphQLError('Invalid credentials');
        }
        if (!user.login || !user.password) {
        throw new GraphQLError('User data is incomplete');
        }
        // 3. Теперь TS уверен, что мы вернем строку
        const token = generateJwt(user.login, user.password, user.id);
        return token
        
        },
        addUser: async (_, {login, password, email}) => {
            const newUser = new UserModel({
                login, password, email
            })
            await newUser.save()
            const token = generateJwt(login, password, newUser.id)
            return { user: newUser, token: token }
        },
        updateUser: authenticated( async (_, {id, ...args}) => {
            const user = await UserModel.findByIdAndUpdate(id, args, {new: true})
            return user
        }),
        deleteUser: authenticated( async (_, {id}) => {
            const result = await UserModel.findByIdAndDelete(id)
            return !!result
        }),
        
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