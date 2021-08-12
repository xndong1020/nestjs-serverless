import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Connection, Repository } from 'typeorm';

import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>, // private readonly jwtService: JwtService,
  ) {}

  async getAll(): Promise<User[]> {
    return this.usersRepository.find({});
  }
}
