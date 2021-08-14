import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from '../src/auth/auth.module';
import { CommonModule } from '../src/common/common.module';
import { JwtModule } from '../src/jwt/jwt.module';
import { User } from '../src/users/entities/user.entity';
import { UsersModule } from '../src/users/users.module';
import { Repository } from 'typeorm';
import { UsersService } from '../src/users/users.service';

describe('UserModule (e2e)', () => {
  let app: INestApplication;
  let usersService: UsersService;
  let userRepository: Repository<User>;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        GraphQLModule.forRoot({
          debug: false,
          autoSchemaFile: true,
          context: ({ req }) => ({
            user: req ? req['user'] : {}
          })
        }),
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [User],
          logging: true,
          synchronize: true
        }),
        JwtModule.forRoot({
          isGlobal: true,
          secretKey: 'ru8BQHkXwR85dpnqnLlmysR8xllkh1mZ'
        }),
        AuthModule,
        UsersModule,
        CommonModule,
        JwtModule
      ]
    }).compile();

    app = module.createNestApplication();
    await app.init();

    userRepository = module.get('UserRepository');
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(async () => {
    await userRepository.query('DELETE FROM users');
  });

  it.todo('aaa');
});
