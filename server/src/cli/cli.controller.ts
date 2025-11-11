import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { CliAuthGuard } from '../auth/guards/cli-auth.guard';

@Controller('cli')
@UseGuards(CliAuthGuard)
export class CliController {
  @Get('me')
  validate(@Request() req) {
    return { user: req.user };
  }

  @Get('ping')
  ping() {
    return { success: true, msg: 'CLI OK' };
  }
}
