import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod
} from '@nestjs/common';
import * as Joi from 'joi';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CommonModule } from './common/common.module';

import { User } from './users/entities/user.entity';
import { JwtModule } from './jwt/jwt.module';
import { JwtMiddleware } from './jwt/jwt.middleware';
import { MysqlConnectionOptions } from 'typeorm/driver/mysql/MysqlConnectionOptions';
import { SqliteConnectionOptions } from 'typeorm/driver/sqlite/SqliteConnectionOptions';

const getTypeOrmConnectionOptions = ():
  | MysqlConnectionOptions
  | SqliteConnectionOptions => {
  if (process.env.NODE_ENV === 'dev') {
    return {
      type: 'mysql',
      host: process.env.DB_HOST,
      port: +process.env.DB_PORT!,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [User],
      synchronize: true,
      logging: ['error'],
      extra: {
        connectionLimit: 100
      }
    } as MysqlConnectionOptions;
  }
  return {
    type: 'sqlite',
    database: ':memory:',
    entities: [User],
    logging: false,
    synchronize: true
  };
};

@Module({
  imports: [
    GraphQLModule.forRoot({
      debug: false,
      autoSchemaFile: true,
      context: ({ req }) => ({
        user: req ? req['user'] : {}
      })
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === 'dev' ? '.env.dev' : '.env.test',
      ignoreEnvFile: process.env.NODE_ENV === 'production',
      validationSchema: Joi.object({
        NODE_ENV: Joi.string().valid('dev', 'production', 'test').required(),
        DB_TYPE: Joi.string().valid('mysql', 'sqlite').required(),
        DB_HOST: Joi.string(),
        DB_PORT: Joi.string(),
        DB_USERNAME: Joi.string(),
        DB_PASSWORD: Joi.string(),
        DB_NAME: Joi.string(),
        SECRET_KEY: Joi.string().required()
      })
    }),
    TypeOrmModule.forRoot({ ...getTypeOrmConnectionOptions() }),
    JwtModule.forRoot({
      isGlobal: true,
      secretKey: process.env.SECRET_KEY!
    }),
    AuthModule,
    UsersModule,
    CommonModule,
    JwtModule
  ],
  controllers: [],
  providers: []
})
// export class AppModule {}
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(JwtMiddleware).forRoutes({
      path: 'graphql',
      method: RequestMethod.POST
    });
  }
}
