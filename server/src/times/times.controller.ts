import { Controller, Post, Get, Param, Body } from '@nestjs/common';
import { TimesService } from './times.service';
import { CreateTimeDto } from './dto/create-time.dto';

@Controller('times')
export class timesController {
  constructor(private readonly timesService: TimesService) {}

  @Post('/create')
  async createTime(@Body() createTimeDto: CreateTimeDto) {
    return this.timesService.create(createTimeDto);
  }

  @Get(':id')
  async getTime(@Param('id') id: string) {
    return this.timesService.getTime(id);
  }
}
