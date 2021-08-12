import { Resolver, Query } from '@nestjs/graphql';

@Resolver()
export class AuthResolver {
  @Query(() => Boolean)
  async isGood(): Promise<boolean> {
    return true;
  }
}
