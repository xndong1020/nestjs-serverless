import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    GraphQLModule.forRoot({
      debug: false,
      autoSchemaFile: true,
    }),
    TypeOrmModule.forRoot({}),
    AuthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
