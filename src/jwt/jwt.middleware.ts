import {
  HttpException,
  HttpStatus,
  Injectable,
  NestMiddleware
} from '@nestjs/common';
import { Request, Response } from 'express';
import { UsersService } from 'src/users/users.service';
import { JwtService } from './jwt.service';

@Injectable()
export class JwtMiddleware implements NestMiddleware {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService
  ) {}

  async use(req: Request, res: Response, next: () => void) {
    // IntrospectionQuery is from Graphql playground auto schema polling
    if (
      req.body.query.includes('IntrospectionQuery') ||
      req.body.query.includes('createUser') ||
      req.body.query.includes('loginUser')
    ) {
      next();
      return;
    }

    const bearerHeader = req.headers['authorization'];
    if (!bearerHeader) throw new Error('Unauthorized.');

    const bearer = bearerHeader.split(' ');
    const bearerToken = bearer[1];
    try {
      const decoded = this.jwtService.verify(bearerToken);
      if (typeof decoded === 'object' && 'id' in decoded) {
        console.log('decoded 1', decoded['id']);
        const user = await this.usersService.getOne({ id: decoded['id'] });

        if (!user) throw new Error('User not found');
        req['user'] = user; // add user object to the request object
      }
    } catch (e) {
      console.log('error', e);
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    next();
  }
}
