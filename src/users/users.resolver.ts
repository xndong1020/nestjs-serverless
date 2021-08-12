import { Resolver } from '@nestjs/graphql';
import { Args, Context, Mutation, Query } from '@nestjs/graphql';

import { User } from './entities/user.entity';
import { UsersService } from './users.service';

@Resolver(of => User)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Query(returns => [User])
  async getUsers(): Promise<User[]> {
    return await this.usersService.getAll();
  }
}
