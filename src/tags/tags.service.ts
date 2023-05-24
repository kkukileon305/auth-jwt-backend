import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TagsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.tag.findMany();
  }

  async getPostsByTagName(tagName: string) {
    return this.prisma.post.findMany({
      where: {
        tags: {
          some: {
            tagName,
          },
        },
      },
      include: {
        tags: true,
        author: {
          select: {
            id: true,
            username: true,
          },
        },
        likeUsers: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });
  }
}
