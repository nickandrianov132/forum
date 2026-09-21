import { GraphQLError, type GraphQLResolveInfo  } from 'graphql';
import type { MyContext } from '../../index.ts'; // импорт вашего интерфейса контекста

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
      throw new GraphQLError('User is not authenticated', {
        extensions: { code: 'UNAUTHENTICATED', http: { status: 401 } },
      });
    }
    return next(parent, args, context, info);
  };
};