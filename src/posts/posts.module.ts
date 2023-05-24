import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AtJwtStrategy } from '../auth/strategies/at.strategy';

@Module({
  controllers: [PostsController],
  providers: [PostsService, AtJwtStrategy],
  imports: [PrismaModule],
})
export class PostsModule {}
