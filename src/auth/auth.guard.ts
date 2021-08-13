import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Observable } from 'rxjs';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(
    context: ExecutionContext
  ): boolean | Promise<boolean> | Observable<boolean> {
    // the context here is http context, wen can convert it to gqlContext
    const gqlContext = GqlExecutionContext.create(context).getContext();
    // the req['user'] will be now available from gqlContext
    // const user = gqlContext['user'];
    const { user }: { user: User } = gqlContext;
    return !!user; // if user is undefined then block the request
  }
}
