import { GraphQLError, type GraphQLResolveInfo  } from 'graphql';
import type { MyContext } from '../../index.ts'; // импорт вашего интерфейса контекста
// Тип для любого резолвера
// type ResolverFn = (parent: any, args: any, context: MyContext, info: any) => any;
// export const authenticated = (next: ResolverFn): ResolverFn => {
//   return (parent, args, context, info) => {
//     if (!context.userId) {
//       throw new GraphQLError('Вы должны быть авторизованы!', {
//         extensions: { code: 'UNAUTHENTICATED' },
//       });
//     }
//     // Если всё ок, вызываем сам резолвер
//     return next(parent, args, context, info);
//   };
// };
type ResolverFn<TParent = any, TArgs = any> = (
  parent: TParent,
  args: TArgs,
  context: MyContext,
  info: GraphQLResolveInfo
) => Promise<any> | any;

export const authenticated = <TParent, TArgs>(
  next: ResolverFn<TParent, TArgs>
): ResolverFn<TParent, TArgs> => {
  return (parent, args, context, info) => {
    if (!context.userId) {
      throw new GraphQLError('You must be logged in!', {
        extensions: { code: 'UNAUTHENTICATED' },
      });
    }
    return next(parent, args, context, info);
  };
};