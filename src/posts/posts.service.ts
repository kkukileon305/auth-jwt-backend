import { HttpException, Injectable } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PostsService {
  constructor(private prisma: PrismaService) {}

  async create({ content, title, authorId, tagNames }: CreatePostDto) {
    try {
      await this.prisma.post.create({
        data: {
          content,
          title,
          authorId,
          tags: {
            connectOrCreate: tagNames.map((tagName) => ({
              where: {
                tagName,
              },
              create: {
                tagName,
              },
            })),
          },
        },
      });

      return {
        message: 'Post created successfully',
      };
    } catch (e) {
      throw new HttpException(e, 403);
    }
  }

  findAll() {
    return this.prisma.post.findMany({
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

  async findByTagName(tagName: string) {
    return this.prisma.post.findMany({
      include: {
        tags: {
          where: {
            tagName,
          },
        },
      },
    });
  }

  async findOne(id: number) {
    const post = await this.prisma.post.findUnique({
      where: {
        id,
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

    if (!post) {
      throw new HttpException('Post not found', 403);
    }

    return post;
  }

  async addLike(id: number, userId: string) {
    try {
      await this.prisma.post.update({
        where: {
          id,
        },
        data: {
          likeUsers: {
            connect: {
              id: userId,
            },
          },
        },
      });
    } catch (e) {
      throw new HttpException(e, 403);
    }

    return {
      message: 'add like',
    };
  }

  async removeLike(id: number, userId: string) {
    try {
      await this.prisma.post.update({
        where: {
          id,
        },
        data: {
          likeUsers: {
            disconnect: {
              id: userId,
            },
          },
        },
      });
    } catch (e) {
      throw new HttpException(e, 403);
    }

    return {
      message: 'remove like',
    };
  }
}
