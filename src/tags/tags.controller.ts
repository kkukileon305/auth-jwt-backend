import { Controller, Get, Param } from '@nestjs/common';
import { TagsService } from './tags.service';
import { ApiTags } from '@nestjs/swagger';

@Controller('tags')
@ApiTags('Tags')
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Get()
  findAll() {
    return this.tagsService.findAll();
  }

  @Get(':tagName')
  getPostsByTagName(@Param('tagName') tagName: string) {
    return this.tagsService.getPostsByTagName(tagName);
  }
}
