import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CommonModule } from './common/common.module';

import { User } from './users/entities/user.entity';
import { JwtModule } from './jwt/jwt.module';
import { JwtMiddleware } from './jwt/jwt.middleware';
import { APP_INTERCEPTOR } from '@nestjs/core';

@Module({
  imports: [
    GraphQLModule.forRoot({
      debug: false,
      autoSchemaFile: true,
      context: ({ req }) => ({
        user: req ? req['user'] : {},
      }),
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'translation-api-db.cdst1f5th206.ap-southeast-2.rds.amazonaws.com',
      port: 3306,
      username: 'root',
      password: 'Cc51315704',
      database: 'translation-api',
      entities: [User],
      synchronize: true,
      logging: ['error'],
      extra: {
        connectionLimit: 100,
      },
    }),
    JwtModule.forRoot({
      isGlobal: true,
      secretKey: 'ru8BQHkXwR85dpnqnLlmysR8xllkh1mZ',
    }),
    AuthModule,
    UsersModule,
    CommonModule,
    JwtModule,
  ],
  controllers: [],
  providers: [],
})
// export class AppModule {}
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(JwtMiddleware).forRoutes({
      path: 'graphql',
      method: RequestMethod.POST,
    });
  }
}
